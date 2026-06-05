# Task 008: 데이터베이스 구축 및 모임 CRUD Server Actions

## 개요

Phase 3 핵심 기능 구현의 첫 번째 단계. Supabase에 6개 신규 테이블을 마이그레이션하고, RLS 정책을 적용하여 권한을 분리한다.
모임 CRUD Server Actions(F001~F004)를 구현하고, 기존 더미 데이터를 실제 Supabase 쿼리로 교체한다.
공지/참여자/정산/카풀 기능(Task 009~010)의 Server Actions는 스켈레톤 유지.

---

## 완료 기준

- [ ] `tasks/008-database-crud.md` 파일 생성
- [ ] Supabase 6개 테이블 마이그레이션 적용 (profiles role 컬럼, events, event_participants, event_announcements, carpools, carpool_requests)
- [ ] RLS 정책 적용 및 검증 (Host/Member/Admin 권한 분리)
- [ ] `generate_typescript_types`로 DB 타입 동기화 확인
- [ ] `getEvents()` Server Action 구현 (주최/참여 모임 분리 조회)
- [ ] `createEvent()` Server Action 구현 (F001)
- [ ] `getEvent(eventId)` Server Action 구현 (F003)
- [ ] `updateEvent(eventId)` Server Action 구현 (F004)
- [ ] `deleteEvent(eventId)` Server Action 구현 (F004)
- [ ] 모임 생성/수정 폼 Client Component 분리 (`EventCreateForm`, `EventEditForm`)
- [ ] 홈/목록/상세 페이지 더미 데이터 교체 (공지/참여자/정산/카풀 더미 유지)
- [ ] `npm run build` 프로덕션 빌드 성공
- [ ] Playwright MCP E2E 테스트 통과

---

## 관련 파일

### 신규 생성

- `tasks/008-database-crud.md` — 이 파일
- `components/events/event-create-form.tsx` — 모임 생성 폼 Client Component
- `components/events/event-edit-form.tsx` — 모임 수정 폼 Client Component

### 수정 대상

- `app/protected/events/actions.ts` — 모임 CRUD Server Actions 구현
- `app/protected/events/[eventId]/actions.ts` — 이벤트별 Server Actions 구현
- `app/protected/events/new/page.tsx` — EventCreateForm 연결
- `app/protected/events/[eventId]/edit/page.tsx` — getDummyEvent 제거, EventEditForm 연결
- `app/protected/page.tsx` — 더미 데이터 교체
- `app/protected/events/page.tsx` — 더미 데이터 교체
- `app/protected/events/[eventId]/page.tsx` — event 더미 교체 (나머지 유지)

### 참조

- `tasks/002-types.md` — DB 스키마 SQL, RLS 정책 설계
- `app/protected/profile/actions.ts` — 인증 패턴, 에러 처리 패턴
- `types/database.types.ts` — EventFormState, Event 등 타입
- `lib/dummy/` — 교체 전 더미 데이터 구조 참조

---

## 구현 단계

### Step 1: DB 마이그레이션 적용

1. `mcp__supabase__list_tables`로 현재 테이블 확인
2. `mcp__supabase__list_extensions`로 moddatetime 확장 확인
3. `mcp__supabase__apply_migration`으로 순서대로 적용:
   - `001_add_role_to_profiles`
   - `002_create_events`
   - `003_create_event_participants`
   - `004_create_event_announcements`
   - `005_create_carpools`
   - `006_create_carpool_requests`

### Step 2: RLS 정책 적용

1. `mcp__supabase__apply_migration`으로 RLS 정책 적용:
   - events, event_participants, event_announcements, carpools, carpool_requests 테이블
2. `mcp__supabase__get_advisors({ type: 'security' })`로 검증

### Step 3: TypeScript 타입 동기화

1. `mcp__supabase__generate_typescript_types` 실행
2. 생성된 타입과 `types/database.types.ts` 수동 타입 비교/보완

### Step 4: 모임 CRUD Server Actions 구현

1. `app/protected/events/actions.ts` — `getEvents()`, `createEvent()` 구현
2. `app/protected/events/[eventId]/actions.ts` — `getEvent()`, `updateEvent()`, `deleteEvent()` 구현
3. `app/protected/profile/actions.ts` 인증 패턴 재사용

### Step 5: 폼 Client Component 분리 및 연결

1. `components/events/event-create-form.tsx` 생성 — `useActionState(createEvent, ...)`
2. `components/events/event-edit-form.tsx` 생성 — `updateEvent.bind(null, eventId)` 패턴
3. `app/protected/events/new/page.tsx` — EventCreateForm 렌더링
4. `app/protected/events/[eventId]/edit/page.tsx` — getEvent 호출 + EventEditForm 렌더링

### Step 6: 더미 데이터 교체

1. `app/protected/page.tsx` — getDummyHostedEvents/JoinedEvents → getEvents()
2. `app/protected/events/page.tsx` — 동일
3. `app/protected/events/[eventId]/page.tsx` — getDummyEvent → getEvent(eventId), CURRENT_USER_ID → getClaims()

### Step 7: 빌드 검증 및 E2E 테스트

1. `npm run type-check` → `npm run lint` → `npm run build`
2. Playwright MCP E2E 테스트 실행

---

## 테스트 체크리스트

Playwright MCP를 사용하여 아래 시나리오를 테스트한다.

### 모임 CRUD 플로우

- [ ] 로그인 후 `/protected/events/new` 접속 → 폼 표시 확인
- [ ] 제목 없이 제출 → 에러 메시지 표시 확인
- [ ] 정상 입력 후 제출 → 상세 페이지(`/protected/events/{id}`)로 이동 확인
- [ ] `/protected/events` 접속 → 생성한 모임이 "주최한 모임" 탭에 표시 확인
- [ ] `/protected` (홈) → 생성한 모임이 "내가 주최한 모임"에 표시 확인
- [ ] 수정 버튼 클릭 → 기존 데이터가 폼에 기본값으로 표시 확인
- [ ] 수정 후 제출 → 변경된 데이터가 상세 페이지에 반영 확인
- [ ] 삭제 후 → 목록 페이지로 이동, 삭제된 모임 없음 확인

### 권한 검증

- [ ] 비인증 사용자가 `/protected` 접근 시 `/auth/login`으로 리다이렉트 확인
- [ ] 비호스트 사용자로 수정 시도 → 권한 없음 메시지 확인

### Supabase 최종 검증

- [ ] `mcp__supabase__get_advisors({ type: 'security' })` — RLS 경고 없음
- [ ] `mcp__supabase__get_advisors({ type: 'performance' })` — 성능 권고 확인
- [ ] `mcp__supabase__get_logs({ service: 'postgres' })` — DB 에러 없음
