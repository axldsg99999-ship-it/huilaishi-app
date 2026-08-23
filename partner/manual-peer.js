/**
 * Huilaishi manual-invite transport.
 *
 * No account, signaling server, central matching, durable history or hidden AI
 * is involved. The two learners exchange the returned offer/answer strings over
 * a trusted side channel. Payloads then travel over an encrypted WebRTC data
 * channel and remain in memory unless the embedding UI explicitly saves them.
 */

export const MANUAL_PEER_PROTOCOL_VERSION = 1;
export const DEFAULT_ICE_SERVERS = Object.freeze([
  Object.freeze({ urls: Object.freeze(["stun:stun.cloudflare.com:3478"]) }),
]);

const SIGNAL_PREFIX_JSON = "HZ1J.";
const SIGNAL_PREFIX_GZIP = "HZ1G.";
const MAX_INVITE_CODE_CHARS = 100000;
const MAX_INVITE_DECOMPRESSED_BYTES = 256 * 1024;
const MAX_INVITE_EXPANSION_RATIO = 64;
const INVITE_EXPANSION_ALLOWANCE_BYTES = 16 * 1024;
const VOICE_FRAME_MARKER = 0x56;
const VOICE_ID_BYTES = 36;
const VOICE_HEADER_BYTES = 1 + VOICE_ID_BYTES + 4;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ALLOWED_LANGUAGES = new Set(["zh", "th"]);
const ALLOWED_VOICE_TYPES = new Set([
  "audio/webm",
  "audio/ogg",
  "audio/mp4",
  "audio/x-m4a",
  "audio/mpeg",
  "audio/wav",
]);

function normalizeVoiceType(value) {
  return String(value || "").split(";", 1)[0].trim().toLowerCase();
}

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

function nowIso() {
  return new Date().toISOString();
}

function randomUuid() {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = [...bytes].map(value => value.toString(16).padStart(2, "0"));
  return `${hex.slice(0, 4).join("")}-${hex.slice(4, 6).join("")}-${hex.slice(6, 8).join("")}-${hex.slice(8, 10).join("")}-${hex.slice(10).join("")}`;
}

function cleanText(value, max, field, { optional = false } = {}) {
  if (value == null && optional) return null;
  if (typeof value !== "string") throw new TypeError(`${field}_must_be_text`);
  const normalized = value.trim();
  if ((!normalized && !optional) || normalized.length > max) {
    throw new RangeError(`invalid_${field}_length`);
  }
  return normalized || null;
}

function cleanLanguage(value, { optional = true } = {}) {
  if (value == null && optional) return null;
  if (!ALLOWED_LANGUAGES.has(value)) throw new RangeError("invalid_language");
  return value;
}

function assertUuid(value, field = "id") {
  if (typeof value !== "string" || !UUID_PATTERN.test(value)) {
    throw new TypeError(`invalid_${field}`);
  }
  return value;
}

function bytesToBase64Url(bytes) {
  let binary = "";
  for (let offset = 0; offset < bytes.length; offset += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000));
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlToBytes(value) {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((value.length + 3) % 4);
  const binary = atob(padded);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

async function readStreamWithLimit(stream, maxBytes, errorCode) {
  const reader = stream.getReader();
  const chunks = [];
  let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = value instanceof Uint8Array ? value : new Uint8Array(value);
      total += chunk.byteLength;
      if (total > maxBytes) {
        await reader.cancel(errorCode).catch(() => null);
        throw new RangeError(errorCode);
      }
      chunks.push(chunk);
    }
  } finally {
    reader.releaseLock();
  }
  const result = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return result;
}

async function encodeSignal(payload) {
  const bytes = textEncoder.encode(JSON.stringify(payload));
  if (typeof CompressionStream === "function") {
    const compressed = await new Response(
      new Blob([bytes]).stream().pipeThrough(new CompressionStream("gzip")),
    ).arrayBuffer();
    return SIGNAL_PREFIX_GZIP + bytesToBase64Url(new Uint8Array(compressed));
  }
  return SIGNAL_PREFIX_JSON + bytesToBase64Url(bytes);
}

