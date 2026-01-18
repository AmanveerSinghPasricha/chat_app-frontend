import React, { useEffect, useState } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Divider,
  Alert,
  CircularProgress,
  Stack,
} from "@mui/material";

import { api } from "../api/api";

export default function DiscoverSection() {
  const [users, setUsers] = useState([]);
  const [requests, setRequests] = useState([]);

  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingRequests, setLoadingRequests] = useState(false);

  const [actionLoadingId, setActionLoadingId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  const normalizeArray = (res) => {
    const data = res?.data?.data;
    return Array.isArray(data) ? data : [];
  };

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const res = await api.get("/users");
      setUsers(normalizeArray(res));
    } catch (e) {
      setUsers([]);
      setError(e?.response?.data?.detail || "Failed to load users");
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchRequests = async () => {
    try {
      setLoadingRequests(true);
      const res = await api.get("/friends/requests");
      setRequests(normalizeArray(res));
    } catch (e) {
      setRequests([]);
      setError(e?.response?.data?.detail || "Failed to load friend requests");
    } finally {
      setLoadingRequests(false);
    }
  };

  const refreshAll = async () => {
    await Promise.all([fetchUsers(), fetchRequests()]);
  };

  useEffect(() => {
    refreshAll();
  }, []);

  const handleSendRequest = async (receiverId) => {
    try {
      clearMessages();
      setActionLoadingId(receiverId);

      await api.post("/friends/request", {
        receiver_id: receiverId,
      });

      setSuccess("Friend request sent!");
      await refreshAll();
    } catch (e) {
      setError(
        e?.response?.data?.detail ||
          e?.response?.data?.message ||
          "Failed to send request"
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleAccept = async (requestId) => {
    try {
      clearMessages();
      setActionLoadingId(requestId);

      await api.post("/friends/accept", {
        request_id: requestId,
      });

      setSuccess("Friend request accepted!");
      await refreshAll();
    } catch (e) {
      setError(
        e?.response?.data?.detail ||
          e?.response?.data?.message ||
          "Failed to accept request"
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (requestId) => {
    try {
      clearMessages();
      setActionLoadingId(requestId);

      await api.post("/friends/reject", {
        request_id: requestId,
      });

      setSuccess("Friend request rejected!");
      await refreshAll();
    } catch (e) {
      setError(
        e?.response?.data?.detail ||
          e?.response?.data?.message ||
          "Failed to reject request"
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <Box sx={{ p: 3, height: "100%", overflow: "hidden" }}>
      <Typography variant="h5" fontWeight={900} sx={{ mb: 2, color: "#fff" }}>
        Discover
      </Typography>

      <Stack spacing={1.5} sx={{ mb: 2 }}>
        {success && (
          <Alert
            severity="success"
            sx={{
              bgcolor: "rgba(46, 125, 50, 0.15)",
              color: "#fff",
              border: "1px solid rgba(46, 125, 50, 0.35)",
            }}
          >
            {success}
          </Alert>
        )}

        {error && (
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
        )}
      </Stack>

      <Box sx={{ height: "calc(100% - 70px)", overflowY: "auto", pr: 1 }}>
        {/* SECTION 1: Friend Requests Received */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h6"
            fontWeight={900}
            sx={{ mb: 1.5, color: "#fff" }}
          >
            Friend Requests Received
          </Typography>

          <Divider sx={{ borderColor: "rgba(255,255,255,0.08)", mb: 2 }} />

          {loadingRequests ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
              <CircularProgress />
            </Box>
          ) : requests.length === 0 ? (
            <Typography sx={{ color: "rgba(255,255,255,0.6)" }}>
              No pending friend requests right now.
            </Typography>
          ) : (
            <Grid container spacing={2}>
              {requests.map((r) => (
                <Grid item xs={12} md={6} lg={4} key={r.id}>
                  <Card
                    sx={{
                      bgcolor: "#15182b",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: 3,
                    }}
                  >
                    <CardContent>
                      <Typography fontWeight={900} sx={{ color: "#fff" }}>
                        New Friend Request
                      </Typography>

                      {/* Sender Details from API */}
                      <Typography fontWeight={900} sx={{ color: "#fff", mt: 1.5 }}>
                        {r?.sender?.username || "Unknown User"}
                      </Typography>

                      <Typography
                        sx={{
                          color: "rgba(255,255,255,0.6)",
                          mt: 0.5,
                          fontSize: 13,
                        }}
                      >
                        {r?.sender?.email || r?.sender_id}
                      </Typography>

                      <Typography
                        sx={{
                          color: "rgba(255,255,255,0.6)",
                          mt: 1,
                          minHeight: 22,
                        }}
                      >
                        {r?.sender?.bio || "No bio added"}
                      </Typography>

                      <Box sx={{ display: "flex", gap: 1.2, mt: 2 }}>
                        <Button
                          fullWidth
                          variant="contained"
                          disabled={actionLoadingId === r.id}
                          onClick={() => handleAccept(r.id)}
                          sx={{
                            bgcolor: "#6c63ff",
                            borderRadius: 3,
                            fontWeight: 800,
                            textTransform: "none",
                          }}
                        >
                          {actionLoadingId === r.id ? "Accepting..." : "Accept"}
                        </Button>

                        <Button
                          fullWidth
                          variant="outlined"
                          disabled={actionLoadingId === r.id}
                          onClick={() => handleReject(r.id)}
                          sx={{
                            borderColor: "rgba(255,255,255,0.25)",
                            color: "#fff",
                            borderRadius: 3,
                            fontWeight: 800,
                            textTransform: "none",
                            "&:hover": {
                              borderColor: "rgba(255,255,255,0.45)",
                            },
                          }}
                        >
                          {actionLoadingId === r.id ? "Rejecting..." : "Reject"}
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>

        {/* SECTION 2: Discover Users */}
        <Box>
          <Typography
            variant="h6"
            fontWeight={900}
            sx={{ mb: 1.5, color: "#fff" }}
          >
            People to Discover
          </Typography>

          <Divider sx={{ borderColor: "rgba(255,255,255,0.08)", mb: 2 }} />

          {loadingUsers ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
              <CircularProgress />
            </Box>
          ) : users.length === 0 ? (
            <Typography sx={{ color: "rgba(255,255,255,0.6)" }}>
              No users available to discover right now.
            </Typography>
          ) : (
            <Grid container spacing={3}>
              {users.map((u) => (
                <Grid item xs={12} md={4} key={u.id}>
                  <Card
                    sx={{
                      bgcolor: "#15182b",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: 3,
                    }}
                  >
                    <CardContent>
                      <Typography fontWeight={900} sx={{ color: "#fff" }}>
                        {u.username}
                      </Typography>

                      <Typography
                        sx={{
                          color: "rgba(255,255,255,0.6)",
                          mt: 1,
                          fontSize: 13,
                        }}
                      >
                        {u.email}
                      </Typography>

                      <Typography
                        sx={{
                          color: "rgba(255,255,255,0.6)",
                          mt: 1,
                          minHeight: 22,
                        }}
                      >
                        {u.bio || "No bio added"}
                      </Typography>

                      <Button
                        fullWidth
                        variant="contained"
                        disabled={actionLoadingId === u.id}
                        onClick={() => handleSendRequest(u.id)}
                        sx={{
                          mt: 2,
                          bgcolor: "#6c63ff",
                          borderRadius: 3,
                          fontWeight: 800,
                          textTransform: "none",
                        }}
                      >
                        {actionLoadingId === u.id
                          ? "Sending..."
                          : "Send Friend Request"}
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </Box>
    </Box>
  );
}
