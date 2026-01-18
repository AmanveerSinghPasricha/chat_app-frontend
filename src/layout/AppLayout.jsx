import React, { useEffect, useState } from "react";
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Badge,
  Avatar,
} from "@mui/material";

import LogoutIcon from "@mui/icons-material/Logout";
import ChatBubbleIcon from "@mui/icons-material/ChatBubble";
import ExploreIcon from "@mui/icons-material/Explore";
import SettingsIcon from "@mui/icons-material/Settings";
import TimelineIcon from "@mui/icons-material/Timeline";
import NotificationsIcon from "@mui/icons-material/Notifications";

import ChatSection from "../sections/ChatSection";
import DiscoverSection from "../sections/DiscoverSection";
import ActivitySection from "../sections/ActivitySection";
import SettingsSection from "../sections/SettingsSection";

import { api } from "../api/api"; // <-- your axios instance

export default function AppLayout() {
  const [activeTab, setActiveTab] = useState("chat");
  const [notifications, setNotifications] = useState(3);

  const [me, setMe] = useState(null);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await api.get("/users/me");
        setMe(res?.data?.data || null);
      } catch (err) {
        console.log("Failed to load /users/me", err);
        setMe(null);
      }
    };

    fetchMe();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    window.location.href = "/login";
  };

  const renderContent = () => {
    if (activeTab === "chat") return <ChatSection />;
    if (activeTab === "discover") return <DiscoverSection />;
    if (activeTab === "activity") return <ActivitySection />;
    if (activeTab === "settings") return <SettingsSection />;
    return null;
  };

  return (
    <Box
      sx={{
        display: "flex",
        width: "100%",
        height: "100vh",
        bgcolor: "#0b0d1a",
        overflow: "hidden",
      }}
    >
      {/* SIDEBAR */}
      <Drawer
        variant="permanent"
        sx={{
          width: 240,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: 240,
            height: "100vh",
            overflow: "hidden",
            boxSizing: "border-box",
            bgcolor: "#0b0d1a",
            color: "#ffffff",
            borderRight: "1px solid rgba(255,255,255,0.08)",
            display: "flex",
            flexDirection: "column",
          },
        }}
      >
        {/* LOGO + TITLE */}
        <Box
          sx={{
            px: 2,
            py: 2,
            display: "flex",
            alignItems: "center",
            gap: 1.2,
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            flexShrink: 0,
          }}
        >
          {/* Logo Box */}
          <Box
            sx={{
              height: 36,
              width: 36,
              borderRadius: 2,
              bgcolor: "#6c63ff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 900,
              color: "#fff",
              boxShadow: "0 0 18px rgba(108,99,255,0.5)",
              flexShrink: 0,
            }}
          >
            C
          </Box>

          {/* Title */}
          <Typography fontWeight={900} fontSize={20} sx={{ color: "#fff" }}>
            Connect.io
          </Typography>
        </Box>

        <List sx={{ flex: 1, overflow: "auto" }}>
          <ListItemButton
            selected={activeTab === "chat"}
            onClick={() => setActiveTab("chat")}
          >
            <ListItemIcon sx={{ color: "#6c63ff", minWidth: 42 }}>
              <ChatBubbleIcon />
            </ListItemIcon>
            <ListItemText primary="Chat" />
          </ListItemButton>

          <ListItemButton
            selected={activeTab === "discover"}
            onClick={() => setActiveTab("discover")}
          >
            <ListItemIcon sx={{ color: "#6c63ff", minWidth: 42 }}>
              <ExploreIcon />
            </ListItemIcon>
            <ListItemText primary="Discover" />
          </ListItemButton>

          <ListItemButton
            selected={activeTab === "activity"}
            onClick={() => setActiveTab("activity")}
          >
            <ListItemIcon sx={{ color: "#6c63ff", minWidth: 42 }}>
              <TimelineIcon />
            </ListItemIcon>
            <ListItemText primary="Activity" />
          </ListItemButton>

          <ListItemButton
            selected={activeTab === "settings"}
            onClick={() => setActiveTab("settings")}
          >
            <ListItemIcon sx={{ color: "#6c63ff", minWidth: 42 }}>
              <SettingsIcon />
            </ListItemIcon>
            <ListItemText primary="Settings" />
          </ListItemButton>
        </List>
      </Drawer>

      {/* MAIN */}
      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          bgcolor: "#0b0d1a",
          color: "#ffffff",
        }}
      >
        <AppBar
          position="static"
          elevation={0}
          sx={{
            bgcolor: "#0b0d1a",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            flexShrink: 0,
          }}
        >
          <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
            {/* LEFT FIXED USER DETAILS (replaces activeTab text) */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
              <Avatar
                sx={{
                  width: 38,
                  height: 38,
                  bgcolor: "#6c63ff",
                  fontWeight: 900,
                }}
              >
                {me?.username?.[0]?.toUpperCase() || "U"}
              </Avatar>

              <Box sx={{ minWidth: 0 }}>
                <Typography
                  sx={{
                    fontWeight: 900,
                    color: "#fff",
                    lineHeight: 1.1,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    maxWidth: { xs: 140, sm: 220, md: 320 },
                  }}
                >
                  {me?.username || "Loading..."}
                </Typography>

                <Typography
                  sx={{
                    fontSize: 12,
                    color: "rgba(255,255,255,0.6)",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    maxWidth: { xs: 140, sm: 220, md: 320 },
                  }}
                >
                  {me?.email || "Fetching profile"}
                </Typography>
              </Box>
            </Box>

            {/* RIGHT ICONS */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <IconButton sx={{ color: "#fff" }} onClick={() => setNotifications(0)}>
                <Badge badgeContent={notifications} color="secondary">
                  <NotificationsIcon />
                </Badge>
              </IconButton>

              <IconButton onClick={handleLogout} sx={{ color: "#ffffff" }}>
                <LogoutIcon />
              </IconButton>
            </Box>
          </Toolbar>
        </AppBar>

        {/* CONTENT AREA */}
        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            overflow: "hidden",
            bgcolor: "#0b0d1a",
          }}
        >
          {renderContent()}
        </Box>
      </Box>
    </Box>
  );
}