async function decodeSignal(code, expectedKind) {
  const compact = cleanText(code, MAX_INVITE_CODE_CHARS, "invite_code").replace(/\s+/g, "");
  let bytes;
  if (compact.startsWith(SIGNAL_PREFIX_GZIP)) {
    if (typeof DecompressionStream !== "function") {
      throw new Error("compressed_invite_not_supported_by_browser");
    }
    const compressed = base64UrlToBytes(compact.slice(SIGNAL_PREFIX_GZIP.length));
    const expansionLimit = compressed.byteLength * MAX_INVITE_EXPANSION_RATIO
      + INVITE_EXPANSION_ALLOWANCE_BYTES;
    const outputLimit = Math.min(MAX_INVITE_DECOMPRESSED_BYTES, expansionLimit);
    bytes = await readStreamWithLimit(
      new Blob([compressed]).stream().pipeThrough(new DecompressionStream("gzip")),
      outputLimit,
      outputLimit === MAX_INVITE_DECOMPRESSED_BYTES
        ? "invite_payload_too_large"
        : "invite_expansion_limit_exceeded",
    );
  } else if (compact.startsWith(SIGNAL_PREFIX_JSON)) {
    bytes = base64UrlToBytes(compact.slice(SIGNAL_PREFIX_JSON.length));
  } else {
    throw new Error("invalid_invite_prefix");
  }

  let payload;
  try {
    payload = JSON.parse(textDecoder.decode(bytes));
  } catch {
    throw new Error("invalid_invite_payload");
  }
  if (payload?.v !== MANUAL_PEER_PROTOCOL_VERSION || payload?.kind !== expectedKind) {
    throw new Error("incompatible_invite");
  }
  if (!payload.description || payload.description.type !== expectedKind) {
    throw new Error("invalid_session_description");
  }
  if (!Number.isFinite(payload.expiresAt) || Date.now() > payload.expiresAt) {
    throw new Error("invite_expired");
  }
  return payload;
}

async function fingerprintForOffer(sdp) {
  const digest = await crypto.subtle.digest("SHA-256", textEncoder.encode(String(sdp)));
  const hex = [...new Uint8Array(digest)]
    .slice(0, 6)
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
  return `${hex.slice(0, 4)}-${hex.slice(4, 8)}-${hex.slice(8, 12)}`;
}

function waitForIceGathering(peer, timeoutMs) {
  if (peer.iceGatheringState === "complete") return Promise.resolve();
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      cleanup();
      reject(new Error("ice_gathering_timed_out"));
    }, timeoutMs);
    const onChange = () => {
      if (peer.iceGatheringState === "complete") {
        cleanup();
        resolve();
      }
    };
    const cleanup = () => {
      clearTimeout(timeout);
      peer.removeEventListener("icegatheringstatechange", onChange);
    };
    peer.addEventListener("icegatheringstatechange", onChange);
  });
}

function makeVoiceFrame(id, sequence, chunk) {
  const idBytes = textEncoder.encode(id);
  const frame = new Uint8Array(VOICE_HEADER_BYTES + chunk.byteLength);
  frame[0] = VOICE_FRAME_MARKER;
  frame.set(idBytes, 1);
  new DataView(frame.buffer).setUint32(1 + VOICE_ID_BYTES, sequence, false);
  frame.set(new Uint8Array(chunk), VOICE_HEADER_BYTES);
  return frame.buffer;
}

function readVoiceFrame(buffer) {
  const frame = new Uint8Array(buffer);
  if (frame.byteLength <= VOICE_HEADER_BYTES || frame[0] !== VOICE_FRAME_MARKER) {
    throw new Error("invalid_binary_frame");
  }
  return {
    id: textDecoder.decode(frame.subarray(1, 1 + VOICE_ID_BYTES)),
    sequence: new DataView(frame.buffer, frame.byteOffset, frame.byteLength)
      .getUint32(1 + VOICE_ID_BYTES, false),
    payload: frame.slice(VOICE_HEADER_BYTES).buffer,
  };
}

