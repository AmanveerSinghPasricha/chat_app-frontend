// src/e2ee/e2eeClient.js
import { api } from "../api/api";
import {
  getDeviceId,
  saveDeviceId,
  getIdentityKeypair,
  saveIdentityKeypair,
  getPrekeysUploaded,
  setPrekeysUploaded,
  saveSessionKey,
  getSessionKey,
  saveReceiverDeviceId,
  getReceiverDeviceId,
} from "./secureStore";

import {
  generateIdentityKeypair,
  generateEphemeralKeypair,
  deriveSessionKeyFromBundle,
} from "./cryptoUtils";

// -------------------------
// 1) Identity Keypair
// -------------------------
export async function ensureIdentityKeypair() {
  const existing = await getIdentityKeypair();
  if (existing?.publicKey && existing?.privateKey) return existing;

  const kp = await generateIdentityKeypair();
  await saveIdentityKeypair(kp);
  return kp;
}

// -------------------------
// 2) Device Register
// -------------------------
export async function ensureDeviceRegistered() {
  const existing = await getDeviceId();
  if (existing) return existing;

  const identity = await ensureIdentityKeypair();

  const payload = {
    device_name: "web",
    identity_key_pub: identity.publicKey, // REQUIRED by backend
  };

  const res = await api.post("/e2ee/devices/register", payload);

  // backend returns data.id (NOT device_id)
  const deviceId = res?.data?.data?.id;

  if (!deviceId) {
    throw new Error("Device register failed: id missing");
  }

  await saveDeviceId(deviceId);
  return deviceId;
}

// -------------------------
// 3) Upload Prekeys (once)
// -------------------------
export async function ensurePrekeysUploaded() {
  const uploaded = await getPrekeysUploaded();
  if (uploaded) return true;

  const deviceId = await ensureDeviceRegistered();
  const identity = await ensureIdentityKeypair();

  // Backend expects ONLY signed_prekey + one_time_prekeys
  const payload = {
    signed_prekey: {
      key_id: 1,
      public_key: identity.publicKey,
      signature: identity.publicKey, // placeholder for now
    },

    one_time_prekeys: Array.from({ length: 5 }).map((_, idx) => ({
      key_id: idx + 1,
      public_key: identity.publicKey,
    })),
  };

  // backend expects device_id in QUERY param
  await api.post(`/e2ee/prekeys/upload?device_id=${deviceId}`, payload);

  await setPrekeysUploaded(true);
  return true;
}

// -------------------------
// 4) Fetch Friend Bundle
// -------------------------
export async function fetchFriendBundle(friendUserId) {
  const res = await api.get(`/e2ee/prekeys/bundle/${friendUserId}`);
  const bundle = res?.data?.data;

  if (!bundle) {
    throw new Error("Friend bundle missing from API response");
  }

  return bundle;
}

// -------------------------
// 5) Ensure Session for Friend
// -------------------------
export async function ensureSessionForFriend(friend) {
  const existingSession = await getSessionKey(friend.id);
  const existingReceiverDeviceId = await getReceiverDeviceId(friend.id);

  if (existingSession && existingReceiverDeviceId) {
    return {
      sessionKeyB64: existingSession,
      receiverDeviceId: existingReceiverDeviceId,
      header: null,
    };
  }

  const friendBundle = await fetchFriendBundle(friend.id);

  const receiverDeviceId = friendBundle?.device_id;
  if (!receiverDeviceId) {
    throw new Error("Friend bundle missing device_id");
  }

  // Must be real base64 (not placeholder)
  if (
    !friendBundle?.identity_key_pub ||
    friendBundle.identity_key_pub === "string"
  ) {
    throw new Error(
      "Friend bundle identity_key_pub is not real. Fix backend bundle to return actual key."
    );
  }

  // Generate ephemeral keypair
  const eph = await generateEphemeralKeypair();

  // Derive session key using friend identity pub + my eph priv
  const sessionKeyB64 = await deriveSessionKeyFromBundle({
    friendBundle,
    myEphemeralPrivB64: eph.privateKey,
  });

  await saveSessionKey(friend.id, sessionKeyB64);
  await saveReceiverDeviceId(friend.id, receiverDeviceId);

  // Header for receiver to derive (future use)
  const header = {
    ephemeral_pub: eph.publicKey,
    signed_prekey_id: friendBundle?.signed_prekey?.key_id ?? null,
    one_time_prekey_id: friendBundle?.one_time_prekey?.key_id ?? null,
  };

  return {
    sessionKeyB64,
    receiverDeviceId,
    header,
  };
}
