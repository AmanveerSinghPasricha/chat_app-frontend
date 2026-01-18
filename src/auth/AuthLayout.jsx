import { Box, Container, Paper, Typography } from "@mui/material";

export default function AuthLayout({ title, subtitle, children }) {
  return (
    <Box
      sx={{
        height: "100vh",
        width: "100vw",
        bgcolor: "#0b0d1a",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        m: 0,
        p: 0,
      }}
    >
      <Container
        maxWidth="sm"
        disableGutters
        sx={{
          px: 2,
        }}
      >
        <Paper
          elevation={6}
          sx={{
            width: "100%",
            bgcolor: "#12162a",
            p: 4,
            borderRadius: 3,
            border: "1px solid rgba(255,255,255,0.08)",
            m: 0,
          }}
        >
          <Typography
            variant="h5"
            fontWeight={700}
            gutterBottom
            align="center"
            sx={{ color: "#ffffff" }}
          >
            {title}
          </Typography>

          {subtitle && (
            <Typography
              variant="body2"
              align="center"
              sx={{ color: "rgba(255,255,255,0.65)", mb: 3 }}
            >
              {subtitle}
            </Typography>
          )}

          {children}
        </Paper>
      </Container>
    </Box>
  );
}
