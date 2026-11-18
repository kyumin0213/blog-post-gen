// 접속 코드 기본값 (Cloudflare Pages 환경변수 ACCESS_PASSWORD 가 있으면 그 값이 우선)
const DEFAULT_ACCESS_CODE = "dailyk";

// 대소문자·앞뒤 공백을 무시하고 비교하기 위한 정규화
function normalizeCode(value) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

// 길이가 같을 때 내용을 한 번에 다 훑는 비교 (조기 반환으로 인한 타이밍 차이 최소화)
function codesMatch(a, b) {
  if (!a || !b || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, x-access-code",
  };
}

function json(body, status) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders() },
  });
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

export async function onRequestPost(context) {
  const { request, env } = context;

  // 1) 요청 본문 파싱
  let body;
  try {
    body = await request.json();
  } catch (error) {
    return json({ error: "요청 본문이 올바른 JSON이 아닙니다." }, 400);
  }

  // 2) 접속 코드 검증 — 헤더(x-access-code) 또는 본문(accessCode / password)
  const expected = normalizeCode(
    env && env.ACCESS_PASSWORD ? env.ACCESS_PASSWORD : DEFAULT_ACCESS_CODE
  );
  const provided = normalizeCode(
    request.headers.get("x-access-code") ||
      (body && (body.accessCode || body.access_code || body.password)) ||
      ""
  );

  if (!codesMatch(provided, expected)) {
    // 인증 실패 시 Anthropic API 는 절대 호출하지 않는다.
    return json(
      {
        error: "비밀번호가 올바르지 않습니다.",
        code: "INVALID_ACCESS_CODE",
      },
      401
    );
  }

  // 3) 정상 요청 처리
  try {
    const { systemPrompt, userMessage } = body;

    if (!systemPrompt || !userMessage) {
      return json({ error: "systemPrompt 와 userMessage 가 필요합니다." }, 400);
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 8000,
        system: systemPrompt,
        messages: [{ role: "user", content: userMessage }],
      }),
    });

    const data = await response.json();

    return json(data, response.status);
  } catch (error) {
    return json({ error: error.message }, 500);
  }
}
