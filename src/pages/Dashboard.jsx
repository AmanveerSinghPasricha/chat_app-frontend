import React, { useMemo, useState } from "react";

const TABS = {
  CHAT: "chat",
  DISCOVER: "discover",
  ACTIVITY: "activity",
  SETTINGS: "settings",
};

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState(TABS.CHAT);
  const [unreadCount, setUnreadCount] = useState(3);

  const profile = useMemo(
    () => ({
      name: "Amanveer",
      username: "@amanveer",
      bio: "Building Connect.io — chat, discover & connect.",
      status: "Online",
      avatarUrl:
        "https://images.unsplash.com/photo-1520975693411-6b5b0a5f2b6a?w=200&h=200&fit=crop&crop=faces",
    }),
    []
  );

  return (
    <div className="w-full h-full bg-[#160e20] text-white overflow-hidden relative">
      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-40 -left-40 h-[700px] w-[700px] rounded-full bg-purple-500/20 blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 h-[600px] w-[600px] rounded-full bg-blue-500/10 blur-[110px]" />
        <div className="absolute top-[40%] left-[45%] h-[420px] w-[420px] rounded-full bg-fuchsia-800/10 blur-[90px]" />
      </div>

      <div className="relative z-10 w-full h-full min-h-0">
        <div className="h-full w-full max-w-[1920px] mx-auto flex gap-4 md:gap-6 p-4 md:p-6 lg:p-8 min-h-0">
          {/* Sidebar */}
          <Sidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            profile={profile}
          />

          {/* Main Area */}
          <div className="flex-1 flex flex-col gap-4 md:gap-6 min-w-0 min-h-0">
            {/* Header */}
            <Header
              title={getTabTitle(activeTab)}
              unreadCount={unreadCount}
              onBellClick={() => setUnreadCount(0)}
            />

            {/* Content */}
            <div className="flex-1 min-h-0 grid grid-cols-1 xl:grid-cols-[420px_1fr] gap-4 md:gap-6">
              {/* Profile / Info Panel */}
              <GlassPanel className="p-5 md:p-6 overflow-hidden min-h-0">
                <ProfileCard profile={profile} />

                <div className="mt-5">
                  <div className="text-sm font-semibold text-white/90 mb-2">
                    Quick Stats
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <StatBox label="Friends" value="12" />
                    <StatBox label="Requests" value="4" />
                    <StatBox label="Chats" value="7" />
                  </div>
                </div>

                <div className="mt-6">
                  <div className="text-sm font-semibold text-white/90 mb-2">
                    About
                  </div>
                  <div className="text-sm text-white/70 leading-relaxed">
                    This dashboard is single-page. Sidebar clicks only update
                    the center content without routing or new API calls.
                  </div>
                </div>
              </GlassPanel>

              {/* Center Panel */}
              {/* FIX: make this a flex column and force full height */}
              <GlassPanel className="min-h-0 overflow-hidden flex flex-col">
                <div className="flex-1 min-h-0 flex flex-col">
                  {activeTab === TABS.CHAT && <ChatView />}
                  {activeTab === TABS.DISCOVER && <DiscoverView />}
                  {activeTab === TABS.ACTIVITY && <ActivityView />}
                  {activeTab === TABS.SETTINGS && (
                    <SettingsView profile={profile} />
                  )}
                </div>
              </GlassPanel>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------- Components ----------------------------- */

function Sidebar({ activeTab, setActiveTab, profile }) {
  return (
    <div className="hidden md:flex flex-col w-[84px] lg:w-[96px] shrink-0 min-h-0">
      <GlassPanel className="h-full flex flex-col items-center justify-between py-6 min-h-0">
        <div className="w-full flex flex-col items-center gap-6">
          {/* Logo */}
          <div className="w-full flex items-center justify-center">
            <div className="h-11 w-11 rounded-2xl bg-[#8722ec] border border-white/10 flex items-center justify-center shadow-[0_0_22px_rgba(135,34,236,0.5)]">
              <span className="font-extrabold tracking-tight text-white">C</span>
            </div>
          </div>

          {/* Avatar */}
          <div className="relative">
            <div
              className="h-12 w-12 rounded-full bg-cover bg-center border-2 border-white/10 shadow-lg"
              style={{ backgroundImage: `url(${profile.avatarUrl})` }}
              title="Profile"
            />
            <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-[#1e1828]" />
          </div>

          {/* Menu */}
          <div className="flex flex-col gap-3 items-center w-full px-2">
            <SideButton
              active={activeTab === TABS.CHAT}
              onClick={() => setActiveTab(TABS.CHAT)}
              label="Chat"
              icon={<IconChat />}
            />
            <SideButton
              active={activeTab === TABS.DISCOVER}
              onClick={() => setActiveTab(TABS.DISCOVER)}
              label="Discover"
              icon={<IconDiscover />}
            />
            <SideButton
              active={activeTab === TABS.ACTIVITY}
              onClick={() => setActiveTab(TABS.ACTIVITY)}
              label="Activity"
              icon={<IconActivity />}
            />
            <SideButton
              active={activeTab === TABS.SETTINGS}
              onClick={() => setActiveTab(TABS.SETTINGS)}
              label="Settings"
              icon={<IconSettings />}
            />
          </div>
        </div>

        {/* Bottom Brand */}
        <div className="pb-2 w-full flex items-center justify-center">
          <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-white/5 border border-white/10">
            {/* App Icon */}
            <div className="h-7 w-7 rounded-xl bg-[#8722ec] flex items-center justify-center font-extrabold text-white shadow-[0_0_18px_rgba(135,34,236,0.45)]">
              C
            </div>

            {/* App Name */}
            <div className="text-xs font-semibold text-white/80">Connect.io</div>
          </div>
        </div>
      </GlassPanel>
    </div>
  );
}

function SideButton({ active, onClick, icon, label }) {
  return (
    <button
      onClick={onClick}
      className={[
        "w-full h-12 rounded-2xl flex items-center justify-center transition-all border",
        active
          ? "bg-[#8722ec] border-white/10 shadow-[0_0_18px_rgba(135,34,236,0.55)]"
          : "bg-white/0 border-transparent hover:bg-white/5 hover:border-white/10",
      ].join(" ")}
      title={label}
      type="button"
    >
      <span className={active ? "text-white" : "text-white/60"}>{icon}</span>
    </button>
  );
}

function Header({ title, unreadCount, onBellClick }) {
  return (
    <GlassPanel className="px-5 md:px-6 py-4 flex items-center justify-between">
      <div className="min-w-0">
        <div className="text-lg md:text-xl font-extrabold tracking-tight truncate">
          {title}
        </div>
        <div className="text-xs text-white/50">
          Sidebar switches center content only (no route change).
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBellClick}
          className="relative h-10 w-10 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition"
          title="Notifications"
        >
          <IconBell />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 min-w-[20px] px-1 rounded-full bg-[#8722ec] text-[11px] font-bold flex items-center justify-center border border-white/10">
              {unreadCount}
            </span>
          )}
        </button>
      </div>
    </GlassPanel>
  );
}

