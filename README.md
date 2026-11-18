# blog-post-gen

네이버 블로그 포스팅 AI 생성기 — Cloudflare Pages + Workers 기반.

## 구조

```
blog-post-gen/
├── index.html              # 프론트엔드 (블로그 탭)
├── functions/
│   └── api/
│       └── generate.js    # Cloudflare Pages Function (Claude API 프록시)
├── _headers                # CORS 헤더
└── README.md
```

## 배포

```bash
npx wrangler pages deploy . --project-name blog-post-gen
```

배포 후 Cloudflare Pages 대시보드에서 `ANTHROPIC_API_KEY` 환경변수 설정 필요.

## 접속 코드

`/api/generate` 는 접속 코드 인증을 거친다. 코드가 맞지 않으면 Anthropic API를 호출하지 않고
`401` 을 반환한다.

- 우선순위: Cloudflare Pages 환경변수 `ACCESS_PASSWORD` → 코드에 정의된 기본값
- 전달 방법: 요청 헤더 `x-access-code` 또는 JSON 본문의 `accessCode` / `password`
- 비교는 앞뒤 공백·대소문자를 무시한다.
- 화면 상단의 `🔒 접속 코드` 칸에 입력하면 브라우저(localStorage)에 저장되어 이후 자동 전송된다.

코드를 바꾸려면 Cloudflare Pages 대시보드 → Settings → Environment variables 에서
`ACCESS_PASSWORD` 를 추가하는 것이 가장 안전하다 (저장소에 값이 남지 않는다).

## 지원 업종

- `pilates` — 필라테스·헬스·요가
- `cafe` — 카페·베이커리·디저트
- `beauty` — 미용실·네일·뷰티

## 로컬 테스트

```bash
open index.html
```

로컬에서는 `/api/generate` 호출 불가 (Cloudflare Workers 환경 필요).
Cloudflare Pages 배포 후 실제 동작 확인 권장.