export class ManualPeerSession extends EventTarget {
  constructor(options = {}) {
    super();
    if (typeof RTCPeerConnection !== "function") {
      throw new Error("webrtc_not_supported");
    }
    this.options = Object.freeze({
      iceServers: options.iceServers ?? DEFAULT_ICE_SERVERS,
      iceGatheringTimeoutMs: options.iceGatheringTimeoutMs ?? 12000,
      inviteLifetimeMs: options.inviteLifetimeMs ?? 15 * 60 * 1000,
      connectionTimeoutMs: options.connectionTimeoutMs ?? 45000,
      disconnectGraceMs: options.disconnectGraceMs ?? 15000,
      heartbeatMs: options.heartbeatMs ?? 15000,
      peerTimeoutMs: options.peerTimeoutMs ?? 45000,
      chunkBytes: Math.max(1024, Math.min(options.chunkBytes ?? 12 * 1024, 16 * 1024)),
      maxVoiceBytes: Math.max(1024, Math.min(options.maxVoiceBytes ?? 5 * 1024 * 1024, 5 * 1024 * 1024)),
      maxVoiceDurationMs: Math.max(250, Math.min(options.maxVoiceDurationMs ?? 120000, 120000)),
      maxSessionMessages: Math.max(1, Math.min(options.maxSessionMessages ?? 200, 500)),
      maxSessionVoiceBytes: Math.max(1024, Math.min(options.maxSessionVoiceBytes ?? 20 * 1024 * 1024, 25 * 1024 * 1024)),
      rateWindowMs: Math.max(1000, Math.min(options.rateWindowMs ?? 10000, 60000)),
      maxEnvelopesPerWindow: Math.max(1, Math.min(options.maxEnvelopesPerWindow ?? 80, 200)),
      maxBinaryFramesPerWindow: Math.max(1, Math.min(options.maxBinaryFramesPerWindow ?? 1024, 2048)),
      maxEnvelopeChars: Math.max(1024, Math.min(options.maxEnvelopeChars ?? 16 * 1024, 64 * 1024)),
    });
    this.peer = new RTCPeerConnection({ iceServers: this.options.iceServers });
    this.channel = null;
    this.role = null;
    this.state = "new";
    this.verificationCode = null;
    this.createdAt = nowIso();
    this.lastPeerActivity = Date.now();
    this.blocked = false;
    this.incomingVoices = new Map();
    this.sessionMessageCount = 0;
    this.sessionVoiceBytes = 0;
    this.rateWindows = {
      envelope: { startedAt: Date.now(), count: 0 },
      binary: { startedAt: Date.now(), count: 0 },
    };
    this.evidence = [];
    this.heartbeatTimer = null;
    this.connectionTimer = null;
    this.disconnectTimer = null;
    this.peer.addEventListener("connectionstatechange", () => this.handleConnectionState());
  }

  static async acceptOffer(offerCode, options = {}) {
    const payload = await decodeSignal(offerCode, "offer");
    const session = new ManualPeerSession(options);
    session.role = "guest";
    session.verificationCode = await fingerprintForOffer(payload.description.sdp);
    session.setState("answering");
    session.peer.addEventListener("datachannel", (event) => session.bindChannel(event.channel), { once: true });
    await session.peer.setRemoteDescription(payload.description);
    await session.peer.setLocalDescription(await session.peer.createAnswer());
    await waitForIceGathering(session.peer, session.options.iceGatheringTimeoutMs);
    const answerCode = await encodeSignal({
      v: MANUAL_PEER_PROTOCOL_VERSION,
      kind: "answer",
      createdAt: Date.now(),
      expiresAt: Date.now() + session.options.inviteLifetimeMs,
      description: session.peer.localDescription,
    });
    session.setState("connecting");
    session.armConnectionTimeout();
    return Object.freeze({ session, answerCode, verificationCode: session.verificationCode });
  }

