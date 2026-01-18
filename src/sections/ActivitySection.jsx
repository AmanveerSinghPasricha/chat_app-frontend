import React from "react";
import { Paper, Typography, List, ListItem, ListItemText } from "@mui/material";

export default function ActivitySection() {
  const activity = [
    { id: 1, text: "You accepted a friend request from Riya", time: "2m ago" },
    { id: 2, text: "You sent a friend request to Karan", time: "20m ago" },
    { id: 3, text: "You updated your profile bio", time: "1h ago" },
  ];

  return (
    <Paper
      sx={{
        bgcolor: "#15182b",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 3,
        p: 3,
      }}
    >
      <Typography variant="h5" fontWeight={800} sx={{ mb: 2, color: "#fff" }}>
        Activity
      </Typography>

      <List>
        {activity.map((a) => (
          <ListItem
            key={a.id}
            sx={{
              borderRadius: 2,
              mb: 1,
              bgcolor: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <ListItemText
              primary={
                <Typography sx={{ color: "#fff", fontWeight: 700 }}>
                  {a.text}
                </Typography>
              }
              secondary={
                <Typography sx={{ color: "rgba(255,255,255,0.5)" }}>
                  {a.time}
                </Typography>
              }
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
}
