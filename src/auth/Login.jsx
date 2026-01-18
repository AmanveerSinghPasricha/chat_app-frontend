import { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  Stack,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import AuthLayout from "./AuthLayout";
import { api } from "../api/api";

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setError("");
      setLoading(true);

      const res = await api.post("/auth/login", form);

      localStorage.setItem("access_token", res.data.data.access_token);

      window.location.href = "/dashboard";
    } catch (err) {
      setError("Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Login to continue your secure conversations"
    >
      <Box sx={{ mt: 2 }}>
        {error && (
          <Alert
            severity="error"
            sx={{
              mb: 2,
              bgcolor: "rgba(255,255,255,0.06)",
              color: "#ffffff",
              border: "1px solid rgba(255,255,255,0.12)",
              "& .MuiAlert-icon": { color: "#ff6b6b" },
            }}
          >
            {error}
          </Alert>
        )}

        <TextField
          label="Email"
          fullWidth
          margin="normal"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          InputLabelProps={{ shrink: true }}
          sx={fieldStyles}
        />

        <TextField
          label="Password"
          type="password"
          fullWidth
          margin="normal"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          InputLabelProps={{ shrink: true }}
          sx={fieldStyles}
        />

        <Button
          variant="contained"
          fullWidth
          size="large"
          disabled={loading}
          onClick={handleLogin}
          sx={{
            mt: 3,
            py: 1.6,
            fontWeight: 800,
            bgcolor: "#6c63ff",
            boxShadow: "0 10px 26px rgba(108,99,255,0.35)",
            "&:hover": {
              bgcolor: "#5a52e0",
              boxShadow: "0 14px 34px rgba(108,99,255,0.45)",
            },
            "&:disabled": {
              bgcolor: "rgba(108,99,255,0.55)",
              color: "rgba(255,255,255,0.9)",
            },
          }}
        >
          {loading ? "Logging in..." : "Login"}
        </Button>

        <Stack
          direction="row"
          justifyContent="center"
          spacing={1}
          sx={{ mt: 3 }}
        >
          <Typography sx={{ color: "rgba(255,255,255,0.65)", fontSize: 14 }}>
            Don’t have an account?
          </Typography>

          <Typography
            onClick={() => navigate("/signup")}
            sx={{
              color: "#6c63ff",
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
              "&:hover": { color: "#8a84ff" },
            }}
          >
            Create one
          </Typography>
        </Stack>
      </Box>
    </AuthLayout>
  );
}
