import { useState } from "react";
import {
  TextField,
  Button,
  Alert,
  Box,
  Typography,
} from "@mui/material";
import AuthLayout from "./AuthLayout";
import { api } from "../api/api";

export default function Signup() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    try {
      setError("");
      setLoading(true);

      const res = await api.post("/auth/signup", form);

      localStorage.setItem(
        "access_token",
        res.data.data.access_token
      );

      window.location.href = "/dashboard";
    } catch {
      setError("Unable to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fieldStyles = {
    input: { color: "#ffffff" },
    "& .MuiOutlinedInput-root": {
      backgroundColor: "rgba(255,255,255,0.04)",
      borderRadius: 2,
      "& fieldset": {
        borderColor: "rgba(255,255,255,0.2)",
      },
      "&:hover fieldset": {
        borderColor: "#6c63ff",
      },
      "&.Mui-focused fieldset": {
        borderColor: "#6c63ff",
      },
    },
    "& .MuiInputLabel-root": {
      color: "rgba(255,255,255,0.6)",
    },
    "& .MuiInputLabel-root.Mui-focused": {
      color: "#6c63ff",
    },
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Get started with secure, real-time communication"
    >
      <Box sx={{ mt: 1 }}>
        {error && (
          <Alert
            severity="error"
            sx={{
              mb: 3,
              bgcolor: "rgba(255,255,255,0.06)",
              color: "#ffffff",
              border: "1px solid rgba(255,255,255,0.12)",
            }}
          >
            {error}
          </Alert>
        )}

        <TextField
          label="Username"
          fullWidth
          margin="normal"
          value={form.username}
          onChange={(e) =>
            setForm({ ...form, username: e.target.value })
          }
          InputLabelProps={{ shrink: true }}
          sx={fieldStyles}
        />

        <TextField
          label="Email"
          fullWidth
          margin="normal"
          value={form.email}
          onChange={(e) =>
            setForm({ ...form, email: e.target.value })
          }
          InputLabelProps={{ shrink: true }}
          sx={fieldStyles}
        />

        <TextField
          label="Password"
          type="password"
          fullWidth
          margin="normal"
          value={form.password}
          onChange={(e) =>
            setForm({ ...form, password: e.target.value })
          }
          InputLabelProps={{ shrink: true }}
          sx={fieldStyles}
        />

        <Button
          variant="contained"
          fullWidth
          size="large"
          sx={{
            mt: 4,
            py: 1.6,
            fontWeight: 700,
            bgcolor: "#6c63ff",
            boxShadow: "0 8px 24px rgba(108,99,255,0.35)",
            "&:hover": {
              bgcolor: "#5a52e0",
              boxShadow: "0 12px 32px rgba(108,99,255,0.45)",
            },
          }}
          disabled={loading}
          onClick={handleSignup}
        >
          {loading ? "Creating account..." : "Sign up"}
        </Button>

        <Typography
          align="center"
          sx={{
            mt: 3,
            fontSize: 13,
            color: "rgba(255,255,255,0.55)",
          }}
        >
          By creating an account, you agree to the platform’s terms and privacy
          policy.
        </Typography>
      </Box>
    </AuthLayout>
  );
}
