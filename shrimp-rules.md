# Development Guidelines

## 1. Project Overview

- Next.js 15 App Router + TypeScript 기반 풀스택 인증 앱
- Supabase (`@supabase/ssr`) 쿠키 기반 세션 관리
- Tailwind CSS v4 + shadcn/ui (Radix UI) UI 레이어
- next-themes 다크모드, Lucide React 아이콘
- 환경변수: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (`.env.local`)

## 2. Project Architecture

### Directory Structure

```
app/                        # 라우트 루트
  layout.tsx                # 루트 레이아웃 (ThemeProvider 포함)
  page.tsx                  # 공개 홈페이지
  globals.css               # 전역 스타일
  auth/                     # 인증 관련 라우트 (공개)
    login/page.tsx
    sign-up/page.tsx
    forgot-password/page.tsx
    update-password/page.tsx
    confirm/route.ts        # 이메일 인증 처리 Route Handler
    callback/route.ts       # OAuth 콜백 처리 Route Handler
    error/page.tsx
    sign-up-success/page.tsx
  protected/                # 인증 필수 라우트
    layout.tsx              # 보호된 레이아웃 (네비게이션 포함)
    page.tsx
    profile/
      page.tsx
      actions.ts            # 프로필 Server Actions
components/                 # 기능 컴포넌트
  ui/                       # shadcn/ui 기본 컴포넌트 (직접 수정 금지)
  tutorial/                 # 튜토리얼 전용 컴포넌트
lib/
  supabase/
    client.ts               # 브라우저 클라이언트 (Client Component 전용)
    server.ts               # 서버 클라이언트 (Server Component/Action 전용)
    proxy.ts                # 미들웨어용 클라이언트 + updateSession()
  utils.ts                  # cn(), hasEnvVars
types/
  database.types.ts         # DB 테이블 타입 정의
proxy.ts                    # 루트 미들웨어 진입점 (middleware.ts가 아님)
next.config.ts              # cacheComponents: true 설정됨
```

## 3. Critical Rules — Supabase Client

- **전역 변수로 Supabase 클라이언트를 저장하지 않는다.** 매 요청, 매 함수 호출 시 새로 생성한다.

| 사용 위치                                        | import 경로             | 함수                   |
| ------------------------------------------------ | ----------------------- | ---------------------- |
| Server Component / Server Action / Route Handler | `@/lib/supabase/server` | `await createClient()` |
| Client Component                                 | `@/lib/supabase/client` | `createClient()`       |
| 미들웨어 (`proxy.ts`)                            | `@/lib/supabase/proxy`  | `updateSession()`      |

- 인증 사용자 조회: 반드시 `supabase.auth.getClaims()` 사용
- **금지**: `getUser()`, `getSession()`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`

```ts
// 올바른 예 — Server Component / Server Action
const supabase = await createClient(); // lib/supabase/server.ts
const { data, error: claimsError } = await supabase.auth.getClaims();
if (claimsError || !data?.claims) redirect("/auth/login");
const userId = data.claims.sub;