  async createOffer() {
    if (this.state !== "new") throw new Error("offer_already_created");
    this.role = "host";
    this.setState("offering");
    this.bindChannel(this.peer.createDataChannel("huilaishi-manual-v1", {
      ordered: true,
      negotiated: false,
    }));
    await this.peer.setLocalDescription(await this.peer.createOffer());
    await waitForIceGathering(this.peer, this.options.iceGatheringTimeoutMs);
    this.verificationCode = await fingerprintForOffer(this.peer.localDescription.sdp);
    const offerCode = await encodeSignal({
      v: MANUAL_PEER_PROTOCOL_VERSION,
      kind: "offer",
      createdAt: Date.now(),
      expiresAt: Date.now() + this.options.inviteLifetimeMs,
      description: this.peer.localDescription,
    });
    this.setState("awaiting-answer");
    return Object.freeze({ offerCode, verificationCode: this.verificationCode });
  }

  async acceptAnswer(answerCode) {
    if (this.role !== "host" || this.state !== "awaiting-answer") {
      throw new Error("not_waiting_for_answer");
    }
    const payload = await decodeSignal(answerCode, "answer");
    await this.peer.setRemoteDescription(payload.description);
    this.setState("connecting");
    this.armConnectionTimeout();
  }

  bindChannel(channel) {
    if (this.channel && this.channel !== channel) {
      channel.close();
      return;
    }
    this.channel = channel;
    channel.binaryType = "arraybuffer";
    channel.bufferedAmountLowThreshold = 64 * 1024;
    channel.addEventListener("open", () => this.onChannelOpen());
    channel.addEventListener("close", () => {
      clearInterval(this.heartbeatTimer);
      clearTimeout(this.connectionTimer);
      this.heartbeatTimer = null;
      for (const incoming of this.incomingVoices.values()) clearTimeout(incoming.timeout);
      this.incomingVoices.clear();
      if (!this.blocked
          && this.state !== "closed"
          && this.state !== "timed-out"
          && this.state !== "failed") {
        this.setState("disconnected", { reason: "data_channel_closed" });
        clearTimeout(this.disconnectTimer);
        this.disconnectTimer = setTimeout(() => {
          if (this.state === "disconnected") {
            this.setState("timed-out", { reason: "data_channel_close_grace_expired" });
            this.close("data_channel_close_grace_expired", { keepTimedOutState: true });
          }
        }, this.options.disconnectGraceMs);
      }
    });
    channel.addEventListener("error", () => this.emitError("data_channel_error"));
    channel.addEventListener("message", (event) => void this.handleChannelMessage(event.data));
  }

  onChannelOpen() {
    clearTimeout(this.connectionTimer);
    clearTimeout(this.disconnectTimer);
    this.lastPeerActivity = Date.now();
    this.setState("connected");
    this.sendControl({ type: "hello", protocol: MANUAL_PEER_PROTOCOL_VERSION });
    this.heartbeatTimer = setInterval(() => {
      if (Date.now() - this.lastPeerActivity > this.options.peerTimeoutMs) {
        this.setState("timed-out", { reason: "peer_heartbeat_timed_out" });
        this.close("peer_heartbeat_timed_out", { keepTimedOutState: true });
        return;
      }
      this.sendControl({ type: "ping", at: Date.now() });
    }, this.options.heartbeatMs);
  }

