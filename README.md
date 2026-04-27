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