function ProfileCard({ profile }) {
  return (
    <div className="flex items-center gap-4">
      <div
        className="h-14 w-14 rounded-2xl bg-cover bg-center border border-white/10"
        style={{ backgroundImage: `url(${profile.avatarUrl})` }}
      />
      <div className="min-w-0">
        <div className="font-extrabold text-white truncate">{profile.name}</div>
        <div className="text-sm text-white/60 truncate">{profile.username}</div>
        <div className="mt-1 inline-flex items-center gap-2 text-xs text-white/60">
          <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          {profile.status}
        </div>
      </div>
    </div>
  );
}

function StatBox({ label, value }) {
  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 p-3">
      <div className="text-xs text-white/50">{label}</div>
      <div className="text-lg font-extrabold">{value}</div>
    </div>
  );
}

function GlassPanel({ className = "", children }) {
  return (
    <div
      className={[
        "rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-2xl shadow-[0_10px_40px_rgba(0,0,0,0.35)]",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}

/* ----------------------------- Center Views ---------------------------- */

function ChatView() {
  const [message, setMessage] = useState("");

  const conversations = [
    {
      id: 1,
      name: "Jane Doe",
      time: "Now",
      last: "Absolutely, I'll send over the files now.",
      active: true,
    },
    { id: 2, name: "Project Alpha", time: "2h", last: "Updates on the roadmap?" },
    { id: 3, name: "Alex Morgan", time: "1d", last: "Design files are ready." },
  ];

  const messages = [
    { id: 1, from: "them", text: "Hi Amanveer, quick sync today?" },
    { id: 2, from: "me", text: "Yes, let's do it. Share your agenda." },
    { id: 3, from: "them", text: "Also please review the scope doc." },
  ];

  return (
    // FIX: use flex-1 so it fills the center panel height
    <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[360px_1fr]">
      {/* Conversation list */}
      <div className="border-b lg:border-b-0 lg:border-r border-white/10 min-h-0 flex flex-col">
        <div className="p-5 md:p-6 flex items-center justify-between">
          <div className="text-xl font-extrabold">Messages</div>
          <button
            type="button"
            className="h-9 w-9 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center"
            title="New chat"
          >
            <IconPlus />
          </button>
        </div>

        <div className="px-5 md:px-6 pb-5">
          <div className="h-11 rounded-2xl bg-black/30 border border-white/10 flex items-center gap-2 px-3">
            <IconSearch />
            <input
              className="w-full bg-transparent outline-none text-sm text-white placeholder:text-white/40"
              placeholder="Search conversations..."
            />
          </div>
        </div>

        <div className="flex-1 min-h-0 px-3 pb-4 overflow-y-auto">
          {conversations.map((c) => (
            <button
              key={c.id}
              type="button"
              className={[
                "w-full text-left p-3 rounded-2xl border transition mb-2",
                c.active
                  ? "bg-white/10 border-white/10"
                  : "bg-white/0 border-transparent hover:bg-white/5 hover:border-white/10",
              ].join(" ")}
            >
              <div className="flex items-center justify-between">
                <div className="font-bold truncate">{c.name}</div>
                <div className="text-xs text-white/50">{c.time}</div>
              </div>
              <div className="text-sm text-white/60 truncate mt-1">{c.last}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat window */}
      <div className="min-h-0 flex flex-col">
        <div className="p-5 md:p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-11 w-11 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
              <IconUser />
            </div>
            <div className="min-w-0">
              <div className="font-extrabold truncate">Jane Doe</div>
              <div className="text-xs text-white/50 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                Online
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="h-10 w-10 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center">
              <IconPhone />
            </button>
            <button className="h-10 w-10 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center">
              <IconVideo />
            </button>
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto p-5 md:p-6 space-y-3">
          <div className="flex justify-center">
            <span className="text-xs text-white/40 bg-white/5 border border-white/10 px-3 py-1 rounded-full">
              Today
            </span>
          </div>

          {messages.map((m) =>
            m.from === "me" ? (
              <div key={m.id} className="flex justify-end">
                <div className="max-w-[78%] rounded-3xl rounded-br-xl bg-gradient-to-br from-[#8722ec] to-[#6a1bb9] border border-white/10 px-4 py-3 text-sm shadow-[0_10px_30px_rgba(135,34,236,0.25)]">
                  {m.text}
                </div>
              </div>
            ) : (
              <div key={m.id} className="flex justify-start">
                <div className="max-w-[78%] rounded-3xl rounded-bl-xl bg-black/35 border border-white/10 px-4 py-3 text-sm text-white/90">
                  {m.text}
                </div>
              </div>
            )
          )}
        </div>

        <div className="p-4 md:p-5 border-t border-white/10">
          <div className="rounded-3xl bg-black/30 border border-white/10 p-2 flex items-end gap-2">
            <button
              type="button"
              className="h-10 w-10 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center"
              title="Attach"
            >
              <IconPlus />
            </button>

            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={1}
              placeholder="Type a message..."
              className="flex-1 bg-transparent outline-none resize-none text-sm text-white placeholder:text-white/40 px-2 py-2 max-h-28"
            />

            <button
              type="button"
              onClick={() => setMessage("")}
              className="h-10 px-4 rounded-2xl bg-[#8722ec] hover:bg-[#7a1fe0] border border-white/10 font-bold text-sm flex items-center gap-2"
              title="Send"
            >
              <IconSend />
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DiscoverView() {
  const mockUsers = [
    { id: 1, name: "Riya Sharma", username: "@riya", bio: "Frontend Dev" },
    { id: 2, name: "Karan Mehta", username: "@karan", bio: "Backend + FastAPI" },
    { id: 3, name: "Neha Singh", username: "@neha", bio: "UI/UX Designer" },
  ];

  // FIX: wrap in full height container (no fragment)
  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <div className="p-5 md:p-6 border-b border-white/10">
        <div className="text-xl font-extrabold">Discover</div>
        <div className="text-sm text-white/50 mt-1">
          Find new people and send friend requests (UI only).
        </div>
      </div>

      <div className="flex-1 min-h-0 p-5 md:p-6 grid sm:grid-cols-2 xl:grid-cols-3 gap-4 overflow-y-auto">
        {mockUsers.map((u) => (
          <div
            key={u.id}
            className="rounded-3xl bg-white/5 border border-white/10 p-4"
          >
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                <IconUser />
              </div>
              <div className="min-w-0">
                <div className="font-extrabold truncate">{u.name}</div>
                <div className="text-sm text-white/60 truncate">{u.username}</div>
              </div>
            </div>

            <div className="text-sm text-white/60 mt-3">{u.bio}</div>

            <button
              type="button"
              className="mt-4 w-full h-10 rounded-2xl bg-[#8722ec] hover:bg-[#7a1fe0] border border-white/10 font-bold text-sm"
            >
              Send Request
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function ActivityView() {
  const activity = [
    { id: 1, text: "You accepted a friend request from Riya.", time: "2m ago" },
    { id: 2, text: "You sent a request to Karan.", time: "15m ago" },
    { id: 3, text: "You updated your bio.", time: "1h ago" },
    { id: 4, text: "New chat started with Jane.", time: "3h ago" },
  ];

  // FIX: wrap in full height container (no fragment)
  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <div className="p-5 md:p-6 border-b border-white/10">
        <div className="text-xl font-extrabold">My Activity</div>
        <div className="text-sm text-white/50 mt-1">
          Your recent actions in the app (UI only).
        </div>
      </div>

      <div className="flex-1 min-h-0 p-5 md:p-6 space-y-3 overflow-y-auto">
        {activity.map((a) => (
          <div
            key={a.id}
            className="rounded-3xl bg-white/5 border border-white/10 p-4 flex items-start justify-between gap-3"
          >
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                <IconActivity />
              </div>
              <div>
                <div className="font-semibold text-white/90">{a.text}</div>
                <div className="text-xs text-white/50 mt-1">{a.time}</div>
              </div>
            </div>
            <div className="text-xs text-white/40">log</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SettingsView({ profile }) {
  // FIX: wrap in full height container (no fragment)
  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <div className="p-5 md:p-6 border-b border-white/10">
        <div className="text-xl font-extrabold">Settings</div>
        <div className="text-sm text-white/50 mt-1">
          Update profile settings (UI only).
        </div>
      </div>

      <div className="flex-1 min-h-0 p-5 md:p-6 overflow-y-auto">
        <div className="max-w-xl space-y-4">
          <div className="rounded-3xl bg-white/5 border border-white/10 p-4">
            <div className="text-sm font-semibold text-white/90 mb-2">
              Username
            </div>
            <input
              defaultValue={profile.username}
              className="w-full h-11 rounded-2xl bg-black/30 border border-white/10 px-3 text-sm outline-none"
            />
          </div>

          <div className="rounded-3xl bg-white/5 border border-white/10 p-4">
            <div className="text-sm font-semibold text-white/90 mb-2">Bio</div>
            <textarea
              defaultValue={profile.bio}
              rows={3}
              className="w-full rounded-2xl bg-black/30 border border-white/10 px-3 py-2 text-sm outline-none resize-none"
            />
          </div>

          <button
            type="button"
            className="w-full h-11 rounded-2xl bg-[#8722ec] hover:bg-[#7a1fe0] border border-white/10 font-bold text-sm"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------- Helpers ----------------------------- */

function getTabTitle(tab) {
  if (tab === TABS.CHAT) return "Chat";
  if (tab === TABS.DISCOVER) return "Discover";
  if (tab === TABS.ACTIVITY) return "My Activity";
  if (tab === TABS.SETTINGS) return "Settings";
  return "Dashboard";
}

/* ----------------------------- Safe SVG Icons (no MUI icons) ----------------------------- */

function IconBell() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2Zm6-6V11a6 6 0 1 0-12 0v5L4 18v1h16v-1l-2-2Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconChat() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path
        d="M4 5.5A3.5 3.5 0 0 1 7.5 2h9A3.5 3.5 0 0 1 20 5.5v6A3.5 3.5 0 0 1 16.5 15H10l-4 4v-4.5A3.5 3.5 0 0 1 4 11.5v-6Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconDiscover() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2l3 7 7 3-7 3-3 7-3-7-7-3 7-3 3-7Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconSettings() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M19.4 15a8 8 0 0 0 .1-2l2-1.5-2-3.5-2.4.5a7.8 7.8 0 0 0-1.7-1l-.4-2.5h-4l-.4 2.5a7.8 7.8 0 0 0-1.7 1L4.5 8l-2 3.5 2 1.5a8 8 0 0 0 .1 2l-2 1.5 2 3.5 2.4-.5c.5.4 1.1.7 1.7 1l.4 2.5h4l.4-2.5c.6-.3 1.2-.6 1.7-1l2.4.5 2-3.5-2-1.5Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconActivity() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path
        d="M4 13h4l2-6 4 12 2-6h4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconPlus() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 5v14M5 12h14"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconSearch() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M16.5 16.5 21 21"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconSend() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M22 2 11 13"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M22 2 15 22l-4-9-9-4 20-7Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconUser() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M20 21a8 8 0 1 0-16 0"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconPhone() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M6.5 3h3l1.5 5-2 1.5c1.5 3 4 5.5 7 7l1.5-2 5 1.5v3c0 1-1 2-2 2C10 22 2 14 2 4c0-1 1-1 2-1h2.5Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconVideo() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M3 7a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M16 10l5-3v10l-5-3v-4Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}