  handleConnectionState() {
    const connectionState = this.peer.connectionState;
    if (connectionState === "connected") {
      clearTimeout(this.disconnectTimer);
      if (this.channel?.readyState === "open" && this.state !== "connected") {
        this.setState("connected", { recovered: true });
      }
      return;
    }
    if (connectionState === "disconnected") {
      this.setState("disconnected", { reason: "network_interrupted" });
      clearTimeout(this.disconnectTimer);
      this.disconnectTimer = setTimeout(() => {
        if (this.peer.connectionState === "disconnected") {
          this.setState("timed-out", { reason: "disconnect_grace_expired" });
          this.close("disconnect_grace_expired", { keepTimedOutState: true });
        }
      }, this.options.disconnectGraceMs);
    } else if (connectionState === "failed") {
      this.setState("failed", { reason: "webrtc_connection_failed" });
      this.close("webrtc_connection_failed", { keepFailedState: true });
    } else if (connectionState === "closed" && this.state !== "closed") {
      this.setState("closed", { reason: "peer_connection_closed" });
    }
  }

  armConnectionTimeout() {
    clearTimeout(this.connectionTimer);
    this.connectionTimer = setTimeout(() => {
      if (this.state !== "connected") {
        this.setState("timed-out", { reason: "connection_timed_out" });
        this.close("connection_timed_out", { keepTimedOutState: true });
      }
    }, this.options.connectionTimeoutMs);
  }

  sendText(body, { language = null, replyToId = null } = {}) {
    this.assertConnected();
    const envelope = {
      v: MANUAL_PEER_PROTOCOL_VERSION,
      type: "text",
      id: randomUuid(),
      body: cleanText(body, 1000, "text"),
      language: cleanLanguage(language),
      replyToId: replyToId == null ? null : assertUuid(replyToId, "reply_id"),
      createdAt: nowIso(),
    };
    this.consumeSessionMessage();
    this.sendEnvelope(envelope);
    this.recordEvidence("sent", envelope);
    this.emit("sent", envelope);
    return envelope;
  }

  sendCorrection(sourceMessageId, correctedText, { note = null } = {}) {
    this.assertConnected();
    const envelope = {
      v: MANUAL_PEER_PROTOCOL_VERSION,
      type: "correction",
      id: randomUuid(),
      sourceMessageId: assertUuid(sourceMessageId, "source_message_id"),
      correctedText: cleanText(correctedText, 1000, "correction"),
      note: cleanText(note, 500, "correction_note", { optional: true }),
      createdAt: nowIso(),
    };
    this.consumeSessionMessage();
    this.sendEnvelope(envelope);
    this.recordEvidence("sent", envelope);
    this.emit("sent", envelope);
    return envelope;
  }

  async sendVoice(blob, {
    durationMs,
    language = null,
    transcript = null,
    replyToId = null,
  } = {}) {
    this.assertConnected();
    if (!(blob instanceof Blob)) throw new TypeError("voice_must_be_blob");
    const mimeType = normalizeVoiceType(blob.type);
    if (!ALLOWED_VOICE_TYPES.has(mimeType)) throw new RangeError("unsupported_voice_type");
    if (blob.size < 1 || blob.size > this.options.maxVoiceBytes) {
      throw new RangeError("invalid_voice_size");
    }
    if (!Number.isInteger(durationMs) || durationMs < 250 || durationMs > this.options.maxVoiceDurationMs) {
      throw new RangeError("invalid_voice_duration");
    }

    const id = randomUuid();
    const totalChunks = Math.ceil(blob.size / this.options.chunkBytes);
    const metadata = {
      v: MANUAL_PEER_PROTOCOL_VERSION,
      type: "voice:start",
      id,
      mimeType,
      sizeBytes: blob.size,
      durationMs,
      language: cleanLanguage(language),
      transcript: cleanText(transcript, 1000, "transcript", { optional: true }),
      replyToId: replyToId == null ? null : assertUuid(replyToId, "reply_id"),
      totalChunks,
      createdAt: nowIso(),
    };
    this.consumeSessionMessage();
    this.reserveSessionVoiceBytes(blob.size);
    this.sendEnvelope(metadata);

    for (let sequence = 0; sequence < totalChunks; sequence += 1) {
      const start = sequence * this.options.chunkBytes;
      const chunk = await blob.slice(start, start + this.options.chunkBytes).arrayBuffer();
      await this.waitForBackpressure();
      this.assertConnected();
      this.channel.send(makeVoiceFrame(id, sequence, chunk));
    }
    this.sendEnvelope({
      v: MANUAL_PEER_PROTOCOL_VERSION,
      type: "voice:end",
      id,
      totalChunks,
    });
    this.recordEvidence("sent", metadata);
    this.emit("sent", metadata);
    return metadata;
  }

