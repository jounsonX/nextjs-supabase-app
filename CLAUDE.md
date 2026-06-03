# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 개발 명령어

```bash
npm run dev           # 개발 서버 시작 (http://localhost:3000)
npm run build         # 프로덕션 빌드
npm run start         # 빌드된 앱 실행
npm run lint          # ESLint 검사
npm run lint:fix      # ESLint 자동 수정
npm run format        # Prettier 포맷 적용 (전체)
npm run format:check  # Prettier 포맷 검사 (CI용)
npm run type-check    # TypeScript 타입 체크
```

환경 변수 설정 (`.env.local`):

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

## 아키텍처 개요

Next.js 15 App Router + Supabase 기반 풀스택 앱. `@supabase/ssr`로 쿠키 기반 세션을 관리하며, 미들웨어에서 모든 요청의 인증 상태를 검사한다.

### 라우트 구조

- `app/` — 공개 라우트 (홈, 루트 레이아웃)
- `app/auth/` — 인증 라우트 (로그인, 회원가입, 비밀번호 초기화 등)
- `app/protected/` — 인증된 사용자 전용 라우트 (미들웨어가 비인증 사용자를 `/auth/login`으로 리다이렉트)

### 인증 흐름

1. `middleware.ts` → `lib/supabase/proxy.ts`의 `updateSession()` 호출
2. `updateSession()`이 쿠키를 읽어 세션 갱신 후 보호된 라우트 접근 제어
3. 서버 컴포넌트에서는 `lib/supabase/server.ts`의 클라이언트로 `supabase.auth.getClaims()` 사용
4. 클라이언트 컴포넌트에서는 `lib/supabase/client.ts`의 브라우저 클라이언트 사용

### 주요 디렉토리

- `lib/supabase/` — 서버/클라이언트/미들웨어용 Supabase 클라이언트 팩토리
- `components/ui/` — shadcn/ui 기반 기본 UI 컴포넌트 (Radix UI + Tailwind)
- `components/` — 인증 폼, 프로필 폼 등 기능 컴포넌트
- `app/protected/profile/actions.ts` — 프로필 조회/수정 Server Actions
- `types/database.types.ts` — Supabase 테이블 타입 (`Profile`, `ProfileUpdate`)

## 개발 도구

### 코드 품질 도구

- **ESLint** — Flat Config (`eslint.config.mjs`), `next/core-web-vitals` + `next/typescript` 기반
  - `eslint-plugin-unused-imports`: 미사용 import 커밋 전 자동 제거 (`eslint --fix`)
  - `eslint-config-prettier`: Prettier와 충돌하는 ESLint 규칙 비활성화
- **Prettier** — `.prettierrc` 설정 (이중 따옴표, 세미콜론, LF, 2칸 스페이스)
  - `prettier-plugin-tailwindcss`: Tailwind 클래스 자동 정렬

### Git 훅

- **Husky v9** + **lint-staged**: pre-commit 시 스테이징된 파일에만 자동 실행
  - `*.{ts,tsx}`: `eslint --fix` → `prettier --write`
  - `*.{js,mjs,cjs}`: `prettier --write`
  - `*.{json,md,css}`: `prettier --write`

### 코드 스타일 규칙

- 따옴표: 이중 따옴표
- 세미콜론: 항상 사용
- 들여쓰기: 2칸 스페이스
- 줄 끝: LF (`.gitattributes`로 강제 — Windows `core.autocrlf=true` 무력화)
- TypeScript: `type` 키워드 선호, `import type` 명시

## 핵심 패턴

**Server Actions**: 폼 처리는 `"use server"` + `useActionState` 조합 사용 (프로필 업데이트 참고)

**Supabase 클라이언트**: 서버 컴포넌트에서 전역 변수로 클라이언트를 생성하면 안 됨 — 매 요청마다 새로 생성해야 함

**스타일링**: `lib/utils.ts`의 `cn()` 함수로 Tailwind 클래스 병합 (clsx + tailwind-merge)

**다크 모드**: `next-themes` 사용, `ThemeProvider`는 루트 레이아웃에 위치

**환경 변수 체크**: `lib/utils.ts`의 `hasEnvVars`로 Supabase 환경 변수 설정 여부 확인 — 미설정 시 `<EnvVarWarning />` 표시
