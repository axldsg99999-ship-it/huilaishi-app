/* 公共前端配置。部署 Supabase 并完成双账号/RLS 测试前，中央匹配必须保持关闭。 */
window.HUILAISHI_PARTNER_CONFIG = Object.freeze({
  enabled: false,
  provider: "supabase",
  supabaseUrl: "",
  supabasePublishableKey: "",
  manualInviteEnabled: true,
  adultOnly: true,
  p2pModule: "partner/manual-peer.js",
  p2pIceServers: Object.freeze([
    Object.freeze({ urls: Object.freeze(["stun:stun.cloudflare.com:3478"]) })
  ]),
  limits: Object.freeze({
    textCharacters: 1000,
    correctionCharacters: 1000,
    voiceBytes: 5 * 1024 * 1024,
    voiceDurationMs: 120000
  })
});
