// src/e2ee/cryptoUtils.js
// Minimal + stable WebCrypto E2EE helpers (ECDH -> HKDF -> AES-GCM)

function b64ToBytes(b64) {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

function bytesToB64(bytes) {
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

// ----------------------------
// Keypair generation (ECDH P-256)
// ----------------------------
export async function generateIdentityKeypair() {
  const keyPair = await crypto.subtle.generateKey(
    { name: "ECDH", namedCurve: "P-256" },
    true,
    ["deriveBits"]
  );

  const publicKeyRaw = await crypto.subtle.exportKey("raw", keyPair.publicKey);
  const privateKeyJwk = await crypto.subtle.exportKey("jwk", keyPair.privateKey);

  return {
    publicKey: bytesToB64(new Uint8Array(publicKeyRaw)),
    privateKey: JSON.stringify(privateKeyJwk),
  };
}

export async function generateEphemeralKeypair() {
  const keyPair = await crypto.subtle.generateKey(
    { name: "ECDH", namedCurve: "P-256" },
    true,
    ["deriveBits"]
  );

  const publicKeyRaw = await crypto.subtle.exportKey("raw", keyPair.publicKey);
  const privateKeyJwk = await crypto.subtle.exportKey("jwk", keyPair.privateKey);

  return {
    publicKey: bytesToB64(new Uint8Array(publicKeyRaw)),
    privateKey: JSON.stringify(privateKeyJwk),
  };
}

// ----------------------------
// Import ECDH keys
// ----------------------------
async function importEcdhPublicKey(publicKeyB64) {
  const raw = b64ToBytes(publicKeyB64);
  return crypto.subtle.importKey(
    "raw",
    raw,
    { name: "ECDH", namedCurve: "P-256" },
    true,
    []
  );
}

async function importEcdhPrivateKey(privateKeyStr) {
  const jwk = JSON.parse(privateKeyStr);
  return crypto.subtle.importKey(
    "jwk",
    jwk,
    { name: "ECDH", namedCurve: "P-256" },
    true,
    ["deriveBits"]
  );
}

// ----------------------------
// HKDF -> AES-256 key
// ----------------------------
async function hkdfToAesKey(sharedSecretBits) {
  const sharedKey = await crypto.subtle.importKey(
    "raw",
    sharedSecretBits,
    "HKDF",
    false,
    ["deriveKey"]
  );

  const salt = new Uint8Array(32); // demo salt (zero)
  const info = new TextEncoder().encode("connectio-e2ee-session");

  return crypto.subtle.deriveKey(
    { name: "HKDF", hash: "SHA-256", salt, info },
    sharedKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

// ----------------------------
// Derive session key from friend's bundle
// friendBundle must contain: identity_key_pub (base64 raw ECDH pubkey)
// myEphemeralPrivKeyStr must be: JSON string (private JWK)
// ----------------------------
export async function deriveSessionKeyFromBundle({
  friendBundle,
  myEphemeralPrivKeyStr,
  myEphemeralPrivB64, // support your e2eeClient.js naming
}) {
  const receiverIdentityPub = friendBundle?.identity_key_pub;
  if (!receiverIdentityPub) {
    throw new Error("friendBundle.identity_key_pub missing");
  }

  // ✅ accept either name
  const privStr = myEphemeralPrivKeyStr || myEphemeralPrivB64;
  if (!privStr) {
    throw new Error("Missing ephemeral private key (myEphemeralPrivKeyStr)");
  }

  const receiverPubKey = await importEcdhPublicKey(receiverIdentityPub);
  const myPrivKey = await importEcdhPrivateKey(privStr);

  const sharedSecretBits = await crypto.subtle.deriveBits(
    { name: "ECDH", public: receiverPubKey },
    myPrivKey,
    256
  );

  const aesKey = await hkdfToAesKey(sharedSecretBits);

  const raw = await crypto.subtle.exportKey("raw", aesKey);
  return bytesToB64(new Uint8Array(raw)); // 32 bytes base64
}

// ----------------------------
// AES-GCM Encrypt/Decrypt
// sessionKeyB64 must decode to 32 bytes
// nonce is 12 bytes (base64)
// ----------------------------
async function importAesKey(sessionKeyB64) {
  const raw = b64ToBytes(sessionKeyB64);

  if (raw.length !== 32) {
    throw new Error(`Session key must be 32 bytes, got ${raw.length}`);
  }

  return crypto.subtle.importKey("raw", raw, { name: "AES-GCM" }, false, [
    "encrypt",
    "decrypt",
  ]);
}

export async function encryptMessage(sessionKeyB64, plaintext) {
  const key = await importAesKey(sessionKeyB64);
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const ciphertextBuf = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    new TextEncoder().encode(plaintext)
  );

  return {
    ciphertext: bytesToB64(new Uint8Array(ciphertextBuf)),
    nonce: bytesToB64(iv),
  };
}

export async function decryptMessage(sessionKeyB64, ciphertextB64, nonceB64) {
  const key = await importAesKey(sessionKeyB64);

  const iv = b64ToBytes(nonceB64);
  const ciphertext = b64ToBytes(ciphertextB64);

  const plainBuf = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    ciphertext
  );

  return new TextDecoder().decode(plainBuf);
}
