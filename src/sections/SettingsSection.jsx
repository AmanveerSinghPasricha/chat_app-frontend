import React, { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Divider,
  Alert,
  Stack,
  CircularProgress,
} from "@mui/material";

import { api } from "../api/api";

export default function SettingsSection() {
  const [me, setMe] = useState(null);

  // Profile form (PUT /users/me)
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");

  // Username form (PUT /users/me/username)
  const [newUsername, setNewUsername] = useState("");

  // Password form (PUT /users/me/password)
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [loadingMe, setLoadingMe] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingUsername, setSavingUsername] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  const normalizeError = (e, fallback) => {
    return (
      e?.response?.data?.detail ||
      e?.response?.data?.message ||
      e?.message ||
      fallback
    );
  };

  const logoutNow = () => {
    localStorage.removeItem("access_token");
    window.location.href = "/login";
  };

  const fetchMe = async () => {
    try {
      setLoadingMe(true);
      const res = await api.get("/users/me");
      const user = res?.data?.data || null;

      setMe(user);

      // Prefill forms
      setUsername(user?.username || "");
      setBio(user?.bio || "");

      setNewUsername(user?.username || "");
    } catch (e) {
      setMe(null);
      setError(normalizeError(e, "Failed to load profile"));
    } finally {
      setLoadingMe(false);
    }
  };

  useEffect(() => {
    fetchMe();
  }, []);

  // PUT /users/me
  const handleUpdateProfile = async () => {
    try {
      clearMessages();
      setSavingProfile(true);

      const payload = {
        username: username.trim(),
        bio: bio.trim(),
      };

      const res = await api.put("/users/me", payload);

      const updated = res?.data?.data || null;
      setMe(updated);

      setSuccess("Profile updated successfully");
      await fetchMe();
    } catch (e) {
      setError(normalizeError(e, "Failed to update profile"));
    } finally {
      setSavingProfile(false);
    }
  };

  // PUT /users/me/username
  const handleChangeUsername = async () => {
    try {
      clearMessages();

      const trimmed = newUsername.trim();
      if (!trimmed) {
        setError("Username cannot be empty");
        return;
      }

      setSavingUsername(true);

      await api.put("/users/me/username", {
        username: trimmed,
      });

      setSuccess("Username updated successfully");
      await fetchMe();
    } catch (e) {
      setError(normalizeError(e, "Failed to update username"));
    } finally {
      setSavingUsername(false);
    }
  };

  // PUT /users/me/password
  const handleChangePassword = async () => {
    try {
      clearMessages();

      if (!currentPassword.trim() || !newPassword.trim()) {
        setError("Please fill current password and new password");
        return;
      }

      if (newPassword.trim().length < 6) {
        setError("New password must be at least 6 characters");
        return;
      }

      setSavingPassword(true);

      await api.put("/users/me/password", {
        current_password: currentPassword,
        new_password: newPassword,
      });

      setSuccess("Password updated successfully. Please login again.");

      // clear fields
      setCurrentPassword("");
      setNewPassword("");

      // backend says login again -> logout
      setTimeout(() => logoutNow(), 700);
    } catch (e) {
      setError(normalizeError(e, "Failed to update password"));
    } finally {
      setSavingPassword(false);
    }
  };

  // DELETE /users/me
  const handleDeleteAccount = async () => {
    try {
      clearMessages();

      const ok = window.confirm(
        "Are you sure you want to delete your account? This will disable your profile."
      );
      if (!ok) return;

      setDeleting(true);

      await api.delete("/users/me");

      setSuccess("Account deleted successfully");
      setTimeout(() => logoutNow(), 700);
    } catch (e) {
      setError(normalizeError(e, "Failed to delete account"));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Box sx={{ p: 3, height: "100%", overflow: "auto" }}>
      <Typography variant="h5" fontWeight={900} sx={{ mb: 2, color: "#fff" }}>
        Settings
      </Typography>

      {/* Alerts */}
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

      {loadingMe ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Stack spacing={3}>
          {/* CARD 1: Profile */}
          <Paper
            sx={{
              bgcolor: "#15182b",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 3,
              p: 3,
            }}
          >
            <Typography fontWeight={900} sx={{ color: "#fff", mb: 1 }}>
              Update Profile
            </Typography>

            <Typography sx={{ color: "rgba(255,255,255,0.6)", mb: 2 }}>
              Update your username and bio.
            </Typography>

            <Stack spacing={2}>
              <TextField
                label="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                fullWidth
                InputLabelProps={{ style: { color: "rgba(255,255,255,0.6)" } }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    bgcolor: "rgba(0,0,0,0.25)",
                    color: "#fff",
                    borderRadius: 3,
                  },
                }}
              />

              <TextField
                label="Bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                fullWidth
                multiline
                minRows={3}
                InputLabelProps={{ style: { color: "rgba(255,255,255,0.6)" } }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    bgcolor: "rgba(0,0,0,0.25)",
                    color: "#fff",
                    borderRadius: 3,
                  },
                }}
              />

              <Button
                variant="contained"
                onClick={handleUpdateProfile}
                disabled={savingProfile}
                sx={{
                  bgcolor: "#6c63ff",
                  borderRadius: 3,
                  fontWeight: 900,
                  textTransform: "none",
                  py: 1.2,
                }}
              >
                {savingProfile ? "Saving..." : "Save Profile"}
              </Button>
            </Stack>
          </Paper>

          {/* CARD 2: Change Username */}
          <Paper
            sx={{
              bgcolor: "#15182b",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 3,
              p: 3,
            }}
          >
            <Typography fontWeight={900} sx={{ color: "#fff", mb: 1 }}>
              Change Username
            </Typography>

            <Typography sx={{ color: "rgba(255,255,255,0.6)", mb: 2 }}>
              This will update only your username.
            </Typography>

            <Stack spacing={2}>
              <TextField
                label="New Username"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                fullWidth
                InputLabelProps={{ style: { color: "rgba(255,255,255,0.6)" } }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    bgcolor: "rgba(0,0,0,0.25)",
                    color: "#fff",
                    borderRadius: 3,
                  },
                }}
              />

              <Button
                variant="contained"
                onClick={handleChangeUsername}
                disabled={savingUsername}
                sx={{
                  bgcolor: "#6c63ff",
                  borderRadius: 3,
                  fontWeight: 900,
                  textTransform: "none",
                  py: 1.2,
                }}
              >
                {savingUsername ? "Updating..." : "Update Username"}
              </Button>
            </Stack>
          </Paper>

          {/* CARD 3: Change Password */}
          <Paper
            sx={{
              bgcolor: "#15182b",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 3,
              p: 3,
            }}
          >
            <Typography fontWeight={900} sx={{ color: "#fff", mb: 1 }}>
              Change Password
            </Typography>

            <Typography sx={{ color: "rgba(255,255,255,0.6)", mb: 2 }}>
              After changing password you will be logged out.
            </Typography>

            <Stack spacing={2}>
              <TextField
                label="Current Password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                fullWidth
                InputLabelProps={{ style: { color: "rgba(255,255,255,0.6)" } }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    bgcolor: "rgba(0,0,0,0.25)",
                    color: "#fff",
                    borderRadius: 3,
                  },
                }}
              />

              <TextField
                label="New Password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                fullWidth
                InputLabelProps={{ style: { color: "rgba(255,255,255,0.6)" } }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    bgcolor: "rgba(0,0,0,0.25)",
                    color: "#fff",
                    borderRadius: 3,
                  },
                }}
              />

              <Button
                variant="contained"
                onClick={handleChangePassword}
                disabled={savingPassword}
                sx={{
                  bgcolor: "#6c63ff",
                  borderRadius: 3,
                  fontWeight: 900,
                  textTransform: "none",
                  py: 1.2,
                }}
              >
                {savingPassword ? "Updating..." : "Update Password"}
              </Button>
            </Stack>
          </Paper>

          {/* CARD 4: Delete Account */}
          <Paper
            sx={{
              bgcolor: "rgba(211, 47, 47, 0.08)",
              border: "1px solid rgba(211, 47, 47, 0.35)",
              borderRadius: 3,
              p: 3,
            }}
          >
            <Typography fontWeight={900} sx={{ color: "#fff", mb: 1 }}>
              Delete Account
            </Typography>

            <Typography sx={{ color: "rgba(255,255,255,0.75)", mb: 2 }}>
              This will disable your account (soft delete).
            </Typography>

            <Divider sx={{ borderColor: "rgba(255,255,255,0.08)", mb: 2 }} />

            <Button
              variant="contained"
              onClick={handleDeleteAccount}
              disabled={deleting}
              sx={{
                bgcolor: "#d32f2f",
                borderRadius: 3,
                fontWeight: 900,
                textTransform: "none",
                py: 1.2,
                "&:hover": {
                  bgcolor: "#b71c1c",
                },
              }}
            >
              {deleting ? "Deleting..." : "Delete My Account"}
            </Button>
          </Paper>
        </Stack>
      )}
    </Box>
  );
}