// 잘못된 예
const supabase = globalThis.supabase; // 전역 변수 재사용 금지
const { data } = await supabase.auth.getUser(); // getUser() 금지
```

## 4. Authentication Flow

- `proxy.ts` (루트) → `lib/supabase/proxy.ts`의 `updateSession()` 호출
- `updateSession()` 내부에서 `getClaims()`로 세션 갱신 및 접근 제어
- 미인증 사용자: `/auth/login`으로 리다이렉트
- 공개 경로: `/` (홈), `/auth/**` — 이외 모든 경로는 인증 필요
- `proxy.ts` 파일명 변경 금지 (Next.js 미들웨어 진입점)
- `getClaims()` 호출과 다음 코드 사이에 임의 로직 삽입 금지 (세션 만료 디버깅 불가)
- `updateSession()`이 반환한 `supabaseResponse`를 그대로 반환 — 새 응답 생성 시 쿠키 복사 필수

### 보호 라우트 추가

- `app/protected/` 하위에 디렉토리/파일 생성
- 별도 미들웨어 설정 불필요 — `proxy.ts`가 자동 처리
- 네비게이션 링크 추가 시 `app/protected/layout.tsx`의 nav 섹션도 수정

## 5. Server Actions

- 파일 상단에 `"use server"` 지시어 필수
- 폼 처리는 `useActionState` 훅과 조합하여 사용
- 반환 타입: `{ success: boolean; message: string }` 형태의 상태 객체
- 빈 문자열 폼값은 `null`로 변환 후 DB에 저장
- DB 변경 후 반드시 `revalidatePath()` 호출
- 파일 위치: 특정 페이지 전용 → `app/protected/<route>/actions.ts`, 공용 → `app/actions/`

```ts
// 올바른 예 — actions.ts
"use server";

export async function updateSomething(
  _prevState: SomeFormState,
  formData: FormData
): Promise<SomeFormState> {
  const supabase = await createClient();
  const { data, error: claimsError } = await supabase.auth.getClaims();
  if (claimsError || !data?.claims) redirect("/auth/login");

  const value = formData.get("field") as string | null;
  const cleanValue = value === "" ? null : value;

  const { error } = await supabase.from("table").update({ value: cleanValue });
  if (error) return { success: false, message: error.message };

  revalidatePath("/protected/some-page");
  return { success: true, message: "저장되었습니다." };
}
```

## 6. Component Rules

### Server Component (기본값)

- `"use client"` 없이 작성
- `lib/supabase/server.ts`의 `createClient()` 사용
- 데이터 패칭 직접 수행 가능

### Client Component

- 파일 상단에 `"use client"` 필수
- `lib/supabase/client.ts`의 `createClient()` 사용
- `useActionState`, `useState`, `useRouter` 등 React 훅 사용 가능

### UI 컴포넌트

- shadcn/ui 기본 컴포넌트는 `components/ui/`에 위치 — **직접 수정하지 않는다**
- 새 shadcn 컴포넌트 추가: `npx shadcn@latest add <component-name>`
- 기능 컴포넌트는 `components/` 직하에 위치
- Tailwind 클래스 병합: 반드시 `cn()` 함수 사용 (`@/lib/utils`)

```ts
import { cn } from "@/lib/utils";
<div className={cn("base-class", condition && "conditional-class", className)} />
```

## 7. Type System

- DB 테이블 타입은 `types/database.types.ts`에만 정의
- `interface` 대신 `type` 키워드 사용
- 타입 import 시 `import type` 명시 필수
- 새 테이블 추가 시 `types/database.types.ts`에 타입 추가 필수

```ts
// 올바른 예
import type { Profile, ProfileFormState } from "@/types/database.types";

// 잘못된 예
import { Profile } from "@/types/database.types";
interface UserProfile { ... }
```

## 8. Styling Rules

- Tailwind CSS v4 사용 — v3 문법(`@tailwind base;` 등) 혼용 금지
- 다크모드: `next-themes` — `ThemeProvider`는 `app/layout.tsx`에만 위치, 중복 배치 금지
- 아이콘: Lucide React (`import { IconName } from "lucide-react"`)
- 인라인 스타일 사용 금지

## 9. File Interaction Rules

| 작업                 | 수정/생성 파일                                                     |
| -------------------- | ------------------------------------------------------------------ |
| 새 DB 테이블         | `types/database.types.ts` 타입 추가 필수                           |
| Supabase 스키마 변경 | Supabase MCP `apply_migration` + `types/database.types.ts`         |
| 새 보호 페이지       | `app/protected/<name>/page.tsx` + `app/protected/layout.tsx` (nav) |
| 새 공개 페이지       | `app/<name>/page.tsx` 생성                                         |
| 새 인증 라우트       | `app/auth/<name>/page.tsx` 또는 `route.ts`                         |
| 새 Server Action     | `app/protected/<name>/actions.ts`                                  |
| 새 기능 컴포넌트     | `components/<name>.tsx` 생성                                       |
| 새 shadcn 컴포넌트   | `npx shadcn@latest add` 실행 → `components/ui/` 자동 생성          |
| 라우트 보호 변경     | `lib/supabase/proxy.ts`의 경로 조건 수정                           |
| 환경변수 추가        | `.env.local` + `lib/utils.ts` (`hasEnvVars` 업데이트 검토)         |

## 10. Code Style

- 따옴표: 이중 따옴표 (`"`)
- 세미콜론: 항상 사용
- 들여쓰기: 2칸 스페이스
- 줄 끝: LF (Windows에서도 LF 강제, `.gitattributes`로 적용)
- 변수명/함수명: 영어
- 사용자 노출 텍스트, 주석: 한국어
- 미사용 import 금지 (`eslint-plugin-unused-imports` pre-commit 자동 제거)

## 11. Prohibited Actions

- `supabase.auth.getUser()` / `getSession()` 사용 — 반드시 `getClaims()` 사용
- 전역 변수/모듈 레벨에 Supabase 클라이언트 저장
- `proxy.ts` 파일명 변경 또는 `middleware.ts` 파일 별도 생성
- `components/ui/` 내 파일 직접 수정
- `lib/supabase/proxy.ts`의 `getClaims()` 호출 전후에 임의 로직 삽입
- `updateSession()` 반환값 외 새 `NextResponse` 생성 시 쿠키 복사 생략
- Server Component에서 브라우저 클라이언트(`lib/supabase/client.ts`) import
- Client Component에서 서버 클라이언트(`lib/supabase/server.ts`) import
- Tailwind CSS v3 문법 사용
- 인라인 스타일 사용
- `interface` 키워드 사용 (`type` 사용)
- type-only import에서 `import type` 생략
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` 환경변수 키 사용 (올바른 키: `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`)