  async handleChannelMessage(data) {
    this.lastPeerActivity = Date.now();
    try {
      if (typeof data === "string") {
        this.consumeInboundRate("envelope");
        if (data.length > this.options.maxEnvelopeChars) throw new Error("peer_envelope_too_large");
        this.handleEnvelope(JSON.parse(data));
        return;
      }
      this.consumeInboundRate("binary");
      const frameBytes = data instanceof Blob ? data.size : data?.byteLength;
      if (!Number.isInteger(frameBytes)
          || frameBytes > VOICE_HEADER_BYTES + this.options.chunkBytes) {
        throw new Error("voice_frame_too_large");
      }
      const buffer = data instanceof Blob ? await data.arrayBuffer() : data;
      const frame = readVoiceFrame(buffer);
      assertUuid(frame.id, "voice_id");
      const incoming = this.incomingVoices.get(frame.id);
      if (!incoming || frame.sequence !== incoming.nextSequence) {
        throw new Error("voice_chunk_out_of_order");
      }
      incoming.receivedBytes += frame.payload.byteLength;
      if (incoming.receivedBytes > incoming.metadata.sizeBytes
          || incoming.receivedBytes > this.options.maxVoiceBytes) {
        this.discardIncomingVoice(frame.id, "voice_size_mismatch");
        return;
      }
      incoming.chunks.push(frame.payload);
      incoming.nextSequence += 1;
    } catch (error) {
      const code = error instanceof Error ? error.message : "invalid_peer_payload";
      this.emitError(code);
      if ([
        "peer_rate_limit_exceeded",
        "peer_envelope_too_large",
        "voice_frame_too_large",
        "session_message_limit_exceeded",
        "session_voice_limit_exceeded",
      ].includes(code)) {
        this.close("peer_resource_limit_exceeded");
      }
    }
  }

  handleEnvelope(envelope) {
    if (!envelope || envelope.v !== MANUAL_PEER_PROTOCOL_VERSION || typeof envelope.type !== "string") {
      throw new Error("invalid_peer_envelope");
    }
    if (envelope.type === "hello") {
      if (envelope.protocol !== MANUAL_PEER_PROTOCOL_VERSION) throw new Error("protocol_mismatch");
      this.emit("peer-ready", { verificationCode: this.verificationCode });
      return;
    }
    if (envelope.type === "ping") {
      this.sendControl({ type: "pong", at: envelope.at });
      return;
    }
    if (envelope.type === "pong") return;
    if (envelope.type === "text") {
      const validated = {
        v: MANUAL_PEER_PROTOCOL_VERSION,
        type: "text",
        id: assertUuid(envelope.id, "message_id"),
        body: cleanText(envelope.body, 1000, "text"),
        language: cleanLanguage(envelope.language),
        replyToId: envelope.replyToId == null ? null : assertUuid(envelope.replyToId, "reply_id"),
        receivedAt: nowIso(),
      };
      this.consumeSessionMessage();
      this.recordEvidence("received", validated);
      this.emit("text", validated);
      return;
    }
    if (envelope.type === "correction") {
      const validated = {
        v: MANUAL_PEER_PROTOCOL_VERSION,
        type: "correction",
        id: assertUuid(envelope.id, "correction_id"),
        sourceMessageId: assertUuid(envelope.sourceMessageId, "source_message_id"),
        correctedText: cleanText(envelope.correctedText, 1000, "correction"),
        note: cleanText(envelope.note, 500, "correction_note", { optional: true }),
        receivedAt: nowIso(),
      };
      this.consumeSessionMessage();
      this.recordEvidence("received", validated);
      this.emit("correction", validated);
      return;
    }
    if (envelope.type === "voice:start") {
      this.beginIncomingVoice(envelope);
      return;
    }
    if (envelope.type === "voice:end") {
      this.finishIncomingVoice(envelope);
      return;
    }
    throw new Error("unknown_peer_envelope");
  }

