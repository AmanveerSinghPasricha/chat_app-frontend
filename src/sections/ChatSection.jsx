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

  // -----------------------------
  // Fetch Logged-in User (ME)
  // -----------------------------
  const fetchMe = async () => {
    try {
      const res = await api.get("/users/me");
      setMe(res?.data?.data || null);
    } catch (e) {
      setMe(null);
      setError(e?.response?.data?.detail || "Failed to fetch user profile");
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
      setError(e?.response?.data?.detail || "Failed to load friends");
    } finally {
      setLoadingFriends(false);
    }
  };

  // -----------------------------
  // Open Chat with Friend
  // -----------------------------
  const openChatWithFriend = async (friend) => {
    try {
      setError("");
      setSelectedFriend(friend);
      setConversationId(null);
      setMessages([]);

      closeSocket();
      setLoadingMessages(true);

      // 1) Start/Get conversation
      const convRes = await api.post(`/chat/conversations/${friend.id}`);
      const convId = convRes?.data?.data?.conversation_id;

      if (!convId) {
        throw new Error("Conversation ID missing from API response");
      }

      setConversationId(convId);

      // 2) Load history
      const msgRes = await api.get(`/chat/messages/${convId}`);
      const msgData = msgRes?.data?.data;

      setMessages(Array.isArray(msgData) ? msgData : []);

      // ✅ scroll after history is loaded
      setForceScrollTick((x) => x + 1);

      // 3) Open WebSocket
      if (!token) {
        throw new Error("No token found. Please login again.");
      }

      const wsUrl = `wss://chat-app-gbuw.onrender.com/chat/ws/${convId}?token=${token}`;
      const ws = new WebSocket(wsUrl);

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (!data?.content) return;

          setMessages((prev) => {
            const exists = prev.some(
              (m) =>
                String(m.id) === String(data.id) ||
                (m.content === data.content &&
                  String(m.sender_id) === String(data.sender_id) &&
                  String(m.created_at) === String(data.created_at))
            );
            if (exists) return prev;
            return [...prev, data];
          });

          setForceScrollTick((x) => x + 1);
        } catch {
          // ignore invalid payload
        }
      };

      ws.onerror = () => {
        setError("WebSocket error. Please try again.");
      };

      wsRef.current = ws;
    } catch (e) {
      setError(e?.response?.data?.detail || e?.message || "Failed to open chat");
    } finally {
      setLoadingMessages(false);
    }
  };

  // -----------------------------
  // Send Message
  // -----------------------------
  const sendMessage = async () => {
    if (!wsRef.current || wsRef.current.readyState !== 1) {
      setError("WebSocket not connected yet.");
      return;
    }

    const trimmed = text.trim();
    if (!trimmed) return;

    try {
      setSending(true);
      setError("");

      wsRef.current.send(
        JSON.stringify({
          content: trimmed,
        })
      );

      setText("");

      setForceScrollTick((x) => x + 1);
    } catch {
      setError("Failed to send message");
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // -----------------------------
  // MAIN FIX: Always scroll when:
  // - messages change
  // - friend changes
  // - tab switches back (component re-renders)
  // We force it using forceScrollTick
  // -----------------------------
  useEffect(() => {
    if (!selectedFriend) return;
    scrollToBottom("auto");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [forceScrollTick, selectedFriend, conversationId]);

  // -----------------------------
  // UI
  // -----------------------------
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
      {/* LEFT: FRIENDS LIST */}
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
                    "&.Mui-selected": {
                      bgcolor: "rgba(108,99,255,0.18)",
                    },
                    "&.Mui-selected:hover": {
                      bgcolor: "rgba(108,99,255,0.25)",
                    },
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

      {/* RIGHT: CHAT WINDOW */}
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
        <Box
          sx={{
            p: 2,
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            flexShrink: 0,
          }}
        >
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
              {error}
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
            flexShrink: 0,
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
