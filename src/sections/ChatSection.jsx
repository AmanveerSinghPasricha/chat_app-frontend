// src/sections/ChatSection.jsx
import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Divider,
  List,
  ListItemButton,
  ListItemText,
  TextField,
  Button,
  CircularProgress,
  Alert,
} from "@mui/material";

import { api } from "../api/api";

// E2EE
import {
  ensureDeviceRegistered,
  ensureIdentityKeypair,
  ensurePrekeysUploaded,
  ensureSessionForFriend,
} from "../e2ee/e2eeClient";

import { encryptMessage, decryptMessage } from "../e2ee/cryptoUtils";

export default function ChatSection() {
  const [me, setMe] = useState(null);

  const [friends, setFriends] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(null);

  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);

  const [loadingFriends, setLoadingFriends] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const [sending, setSending] = useState(false);
  const [text, setText] = useState("");
  const [error, setError] = useState("");

  const wsRef = useRef(null);
  const messagesBoxRef = useRef(null);

  const [forceScrollTick, setForceScrollTick] = useState(0);

  const token = localStorage.getItem("access_token");

  // E2EE session state
  const sessionRef = useRef({
    sessionKeyB64: null,
    header: null,
    myDeviceId: null,
    receiverDeviceId: null,
  });

  const scrollToBottom = (behavior = "auto") => {
    setTimeout(() => {
      const el = messagesBoxRef.current;
      if (!el) return;

      el.scrollTo({
        top: el.scrollHeight,
        behavior,
      });
    }, 80);
  };

  const closeSocket = () => {
    try {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    } catch {
      // ignore
    }
  };

  const normalizeError = (e, fallback) => {
    const detail = e?.response?.data?.detail;

    // FastAPI validation errors array
    if (Array.isArray(detail)) {
      return detail.map((x) => x?.msg).filter(Boolean).join(", ") || fallback;
    }

    return detail || e?.response?.data?.message || e?.message || fallback;
  };

  // -----------------------------
  // Fetch Logged-in User (ME)
  // -----------------------------
  const fetchMe = async () => {
    try {
      const res = await api.get("/users/me");
      setMe(res?.data?.data || null);
    } catch (e) {
      setMe(null);
      setError(normalizeError(e, "Failed to fetch user profile"));
    }
  };

  // -----------------------------
  // Fetch Friends
  // -----------------------------
  const fetchFriends = async () => {
    try {
      setError("");
      setLoadingFriends(true);

      const res = await api.get("/friends");
      const data = res?.data?.data;

      setFriends(Array.isArray(data) ? data : []);
    } catch (e) {
      setFriends([]);
      setError(normalizeError(e, "Failed to load friends"));
    } finally {
      setLoadingFriends(false);
    }
  };

  // -----------------------------
  // Open Chat with Friend (E2EE)
  // -----------------------------
  const openChatWithFriend = async (friend) => {
    try {
      setError("");
      setSelectedFriend(friend);
      setConversationId(null);
      setMessages([]);
      closeSocket();
      setLoadingMessages(true);

      if (!token) {
        throw new Error("No token found. Please login again.");
      }

      // 0) E2EE Setup (device + identity + prekeys)
      const myDeviceId = await ensureDeviceRegistered();
      await ensureIdentityKeypair();
      await ensurePrekeysUploaded();

      // 1) Start/Get conversation
      const convRes = await api.post(`/chat/conversations/${friend.id}`);
      const convId = convRes?.data?.data?.conversation_id;

      if (!convId) throw new Error("Conversation ID missing from API response");
      setConversationId(convId);

      // 2) Create session for this friend (derive key + receiverDeviceId)
      const session = await ensureSessionForFriend(friend);

      sessionRef.current.sessionKeyB64 = session.sessionKeyB64;
      sessionRef.current.header = session.header;
      sessionRef.current.myDeviceId = myDeviceId;
      sessionRef.current.receiverDeviceId = session.receiverDeviceId;

      // 3) Load history (encrypted history)
      const msgRes = await api.get(`/chat/messages/${convId}`);
      const msgData = msgRes?.data?.data;
      const list = Array.isArray(msgData) ? msgData : [];

      const decryptedList = await Promise.all(
        list.map(async (m) => {
          if (m?.ciphertext && m?.nonce) {
            try {
              const plain = await decryptMessage(
                sessionRef.current.sessionKeyB64,
                m.ciphertext,
                m.nonce
              );
              return { ...m, content: plain };
            } catch {
              return { ...m, content: "[Unable to decrypt]" };
            }
          }

          // fallback for old plaintext backend messages
          return { ...m, content: m?.content || "" };
        })
      );

      setMessages(decryptedList);
      setForceScrollTick((x) => x + 1);

      // 4) Open WebSocket
      const wsUrl = `wss://chat-app-gbuw.onrender.com/chat/ws/${convId}?token=${token}`;
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log("WS connected");
      };

      ws.onmessage = async (event) => {
        try {
          if (typeof event.data !== "string") return;

          const raw = event.data.trim();

          // ignore non-json payloads
          if (!raw || (raw[0] !== "{" && raw[0] !== "[")) {
            console.log("WS non-json:", raw);
            return;
          }

          const data = JSON.parse(raw);

          // encrypted payload
          if (data?.ciphertext && data?.nonce) {
            let plain = "[Unable to decrypt]";
            try {
              plain = await decryptMessage(
                sessionRef.current.sessionKeyB64,
                data.ciphertext,
                data.nonce
              );
            } catch {
              // ignore
            }

            const msg = { ...data, content: plain };

            setMessages((prev) => {
              const exists = prev.some((m) => String(m.id) === String(msg.id));
              if (exists) return prev;
              return [...prev, msg];
            });

            setForceScrollTick((x) => x + 1);
            return;
          }

          // plaintext payload (old backend)
          if (data?.content) {
            setMessages((prev) => {
              const exists = prev.some((m) => String(m.id) === String(data.id));
              if (exists) return prev;
              return [...prev, data];
            });

            setForceScrollTick((x) => x + 1);
          }
        } catch (err) {
          console.log("WS parse error:", err, "RAW:", event.data);
        }
      };

      ws.onerror = () => {
        setError("WebSocket error. Please try again.");
      };

      ws.onclose = () => {
        console.log("WS closed");
      };

      wsRef.current = ws;
    } catch (e) {
      setError(normalizeError(e, "Failed to open chat"));
    } finally {
      setLoadingMessages(false);
    }
  };

  // -----------------------------
  // Send Message (E2EE)
  // -----------------------------
  const sendMessage = async () => {
    if (!wsRef.current) {
      setError("WebSocket not connected yet.");
      return;
    }

    // must be OPEN
    if (wsRef.current.readyState !== 1) {
      setError("WebSocket still connecting. Try again in 1 second.");
      return;
    }

    const trimmed = text.trim();
    if (!trimmed) return;

    try {
      setSending(true);
      setError("");

      const sessionKeyB64 = sessionRef.current.sessionKeyB64;
      if (!sessionKeyB64) {
        throw new Error("Session key not ready. Re-open chat.");
      }

      const receiverDeviceId = sessionRef.current.receiverDeviceId;
      if (!receiverDeviceId) {
        throw new Error("Receiver device_id missing. Re-open chat.");
      }

      const myDeviceId = sessionRef.current.myDeviceId;
      if (!myDeviceId) {
        throw new Error("Your device_id missing. Re-open chat.");
      }

      // encrypt
      const encrypted = await encryptMessage(sessionKeyB64, trimmed);

      // send encrypted payload
      wsRef.current.send(
        JSON.stringify({
          ciphertext: encrypted.ciphertext,
          nonce: encrypted.nonce,
          sender_device_id: myDeviceId,
          receiver_device_id: receiverDeviceId,
          header: sessionRef.current.header,
          message_type: "text",
        })
      );

      // ✅ IMPORTANT FIX:
      // Show message instantly in UI (optimistic)
      setMessages((prev) => [
        ...prev,
        {
          id: `local-${Date.now()}`,
          sender_id: me?.id,
          content: trimmed,
          created_at: new Date().toISOString(),
        },
      ]);

      setText("");
      setForceScrollTick((x) => x + 1);
    } catch (e) {
      setError(normalizeError(e, "Failed to send message"));
    } finally {
      setSending(false);
    }
  };

  // -----------------------------
  // Initial Load
  // -----------------------------
  useEffect(() => {
    fetchMe();
    fetchFriends();
    return () => closeSocket();
  }, []);

  // scroll whenever messages update
  useEffect(() => {
    if (!selectedFriend) return;
    scrollToBottom("auto");
  }, [forceScrollTick, selectedFriend, conversationId]);

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        gap: 2,
        p: 2,
        overflow: "hidden",
      }}
    >
      {/* LEFT */}
      <Paper
        sx={{
          width: 320,
          bgcolor: "#15182b",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 3,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography fontWeight={900} sx={{ color: "#fff" }}>
            Friends
          </Typography>
          <Typography sx={{ color: "rgba(255,255,255,0.6)", fontSize: 13 }}>
            Select a friend to start chatting
          </Typography>

          {me?.username && (
            <Typography
              sx={{
                mt: 1,
                color: "rgba(255,255,255,0.55)",
                fontSize: 12,
              }}
            >
              Logged in as:{" "}
              <Box component="span" sx={{ color: "#fff", fontWeight: 800 }}>
                {me.username}
              </Box>
            </Typography>
          )}
        </Box>

        <Divider sx={{ borderColor: "rgba(255,255,255,0.08)" }} />

        <Box sx={{ flex: 1, overflowY: "auto" }}>
          {loadingFriends ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
              <CircularProgress />
            </Box>
          ) : friends.length === 0 ? (
            <Typography sx={{ p: 2, color: "rgba(255,255,255,0.6)" }}>
              No friends found.
            </Typography>
          ) : (
            <List disablePadding>
              {friends.map((f) => (
                <ListItemButton
                  key={f.id}
                  selected={selectedFriend?.id === f.id}
                  onClick={() => openChatWithFriend(f)}
                  sx={{
                    "&.Mui-selected": { bgcolor: "rgba(108,99,255,0.18)" },
                    "&.Mui-selected:hover": { bgcolor: "rgba(108,99,255,0.25)" },
                  }}
                >
                  <ListItemText
                    primary={
                      <Typography sx={{ color: "#fff", fontWeight: 800 }}>
                        {f.username}
                      </Typography>
                    }
                    secondary={
                      <Typography sx={{ color: "rgba(255,255,255,0.6)" }}>
                        {f.email}
                      </Typography>
                    }
                  />
                </ListItemButton>
              ))}
            </List>
          )}
        </Box>
      </Paper>

      {/* RIGHT */}
      <Paper
        sx={{
          flex: 1,
          bgcolor: "#15182b",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 3,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
        }}
      >
        {/* HEADER */}
        <Box sx={{ p: 2, borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <Typography variant="h6" fontWeight={900} sx={{ color: "#fff" }}>
            {selectedFriend ? selectedFriend.username : "Chat"}
          </Typography>
          <Typography sx={{ color: "rgba(255,255,255,0.6)", fontSize: 13 }}>
            {selectedFriend ? selectedFriend.email : "Select a friend to begin"}
          </Typography>
        </Box>

        {/* ERROR */}
        {error && (
          <Box sx={{ p: 2 }}>
            <Alert
              severity="error"
              sx={{
                bgcolor: "rgba(211, 47, 47, 0.15)",
                color: "#fff",
                border: "1px solid rgba(211, 47, 47, 0.35)",
              }}
            >
              {String(error)}
            </Alert>
          </Box>
        )}

        {/* MESSAGES */}
        <Box
          ref={messagesBoxRef}
          sx={{
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            p: 2,
            display: "flex",
            flexDirection: "column",
            gap: 1.2,
          }}
        >
          {!selectedFriend ? (
            <Typography sx={{ color: "rgba(255,255,255,0.6)" }}>
              Select a friend from the left panel to load messages.
            </Typography>
          ) : loadingMessages ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
              <CircularProgress />
            </Box>
          ) : messages.length === 0 ? (
            <Typography sx={{ color: "rgba(255,255,255,0.6)" }}>
              No messages yet. Start the conversation.
            </Typography>
          ) : (
            messages.map((m, idx) => {
              const isMine = String(m.sender_id) === String(me?.id);

              return (
                <Box
                  key={m.id || `${idx}-${m.sender_id}-${m.created_at}`}
                  sx={{
                    display: "flex",
                    justifyContent: isMine ? "flex-end" : "flex-start",
                  }}
                >
                  <Box
                    sx={{
                      maxWidth: "70%",
                      px: 2,
                      py: 1.2,
                      borderRadius: 3,
                      bgcolor: isMine ? "#6c63ff" : "rgba(0,0,0,0.35)",
                      border: "1px solid rgba(255,255,255,0.10)",
                    }}
                  >
                    <Typography sx={{ color: "#fff", fontWeight: 600 }}>
                      {m.content}
                    </Typography>

                    <Typography
                      sx={{
                        color: "rgba(255,255,255,0.65)",
                        fontSize: 11,
                        mt: 0.5,
                        textAlign: isMine ? "right" : "left",
                      }}
                    >
                      {m.created_at
                        ? new Date(m.created_at).toLocaleString()
                        : ""}
                    </Typography>
                  </Box>
                </Box>
              );
            })
          )}
        </Box>

        {/* INPUT */}
        <Box
          sx={{
            p: 2,
            borderTop: "1px solid rgba(255,255,255,0.08)",
            display: "flex",
            gap: 1,
          }}
        >
          <TextField
            fullWidth
            placeholder={
              selectedFriend ? "Type a message..." : "Select a friend first..."
            }
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={!selectedFriend || !conversationId}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            sx={{
              input: { color: "#fff" },
              "& .MuiOutlinedInput-root": {
                bgcolor: "rgba(0,0,0,0.25)",
                borderRadius: 3,
                "& fieldset": {
                  borderColor: "rgba(255,255,255,0.12)",
                },
              },
            }}
          />

          <Button
            variant="contained"
            disabled={!selectedFriend || !conversationId || sending}
            onClick={sendMessage}
            sx={{
              bgcolor: "#6c63ff",
              borderRadius: 3,
              fontWeight: 900,
              px: 3,
              textTransform: "none",
            }}
          >
            {sending ? "Sending..." : "Send"}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