  beginIncomingVoice(envelope) {
    const id = assertUuid(envelope.id, "voice_id");
    const mimeType = normalizeVoiceType(envelope.mimeType);
    if (this.incomingVoices.has(id)) throw new Error("duplicate_voice_start");
    if (this.incomingVoices.size >= 2) throw new Error("too_many_voice_transfers");
    if (!ALLOWED_VOICE_TYPES.has(mimeType)
        || !Number.isInteger(envelope.sizeBytes)
        || envelope.sizeBytes < 1
        || envelope.sizeBytes > this.options.maxVoiceBytes
        || !Number.isInteger(envelope.durationMs)
        || envelope.durationMs < 250
        || envelope.durationMs > this.options.maxVoiceDurationMs
        || !Number.isInteger(envelope.totalChunks)
        || envelope.totalChunks < 1
        || envelope.totalChunks > 4096) {
      throw new Error("invalid_voice_metadata");
    }
    const metadata = {
      v: MANUAL_PEER_PROTOCOL_VERSION,
      type: "voice:start",
      id,
      mimeType,
      language: cleanLanguage(envelope.language),
      transcript: cleanText(envelope.transcript, 1000, "transcript", { optional: true }),
      replyToId: envelope.replyToId == null ? null : assertUuid(envelope.replyToId, "reply_id"),
      sizeBytes: envelope.sizeBytes,
      durationMs: envelope.durationMs,
      totalChunks: envelope.totalChunks,
      createdAt: typeof envelope.createdAt === "string" ? envelope.createdAt.slice(0, 64) : null,
    };
    this.consumeSessionMessage();
    this.reserveSessionVoiceBytes(metadata.sizeBytes);
    const timeout = setTimeout(() => this.discardIncomingVoice(id, "voice_transfer_timed_out"), 30000);
    this.incomingVoices.set(id, {
      metadata,
      chunks: [],
      nextSequence: 0,
      receivedBytes: 0,
      timeout,
    });
  }

  finishIncomingVoice(envelope) {
    const id = assertUuid(envelope.id, "voice_id");
    const incoming = this.incomingVoices.get(id);
    if (!incoming) throw new Error("voice_start_missing");
    clearTimeout(incoming.timeout);
    this.incomingVoices.delete(id);
    if (incoming.nextSequence !== incoming.metadata.totalChunks
        || incoming.receivedBytes !== incoming.metadata.sizeBytes
        || envelope.totalChunks !== incoming.metadata.totalChunks) {
      throw new Error("voice_transfer_incomplete");
    }
    const blob = new Blob(incoming.chunks, { type: incoming.metadata.mimeType });
    this.recordEvidence("received", incoming.metadata);
    this.emit("voice", { ...incoming.metadata, blob });
  }

  discardIncomingVoice(id, reason) {
    const incoming = this.incomingVoices.get(id);
    if (incoming) clearTimeout(incoming.timeout);
    this.incomingVoices.delete(id);
    this.emitError(reason);
  }

  sendEnvelope(envelope) {
    this.assertConnected();
    this.channel.send(JSON.stringify(envelope));
  }

  consumeSessionMessage() {
    if (this.sessionMessageCount >= this.options.maxSessionMessages) {
      throw new Error("session_message_limit_exceeded");
    }
    this.sessionMessageCount += 1;
  }

  reserveSessionVoiceBytes(sizeBytes) {
    if (!Number.isInteger(sizeBytes)
        || this.sessionVoiceBytes + sizeBytes > this.options.maxSessionVoiceBytes) {
      throw new Error("session_voice_limit_exceeded");
    }
    this.sessionVoiceBytes += sizeBytes;
  }

