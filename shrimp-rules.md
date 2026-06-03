# Development Guidelines

## Project Overview

- Next.js 15 App Router + Supabase 기반 풀스택 인증 앱
- 기술 스택: Next.js 15, TypeScript, Supabase (`@supabase/ssr`), shadcn/ui, Tailwind CSS, next-themes
- 환경변수: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (`.env.local`)

---

## Project Architecture

### 디렉토리 구조

```
app/                    # 공개 라우트
app/auth/               # 인증 라우트 (login, sign-up, forgot-password, update-password, confirm, callback, error)
app/protected/          # 인증 필요 라우트 (미들웨어가 비인증 사용자를 /auth/login으로 리다이렉트)
app/protected/profile/  # 프로필 페이지 + Server Actions (actions.ts)
components/             # 기능 컴포넌트 (폼, 버튼 등)
components/ui/          # shadcn/ui 기본 컴포넌트 (직접 수정 지양)
components/tutorial/    # 튜토리얼 전용 컴포넌트
lib/supabase/           # Supabase 클라이언트 팩토리
lib/utils.ts            # cn() 유틸리티, hasEnvVars 상수
types/database.types.ts # DB 관련 타입 정의
proxy.ts                # Next.js 미들웨어 진입점 (파일명 주의: middleware.ts가 아님)
```

---

## Supabase 클라이언트 규칙

### 클라이언트 선택

| 사용 위치                                        | import 경로             | 비고                   |
| ------------------------------------------------ | ----------------------- | ---------------------- |
| Server Component / Server Action / Route Handler | `@/lib/supabase/server` | `async createClient()` |
| Client Component                                 | `@/lib/supabase/client` | `createClient()`       |
| 미들웨어 (`proxy.ts`)                            | `@/lib/supabase/proxy`  | `updateSession()`      |

### **절대 금지**

- 전역 변수에 Supabase 클라이언트 저장 금지 — 반드시 매 함수 호출 시 새로 생성
- `supabase.auth.getUser()` 또는 `supabase.auth.getSession()` 사용 금지 — 반드시 `supabase.auth.getClaims()` 사용
- 환경변수 키 이름 `NEXT_PUBLIC_SUPABASE_ANON_KEY` 사용 금지 — `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` 사용

### 인증 상태 확인 패턴

```ts
// Server Component / Server Action
const supabase = await createClient();
const { data, error: claimsError } = await supabase.auth.getClaims();
if (claimsError || !data?.claims) redirect("/auth/login");
const userId = data.claims.sub;
```

---

## 미들웨어 규칙

- 미들웨어 진입점 파일: `proxy.ts` (루트 위치) — **`middleware.ts`로 이름 변경 금지**
- `proxy.ts`는 `lib/supabase/proxy.ts`의 `updateSession()`만 호출
- `lib/supabase/proxy.ts`에서 `getClaims()` 호출 후 즉시 라우트 보호 로직 실행
- `getClaims()` 호출과 다음 코드 사이에 임의 로직 삽입 금지 (세션 로그아웃 버그 유발)
- `updateSession()`이 반환한 `supabaseResponse`를 **그대로** 반환 — 새로운 `NextResponse` 생성 시 쿠키 복사 필수

### 보호 라우트 확장

새 보호 라우트 추가 시 `lib/supabase/proxy.ts`의 조건문에 경로 추가:

```ts
// 현재 패턴: /protected/** 는 자동 보호됨
if (
  request.nextUrl.pathname !== "/" &&
  !user &&
  !request.nextUrl.pathname.startsWith("/login") &&
  !request.nextUrl.pathname.startsWith("/auth")
) { ... }
```

---

## Server Actions 규칙

- 모든 Server Action 파일 상단에 `"use server"` 지시문 추가
- 폼 처리는 `useActionState` 훅 + Server Action 패턴 사용 (`components/profile-form.tsx` 참고)
- Server Action 시그니처: `async function actionName(_prevState: StateType, formData: FormData): Promise<StateType>`
- 상태 타입은 `types/database.types.ts`에 정의
- DB 변경 후 반드시 `revalidatePath()` 호출

