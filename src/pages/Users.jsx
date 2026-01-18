import { useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Stack,
  Alert,
  Button,
} from "@mui/material";
import { api } from "../api/api";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const fetchUsers = async () => {
    try {
      setError("");
      setLoading(true);

      const res = await api.get("/users");
      setUsers(res.data.data || []);
    } catch (err) {
      setError("Unable to load users. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#0b0d1a", color: "#ffffff", py: 6 }}>
      <Container maxWidth="lg">
        <Stack spacing={1} sx={{ mb: 3 }}>
          <Typography variant="h4" fontWeight={900}>
            Users
          </Typography>
          <Typography sx={{ color: "rgba(255,255,255,0.65)" }}>
            People you can connect with on Connect.io
          </Typography>
        </Stack>

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

        <Stack direction="row" justifyContent="flex-end" sx={{ mb: 3 }}>
          <Button
            variant="outlined"
            onClick={fetchUsers}
            disabled={loading}
            sx={{
              borderColor: "rgba(255,255,255,0.28)",
              color: "#ffffff",
              "&:hover": {
                borderColor: "#6c63ff",
                color: "#6c63ff",
              },
            }}
          >
            {loading ? "Refreshing..." : "Refresh"}
          </Button>
        </Stack>

        <Grid container spacing={3}>
          {(users || []).map((u) => (
            <Grid item xs={12} sm={6} md={4} key={u.id}>
              <Paper
                elevation={14}
                sx={{
                  bgcolor: "#15182b",
                  borderRadius: 3,
                  border: "1px solid rgba(255,255,255,0.08)",
                  p: 3,
                  height: "100%",
                }}
              >
                <Typography fontWeight={900} sx={{ mb: 0.5 }}>
                  {u.username || "Unknown User"}
                </Typography>

                <Typography sx={{ color: "rgba(255,255,255,0.65)" }}>
                  {u.email}
                </Typography>

                <Box sx={{ mt: 2 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    disabled
                    sx={{
                      bgcolor: "#6c63ff",
                      fontWeight: 900,
                      py: 1.2,
                      "&:hover": { bgcolor: "#5a52e0" },
                      "&.Mui-disabled": {
                        bgcolor: "rgba(108,99,255,0.35)",
                        color: "rgba(255,255,255,0.75)",
                      },
                    }}
                  >
                    Connect (Coming Soon)
                  </Button>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {!loading && users.length === 0 && !error && (
          <Paper
            elevation={0}
            sx={{
              mt: 4,
              p: 4,
              borderRadius: 3,
              bgcolor: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              textAlign: "center",
            }}
          >
            <Typography fontWeight={800} sx={{ mb: 1 }}>
              No users available
            </Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.65)" }}>
              Once users sign up, they will appear here for connections.
            </Typography>
          </Paper>
        )}
      </Container>
    </Box>
  );
}