  consumeInboundRate(kind) {
    const window = this.rateWindows[kind];
    const now = Date.now();
    if (now - window.startedAt >= this.options.rateWindowMs) {
      window.startedAt = now;
      window.count = 0;
    }
    window.count += 1;
    const limit = kind === "binary"
      ? this.options.maxBinaryFramesPerWindow
      : this.options.maxEnvelopesPerWindow;
    if (window.count > limit) throw new Error("peer_rate_limit_exceeded");
  }

  sendControl(envelope) {
    if (this.channel?.readyState !== "open") return;
    this.channel.send(JSON.stringify({ v: MANUAL_PEER_PROTOCOL_VERSION, ...envelope }));
  }

  waitForBackpressure() {
    if (this.channel.bufferedAmount <= this.channel.bufferedAmountLowThreshold) {
      return Promise.resolve();
    }
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        cleanup();
        reject(new Error("send_buffer_timed_out"));
      }, 15000);
      const onLow = () => {
        cleanup();
        resolve();
      };
      const onClose = () => {
        cleanup();
        reject(new Error("data_channel_closed"));
      };
      const cleanup = () => {
        clearTimeout(timeout);
        this.channel?.removeEventListener("bufferedamountlow", onLow);
        this.channel?.removeEventListener("close", onClose);
      };
      this.channel.addEventListener("bufferedamountlow", onLow, { once: true });
      this.channel.addEventListener("close", onClose, { once: true });
    });
  }

  assertConnected() {
    if (this.blocked) throw new Error("peer_blocked_for_session");
    if (this.state !== "connected" || this.channel?.readyState !== "open") {
      throw new Error("peer_not_connected");
    }
  }

  blockPeer(reason = "session_blocked") {
    this.blocked = true;
    this.close(reason);
    this.emit("blocked", { reason, persistent: false });
  }

  exportIncident({ reason, details = null, messageIds = [] }) {
    const cleanReason = cleanText(reason, 100, "incident_reason");
    const cleanDetails = cleanText(details, 1000, "incident_details", { optional: true });
    const selected = new Set(messageIds);
    return Object.freeze({
      format: "huilaishi-p2p-incident-v1",
      createdAt: nowIso(),
      verificationCode: this.verificationCode,
      reason: cleanReason,
      details: cleanDetails,
      centralReportSubmitted: false,
      evidence: this.evidence.filter((item) => selected.size === 0 || selected.has(item.payload.id)),
    });
  }

  recordEvidence(direction, payload) {
    const safePayload = { ...payload };
    delete safePayload.blob;
    this.evidence.push({ direction, observedAt: nowIso(), payload: safePayload });
    if (this.evidence.length > 100) this.evidence.splice(0, this.evidence.length - 100);
  }

  setState(state, extra = {}) {
    if (this.state === state && Object.keys(extra).length === 0) return;
    this.state = state;
    this.emit("state", { state, ...extra });
  }

  emit(type, detail) {
    this.dispatchEvent(new CustomEvent(type, { detail }));
  }

  emitError(code) {
    this.emit("protocol-error", { code });
  }

  stopTimers() {
    clearInterval(this.heartbeatTimer);
    clearTimeout(this.connectionTimer);
    clearTimeout(this.disconnectTimer);
    this.heartbeatTimer = null;
    for (const incoming of this.incomingVoices.values()) clearTimeout(incoming.timeout);
    this.incomingVoices.clear();
  }

  close(reason = "closed_by_user", { keepTimedOutState = false, keepFailedState = false } = {}) {
    this.stopTimers();
    if ((!keepTimedOutState || this.state !== "timed-out")
        && (!keepFailedState || this.state !== "failed")) {
      this.setState("closed", { reason });
    }
    if (this.channel && this.channel.readyState !== "closed") this.channel.close();
    if (this.peer.connectionState !== "closed") this.peer.close();
  }
}
