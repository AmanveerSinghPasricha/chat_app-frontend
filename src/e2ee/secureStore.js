// src/e2ee/secureStore.js
import { openDB } from "idb";

const DB_NAME = "connectio_e2ee";
const DB_VERSION = 1;
const STORE_KEYS = "keys";

async function getDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_KEYS)) {
        db.createObjectStore(STORE_KEYS);
      }
    },
  });
}

export async function saveDeviceId(deviceId) {
  const db = await getDB();
  await db.put(STORE_KEYS, deviceId, "device_id");
}

export async function getDeviceId() {
  const db = await getDB();
  return (await db.get(STORE_KEYS, "device_id")) || null;
}

export async function saveIdentityKeypair(identityKeypair) {
  const db = await getDB();
  await db.put(STORE_KEYS, identityKeypair, "identity_keypair");
}

export async function getIdentityKeypair() {
  const db = await getDB();
  return (await db.get(STORE_KEYS, "identity_keypair")) || null;
}

export async function setPrekeysUploaded(value) {
  const db = await getDB();
  await db.put(STORE_KEYS, Boolean(value), "prekeys_uploaded");
}

export async function getPrekeysUploaded() {
  const db = await getDB();
  return (await db.get(STORE_KEYS, "prekeys_uploaded")) || false;
}

export async function saveSessionKey(friendId, sessionKeyB64) {
  const db = await getDB();
  await db.put(STORE_KEYS, sessionKeyB64, `session_key_${friendId}`);
}

export async function getSessionKey(friendId) {
  const db = await getDB();
  return (await db.get(STORE_KEYS, `session_key_${friendId}`)) || null;
}

export async function saveReceiverDeviceId(friendId, deviceId) {
  const db = await getDB();
  await db.put(STORE_KEYS, deviceId, `receiver_device_${friendId}`);
}

export async function getReceiverDeviceId(friendId) {
  const db = await getDB();
  return (await db.get(STORE_KEYS, `receiver_device_${friendId}`)) || null;
}

export async function clearAllE2EE() {
  const db = await getDB();
  await db.clear(STORE_KEYS);
}
