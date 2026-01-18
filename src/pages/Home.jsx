import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Paper,
  Stack,
  Divider,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#0b0d1a", color: "#ffffff" }}>
        {/* LOGO HEADER */}
        <Container maxWidth="lg" sx={{ pt: 4 }}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
                {/* Logo placeholder */}
                <Box
                sx={{
                    width: 42,
                    height: 42,
                    borderRadius: 2,
                    bgcolor: "#6c63ff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 900,
                    fontSize: 20,
                }}
                >
                C
                </Box>

                <Typography sx={{ fontSize: 22, fontWeight: 800 }}>
                Connect.io
                </Typography>
            </Stack>
        </Container>
      {/* HERO */}
      <Container maxWidth="lg" sx={{ pt: 14, pb: 12 }}>
        <Grid container spacing={6} alignItems="center" sx={{ mt: "-120px" }}>
          <Grid item xs={12} md={6}>
            <Typography
              variant="h2"
              fontWeight={800}
              lineHeight={1.1}
              gutterBottom
            >
              Secure communication for
              <Box component="span" sx={{ color: "#6c63ff" }}>
                {" "}modern conversations
              </Box>
            </Typography>

            <Typography
              variant="h6"
              sx={{ color: "rgba(255,255,255,0.75)", mb: 4 }}
            >
              Connect.io is a secure real-time chat application with authenticated
              access, private conversations, and reliable message history.
            </Typography>

            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate("/signup")}
                sx={{
                  bgcolor: "#6c63ff",
                  px: 4,
                  py: 1.5,
                  fontWeight: 700,
                  "&:hover": { bgcolor: "#5a52e0" },
                }}
              >
                Get Started
              </Button>

              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate("/login")}
                sx={{
                  borderColor: "rgba(255,255,255,0.4)",
                  color: "#ffffff",
                  px: 4,
                  py: 1.5,
                  "&:hover": {
                    borderColor: "#6c63ff",
                    color: "#6c63ff",
                  },
                }}
              >
                Login
              </Button>
            </Stack>
          </Grid>

          {/* CHAT PREVIEW */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={16}
              sx={{
                height: 360,
                borderRadius: 3,
                bgcolor: "#15182b",
                p: 3,
              }}
            >
              <Typography
                variant="body2"
                sx={{ color: "rgba(255,255,255,0.6)", mb: 2 }}
              >
                Private conversation
              </Typography>

              <Box sx={{ bgcolor: "#1e2240", p: 2, borderRadius: 2, mb: 1 }}>
                <Typography fontWeight={600} sx={{ color: "#ffffff" }}>
                  Alice
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: "rgba(255,255,255,0.8)" }}
                >
                  Did you see the latest update?
                </Typography>
              </Box>

              <Box sx={{ bgcolor: "#1e2240", p: 2, borderRadius: 2 }}>
                <Typography fontWeight={600} sx={{ color: "#ffffff" }}>
                  You
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: "rgba(255,255,255,0.8)" }}
                >
                  Yes, the real-time chat feels super smooth.
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* FEATURES */}
      <Container maxWidth="lg" sx={{ pb: 12 }}>
        <Typography align="center" variant="h4" fontWeight={700} gutterBottom>
          Why people choose Connect.io
        </Typography>

        <Typography
          align="center"
          sx={{ color: "rgba(255,255,255,0.65)", mb: 6 }}
        >
          Designed with security, clarity, and scalability in mind.
        </Typography>

        <Grid container spacing={4}>
          {[
            {
              title: "JWT-Based Authentication",
              text: "All APIs and WebSocket connections are protected using secure JWT authentication.",
            },
            {
              title: "Private Conversations",
              text: "Chats are only available between authenticated users with strict access validation.",
            },
            {
              title: "Real-time Messaging",
              text: "Messages are delivered instantly using secure WebSockets with full history support.",
            },
          ].map((item, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Paper
                sx={{
                  bgcolor: "#1a1f3a",
                  p: 4,
                  borderRadius: 3,
                  height: "100%",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <Typography
                  variant="h6"
                  fontWeight={700}
                  gutterBottom
                  sx={{ color: "#ffffff" }}
                >
                  {item.title}
                </Typography>

                <Typography sx={{ color: "rgba(255,255,255,0.85)" }}>
                  {item.text}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* HOW IT WORKS */}
      <Container maxWidth="md" sx={{ pb: 12 }}>
        <Typography align="center" variant="h4" fontWeight={700} gutterBottom>
          How it works
        </Typography>

        <Divider sx={{ bgcolor: "rgba(255,255,255,0.12)", my: 4 }} />

        <Grid container spacing={4}>
          {[
            "Create your account",
            "Authenticate securely",
            "Start a private conversation",
            "Chat in real time",
          ].map((step, index) => (
            <Grid item xs={12} sm={6} key={index}>
              <Paper
                sx={{
                  bgcolor: "#1a1f3a",
                  p: 3,
                  borderRadius: 2,
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <Typography fontWeight={700} sx={{ color: "#ffffff" }}>
                  {index + 1}. {step}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* CTA */}
      <Box sx={{ bgcolor: "#6c63ff", py: 8 }}>
        <Container maxWidth="md" sx={{ textAlign: "center" }}>
          <Typography variant="h4" fontWeight={800} gutterBottom>
            Start chatting securely today
          </Typography>
          <Typography sx={{ color: "rgba(255,255,255,0.9)" }}>
            Experience real-time, authenticated communication with Connect.io.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}