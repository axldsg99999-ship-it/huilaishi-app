import { createClient } from "npm:@supabase/supabase-js@2";

const JSON_HEADERS = { "Content-Type": "application/json; charset=utf-8" };
const SAFE_RPC_ERRORS = new Set([
  "client_nonce_required",
  "invalid_voice_limits",
  "unsupported_voice_type",
  "conversation_not_active_or_not_member",
  "account_not_active",
  "conversation_blocked",
  "message_already_finalized",
  "rate_limited",
]);

function getRequiredEnv(name: string): string {
  const value = Deno.env.get(name);
  if (!value) throw new Error(`missing_server_environment:${name}`);
  return value;
}

function allowedOrigins(): Set<string> {
  return new Set(
    (Deno.env.get("ALLOWED_ORIGINS") ?? "")
      .split(",")
      .map((value) => value.trim().replace(/\/$/, ""))
      .filter(Boolean),
  );
}

function corsHeaders(origin: string | null): Record<string, string> {
  const headers: Record<string, string> = {
    ...JSON_HEADERS,
    "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
  if (origin) headers["Access-Control-Allow-Origin"] = origin;
  return headers;
}

function reply(
  status: number,
  payload: Record<string, unknown>,
  origin: string | null,
): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: corsHeaders(origin),
  });
}

Deno.serve(async (request) => {
  const origin = request.headers.get("Origin")?.replace(/\/$/, "") ?? null;
  const origins = allowedOrigins();
  const originAllowed = origin !== null && origins.has(origin);

  if (request.method === "OPTIONS") {
    return originAllowed
      ? new Response(null, { status: 204, headers: corsHeaders(origin) })
      : reply(403, { error: "origin_not_allowed" }, null);
  }
  if (request.method !== "POST") {
    return reply(405, { error: "method_not_allowed" }, originAllowed ? origin : null);
  }
  if (!originAllowed) {
    return reply(403, { error: "origin_not_allowed" }, null);
  }

  const authorization = request.headers.get("Authorization") ?? "";
  if (!authorization.startsWith("Bearer ")) {
    return reply(401, { error: "authentication_required" }, origin);
  }

  try {
    const supabaseUrl = getRequiredEnv("SUPABASE_URL");
    const anonKey = getRequiredEnv("SUPABASE_ANON_KEY");
    const serviceRoleKey = getRequiredEnv("SUPABASE_SERVICE_ROLE_KEY");
    const accessToken = authorization.slice("Bearer ".length).trim();

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: `Bearer ${accessToken}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: authData, error: authError } = await userClient.auth.getUser(accessToken);
    if (authError || !authData.user) {
      return reply(401, { error: "invalid_session" }, origin);
    }

    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return reply(400, { error: "invalid_json" }, origin);
    }

    const { data: ticketRows, error: ticketError } = await userClient.rpc(
      "prepare_voice_upload",
      {
        p_conversation_id: body.conversationId,
        p_mime_type: body.mimeType,
        p_duration_ms: body.durationMs,
        p_size_bytes: body.sizeBytes,
        p_client_nonce: body.clientNonce,
      },
    );
    if (ticketError || !Array.isArray(ticketRows) || !ticketRows[0]?.object_path) {
      const safeError = SAFE_RPC_ERRORS.has(ticketError?.message ?? "")
        ? ticketError?.message
        : "ticket_rejected";
      return reply(
        safeError === "rate_limited" ? 429 : 400,
        { error: safeError },
        origin,
      );
    }

    const objectPath = String(ticketRows[0].object_path);
    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: signedUpload, error: uploadError } = await adminClient.storage
      .from("voice-messages")
      .createSignedUploadUrl(objectPath, { upsert: false });

    if (uploadError || !signedUpload?.token) {
      console.error("voice_upload_ticket_failed", uploadError?.name ?? "unknown");
      return reply(503, { error: "upload_ticket_unavailable" }, origin);
    }

    return reply(
      200,
      {
        objectPath,
        token: signedUpload.token,
        expiresInSeconds: Number(ticketRows[0].expires_in_seconds ?? 7200),
      },
      origin,
    );
  } catch (error) {
    console.error(
      "voice_upload_ticket_configuration_error",
      error instanceof Error ? error.message.split(":")[0] : "unknown",
    );
    return reply(503, { error: "server_not_configured" }, origin);
  }
});
