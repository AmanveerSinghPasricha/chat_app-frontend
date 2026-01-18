import { useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Stack,
  Divider,
  Alert,
} from "@mui/material";
import { api } from "../api/api";

export default function Profile() {
  const [me, setMe] = useState(null);

  const [profileForm, setProfileForm] = useState({
    username: "",
    bio: "",
  });

  const [usernameForm, setUsernameForm] = useState({
    username: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: "",
  });

  const [loadingMe, setLoadingMe] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingUsername, setSavingUsername] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const resetMessages = () => {
    setError("");
    setSuccess("");
  };

  const fetchMe = async () => {
    try {
      resetMessages();
      setLoadingMe(true);

      const res = await api.get("/users/me");
      const user = res.data.data;

      setMe(user);

      setProfileForm({
        username: user.username || "",
        bio: user.bio || "",
      });

      setUsernameForm({
        username: user.username || "",
      });
    } catch (err) {
      setError("Unable to load profile. Please try again.");
    } finally {
      setLoadingMe(false);
    }
  };

  useEffect(() => {
    fetchMe();
  }, []);

  const fieldStyles = {
    input: { color: "#ffffff" },
    "& .MuiOutlinedInput-root": {
      backgroundColor: "#1a1f3a",
      borderRadius: 2,
      "& fieldset": {
        borderColor: "rgba(255,255,255,0.18)",
      },
      "&:hover fieldset": {
        borderColor: "rgba(108,99,255,0.9)",
      },
      "&.Mui-focused fieldset": {
        borderColor: "#6c63ff",
      },
    },
    "& .MuiInputLabel-root": {
      color: "rgba(255,255,255,0.65)",
    },
    "& .MuiInputLabel-root.Mui-focused": {
      color: "#6c63ff",
    },
  };

  const handleUpdateProfile = async () => {
    try {
      resetMessages();
      setSavingProfile(true);

      const payload = {
        username: profileForm.username,
        bio: profileForm.bio,
      };

      const res = await api.put("/users/me", payload);
      setSuccess(res.data.message || "Profile updated successfully.");

      await fetchMe();
    } catch (err) {
      setError("Unable to update profile. Please try again.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangeUsername = async () => {
    try {
      resetMessages();
      setSavingUsername(true);

      const res = await api.put("/users/me/username", usernameForm);
      setSuccess(res.data.message || "Username updated successfully.");

      await fetchMe();
    } catch (err) {
      setError("Unable to change username. Please try again.");
    } finally {
      setSavingUsername(false);
    }
  };

  const handleChangePassword = async () => {
    try {
      resetMessages();
      setSavingPassword(true);

      const res = await api.put("/users/me/password", passwordForm);

      setSuccess(
        res.data.message ||
          "Password updated successfully. Please login again."
      );

      localStorage.removeItem("access_token");
      setTimeout(() => {
        window.location.href = "/login";
      }, 1200);
    } catch (err) {
      setError("Unable to change password. Please check inputs and try again.");
    } finally {
      setSavingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      resetMessages();
      setDeleting(true);

      const res = await api.delete("/users/me");
      setSuccess(res.data.message || "Account deleted successfully.");

      localStorage.removeItem("access_token");
      setTimeout(() => {
        window.location.href = "/login";
      }, 1200);
    } catch (err) {
      setError("Unable to delete account. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#0b0d1a", color: "#ffffff", py: 6 }}>
      <Container maxWidth="md">
        <Stack spacing={2} sx={{ mb: 3 }}>
          <Typography variant="h4" fontWeight={900}>
            Profile
          </Typography>
          <Typography sx={{ color: "rgba(255,255,255,0.65)" }}>
            Manage your account settings for Connect.io
          </Typography>
        </Stack>

        {(error || success) && (
          <Box sx={{ mb: 2 }}>
            {error && (
              <Alert
                severity="error"
                sx={{
                  bgcolor: "rgba(255,255,255,0.06)",
                  color: "#ffffff",
                  border: "1px solid rgba(255,255,255,0.12)",
                }}
              >
                {error}
              </Alert>
            )}
            {success && (
              <Alert
                severity="success"
                sx={{
                  mt: error ? 1 : 0,
                  bgcolor: "rgba(255,255,255,0.06)",
                  color: "#ffffff",
                  border: "1px solid rgba(255,255,255,0.12)",
                }}
              >
                {success}
              </Alert>
            )}
          </Box>
        )}

        {/* MY PROFILE CARD */}
        <Paper
          elevation={14}
          sx={{
            bgcolor: "#15182b",
            borderRadius: 3,
            border: "1px solid rgba(255,255,255,0.08)",
            p: 4,
            mb: 3,
          }}
        >
          <Typography fontWeight={900} sx={{ mb: 1 }}>
            My Account
          </Typography>

          <Typography sx={{ color: "rgba(255,255,255,0.65)", mb: 3 }}>
            {loadingMe
              ? "Loading your profile..."
              : me
              ? `Signed in as ${me.email}`
              : "Profile not loaded"}
          </Typography>

          <Divider sx={{ bgcolor: "rgba(255,255,255,0.10)", mb: 3 }} />

          <Stack spacing={2}>
            <TextField
              label="Username"
              fullWidth
              value={profileForm.username}
              onChange={(e) =>
                setProfileForm({ ...profileForm, username: e.target.value })
              }
              InputLabelProps={{ shrink: true }}
              sx={fieldStyles}
            />

            <TextField
              label="Bio"
              fullWidth
              multiline
              minRows={3}
              value={profileForm.bio}
              onChange={(e) =>
                setProfileForm({ ...profileForm, bio: e.target.value })
              }
              InputLabelProps={{ shrink: true }}
              sx={fieldStyles}
            />

            <Button
              variant="contained"
              size="large"
              disabled={savingProfile}
              onClick={handleUpdateProfile}
              sx={{
                mt: 1,
                py: 1.5,
                fontWeight: 900,
                bgcolor: "#6c63ff",
                boxShadow: "0 10px 26px rgba(108,99,255,0.35)",
                "&:hover": { bgcolor: "#5a52e0" },
              }}
            >
              {savingProfile ? "Saving..." : "Save Profile"}
            </Button>
          </Stack>
        </Paper>

        {/* CHANGE USERNAME */}
        <Paper
          elevation={14}
          sx={{
            bgcolor: "#15182b",
            borderRadius: 3,
            border: "1px solid rgba(255,255,255,0.08)",
            p: 4,
            mb: 3,
          }}
        >
          <Typography fontWeight={900} sx={{ mb: 1 }}>
            Change Username
          </Typography>

          <Typography sx={{ color: "rgba(255,255,255,0.65)", mb: 3 }}>
            Update only your username quickly.
          </Typography>

          <Stack spacing={2}>
            <TextField
              label="New Username"
              fullWidth
              value={usernameForm.username}
              onChange={(e) =>
                setUsernameForm({ username: e.target.value })
              }
              InputLabelProps={{ shrink: true }}
              sx={fieldStyles}
            />

            <Button
              variant="outlined"
              size="large"
              disabled={savingUsername}
              onClick={handleChangeUsername}
              sx={{
                py: 1.5,
                fontWeight: 900,
                borderColor: "rgba(255,255,255,0.28)",
                color: "#ffffff",
                "&:hover": {
                  borderColor: "#6c63ff",
                  color: "#6c63ff",
                },
              }}
            >
              {savingUsername ? "Updating..." : "Update Username"}
            </Button>
          </Stack>
        </Paper>

        {/* CHANGE PASSWORD */}
        <Paper
          elevation={14}
          sx={{
            bgcolor: "#15182b",
            borderRadius: 3,
            border: "1px solid rgba(255,255,255,0.08)",
            p: 4,
            mb: 3,
          }}
        >
          <Typography fontWeight={900} sx={{ mb: 1 }}>
            Change Password
          </Typography>

          <Typography sx={{ color: "rgba(255,255,255,0.65)", mb: 3 }}>
            For security, you’ll be logged out after updating your password.
          </Typography>

          <Stack spacing={2}>
            <TextField
              label="Current Password"
              type="password"
              fullWidth
              value={passwordForm.current_password}
              onChange={(e) =>
                setPasswordForm({
                  ...passwordForm,
                  current_password: e.target.value,
                })
              }
              InputLabelProps={{ shrink: true }}
              sx={fieldStyles}
            />

            <TextField
              label="New Password"
              type="password"
              fullWidth
              value={passwordForm.new_password}
              onChange={(e) =>
                setPasswordForm({
                  ...passwordForm,
                  new_password: e.target.value,
                })
              }
              InputLabelProps={{ shrink: true }}
              sx={fieldStyles}
            />

            <Button
              variant="contained"
              size="large"
              disabled={savingPassword}
              onClick={handleChangePassword}
              sx={{
                py: 1.5,
                fontWeight: 900,
                bgcolor: "#6c63ff",
                "&:hover": { bgcolor: "#5a52e0" },
              }}
            >
              {savingPassword ? "Updating..." : "Update Password"}
            </Button>
          </Stack>
        </Paper>

        {/* DELETE ACCOUNT */}
        <Paper
          elevation={14}
          sx={{
            bgcolor: "#15182b",
            borderRadius: 3,
            border: "1px solid rgba(255,255,255,0.08)",
            p: 4,
          }}
        >
          <Typography fontWeight={900} sx={{ mb: 1 }}>
            Danger Zone
          </Typography>

          <Typography sx={{ color: "rgba(255,255,255,0.65)", mb: 3 }}>
            Deleting your account will disable it permanently.
          </Typography>

          <Button
            variant="outlined"
            fullWidth
            size="large"
            disabled={deleting}
            onClick={handleDeleteAccount}
            sx={{
              py: 1.6,
              fontWeight: 900,
              borderColor: "rgba(255,255,255,0.22)",
              color: "rgba(255,255,255,0.9)",
              "&:hover": {
                borderColor: "#ff5c5c",
                color: "#ff5c5c",
              },
            }}
          >
            {deleting ? "Deleting..." : "Delete My Account"}
          </Button>
        </Paper>
      </Container>
    </Box>
  );
}
