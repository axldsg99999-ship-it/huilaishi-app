/*
 * Copy this file to partner-config.js only after a real Supabase project has
 * been deployed. The publishable/anon key is intentionally browser-visible;
 * the service-role key must never appear in this file or in GitHub Pages.
 */
window.HUILAISHI_PARTNER_CONFIG = Object.freeze({
  enabled: false,
  provider: "supabase",
  supabaseUrl: "https://YOUR_PROJECT_REF.supabase.co",
  supabasePublishableKey: "YOUR_PUBLIC_ANON_OR_PUBLISHABLE_KEY",
  voiceBucket: "voice-messages",
  voiceTicketFunction: "voice-upload-ticket",
  realtimeTopicPrefix: "conversation:",
  heartbeatMs: 20000,
  offlineAfterMs: 90000,
  matchingTimeoutMs: 60000,
  // ManualPeerSession can be offered independently of Supabase. It is a
  // user-invited P2P session, never a claim that a stranger is online.
  manualInviteEnabled: true,
  p2pIceServers: Object.freeze([
    Object.freeze({ urls: Object.freeze(["stun:stun.cloudflare.com:3478"]) }),
  ]),
  limits: Object.freeze({
    textCharacters: 1000,
    correctionCharacters: 1000,
    correctionNoteCharacters: 500,
    voiceBytes: 5 * 1024 * 1024,
    voiceDurationMs: 120000,
  }),
});