### Server Action 파일 위치

- 특정 페이지 전용: `app/[route]/actions.ts`
- 공용: `app/actions/` 디렉토리 생성

---

## 타입 관리 규칙

- DB 테이블 관련 타입은 `types/database.types.ts`에만 정의
- `interface` 대신 `type` 키워드 사용
- 타입 import 시 `import type` 명시
- 새 테이블 추가 시 `types/database.types.ts`에 타입 추가 필수

---

## 컴포넌트 규칙

### shadcn/ui 컴포넌트

- `components/ui/` 내 파일 직접 수정 지양 — shadcn CLI로 추가/업데이트
- 새 shadcn 컴포넌트 추가: `npx shadcn@latest add [component-name]`
- `components.json` 설정 기반으로 자동 생성됨

### 기능 컴포넌트

- 클라이언트 컴포넌트에 `"use client"` 지시문 명시
- 서버 컴포넌트가 기본 — 클라이언트 상태/이벤트 핸들러 필요 시에만 `"use client"` 추가
- Tailwind 클래스 병합 시 `cn()` 함수 사용 (`@/lib/utils`)

### 다크 모드

- `next-themes`의 `ThemeProvider`는 `app/layout.tsx`에 위치 — 중복 배치 금지
- 다크 모드 대응 색상은 Tailwind의 `dark:` prefix 사용

---

## 라우트 추가 규칙

### 공개 라우트

- `app/` 하위에 `page.tsx` 생성

### 인증 라우트

- `app/auth/` 하위에 추가
- OTP 확인 흐름: `app/auth/confirm/route.ts` 참고
- OAuth 콜백: `app/auth/callback/route.ts` 참고

### 보호 라우트

- `app/protected/` 하위에 추가 (미들웨어가 자동 보호)
- 레이아웃은 `app/protected/layout.tsx`에서 상속됨
- 네비게이션 링크 추가 시 `app/protected/layout.tsx`의 nav 섹션에도 추가

---

## 코드 스타일 규칙

- 따옴표: 이중 따옴표 (`"`)
- 세미콜론: 항상 사용
- 들여쓰기: 2칸 스페이스
- 줄 끝: LF
- 미사용 import 금지 (pre-commit 훅이 자동 제거)
- `import type` 명시 필수

---

## 금지 사항

- `supabase.auth.getUser()` / `supabase.auth.getSession()` 사용 — `getClaims()` 사용
- 전역 변수에 Supabase 클라이언트 저장
- `proxy.ts` 파일명 변경 (미들웨어 진입점)
- `components/ui/` 파일 직접 수정 (shadcn CLI 사용)
- Server Component에서 브라우저 클라이언트(`lib/supabase/client.ts`) 사용
- Client Component에서 서버 클라이언트(`lib/supabase/server.ts`) import
- `getClaims()` 호출 전후에 임의 로직 삽입 (`lib/supabase/proxy.ts` 내)
- `NextResponse.next()`로 새 응답 생성 시 쿠키 복사 생략

---

## 주요 파일 연동 규칙

| 작업                   | 수정 파일                                                           |
| ---------------------- | ------------------------------------------------------------------- |
| 새 DB 테이블 타입 추가 | `types/database.types.ts`                                           |
| 새 보호 라우트 추가    | `app/protected/[route]/page.tsx` + `app/protected/layout.tsx` (nav) |
| 새 인증 흐름 추가      | `app/auth/[route]/page.tsx` + 관련 컴포넌트 `components/`           |
| 환경변수 추가          | `.env.local` + `lib/utils.ts` (`hasEnvVars` 업데이트 검토)          |
| Supabase 스키마 변경   | Supabase MCP `apply_migration` + `types/database.types.ts`          |
