# Task 011: Admin 기능 구현

## 개요

Phase 3 마지막 단계. Admin 통계 대시보드(F013), 사용자 관리(F014), 모임 강제 관리(F015)를
실제 Supabase 쿼리로 구현한다. Task 007에서 더미 데이터로 구현된 Admin 페이지 3개를 실제 DB로
교체하고, Admin 권한 가드를 실제 `profiles.role` 검증으로 교체한다.
`profiles` UPDATE RLS 정책에 Admin 허용을 추가하는 마이그레이션도 포함한다.

---

## 완료 기준

- [ ] `tasks/011-admin-features.md` 파일 생성
- [ ] `profiles` UPDATE RLS 정책에 Admin 허용 추가 (마이그레이션)
- [ ] `getAdminStats()` 실제 집계 쿼리 구현 (total/new/active/settlement_rate)
- [ ] `getUsers()` 실제 profiles 조회 구현
- [ ] `updateUserRole(userId, role)` 실제 구현
- [ ] `forceCloseEvent(eventId)` / `forceCancelEvent(eventId)` / `forceDeleteEvent(eventId)` 실제 구현
- [ ] `requireAdmin()` 헬퍼 구현 (getClaims + profiles.role 검증)
- [ ] `admin/layout.tsx` 권한 가드 실제 DB 검증으로 교체 (DUMMY_USERS 제거)
- [ ] `admin/page.tsx` 더미 통계 → `getAdminStats()` 교체
- [ ] `admin/users/page.tsx` `DUMMY_USERS` → `getUsers()` 교체
- [ ] `admin/events/page.tsx` `DUMMY_EVENTS` → 실제 events 쿼리 교체
- [ ] `user-table.tsx` `updateUserRole` Server Action 연결 (useTransition + AlertDialog)
- [ ] `event-table.tsx` `forceCloseEvent`/`forceCancelEvent` Server Action 연결 (useTransition + AlertDialog)
- [ ] `npm run build` 프로덕션 빌드 성공
- [ ] Playwright MCP E2E 테스트 통과

---

## 관련 파일

### 신규 생성

- `tasks/011-admin-features.md` — 이 파일

### 수정 대상

- `app/protected/admin/actions.ts` — 6개 스켈레톤 함수 실제 구현, requireAdmin 헬퍼 추가
- `app/protected/admin/layout.tsx` — DUMMY_USERS 더미 권한 가드 → getClaims+profiles.role 교체
- `app/protected/admin/page.tsx` — getDummyAdminStats() → getAdminStats() 교체
- `app/protected/admin/users/page.tsx` — DUMMY_USERS → getUsers() 교체
- `app/protected/admin/events/page.tsx` — DUMMY_EVENTS → 실제 Supabase 쿼리 교체
- `components/admin/user-table.tsx` — updateUserRole Server Action 연결
- `components/admin/event-table.tsx` — forceCloseEvent/forceCancelEvent Server Action 연결

### 참조

- `tasks/010-settlement-carpool.md` — 이전 작업 패턴 참조
- `app/protected/events/[eventId]/actions.ts` — getClaims → 권한검증 → DB작업 → revalidatePath 패턴
- `components/events/announcement-actions.tsx` — useTransition + AlertDialog 패턴 참조
- `components/events/settlement-payment-button.tsx` — useTransition 패턴 참조
- `types/database.types.ts` — AdminStats, Profile, UserRole 타입
- `lib/dummy/index.ts` — 제거할 더미 함수 목록

---

## 구현 단계

### Step 1: RLS 마이그레이션

1. `profiles` UPDATE 정책에 Admin 허용 추가 (현재 자기 자신만 허용)
2. Supabase MCP `apply_migration`으로 적용

### Step 2: Admin Server Actions 구현

1. `requireAdmin(supabase)` 헬퍼 — getClaims → userId → profiles.role 검증 → 비Admin시 redirect
2. `getAdminStats()` — Promise.all로 4가지 집계 쿼리 병렬 실행
3. `getUsers()` — profiles 전체 조회, created_at 내림차순
4. `updateUserRole(userId, role)` — requireAdmin + profiles UPDATE + revalidatePath
5. `forceCloseEvent(eventId)` — requireAdmin + events UPDATE status='closed'
6. `forceCancelEvent(eventId)` — requireAdmin + events UPDATE status='cancelled'
7. `forceDeleteEvent(eventId)` — requireAdmin + events DELETE

### Step 3: Admin 레이아웃 권한 가드 교체

1. `layout.tsx` async Server Component로 변환
2. DUMMY_USERS/CURRENT_USER_ID import 제거
3. createClient → getClaims → profiles.role 검증으로 교체

### Step 4: Admin 페이지 더미 데이터 교체

1. `admin/page.tsx` — getDummyAdminStats() → getAdminStats()
2. `admin/users/page.tsx` — DUMMY_USERS → getUsers()
3. `admin/events/page.tsx` — DUMMY_EVENTS → Supabase events + participants count 쿼리

### Step 5: Client Component Server Action 연결

1. `user-table.tsx` — useTransition + updateUserRole, DropdownMenuItem onClick
2. `event-table.tsx` — useTransition + AlertDialog + forceCloseEvent/forceCancelEvent

### Step 6: 빌드 검증 및 E2E 테스트

1. `npm run type-check` → `npm run lint` → `npm run build`
2. Playwright MCP E2E 테스트 실행

---

## 테스트 체크리스트

Playwright MCP를 사용하여 아래 시나리오를 테스트한다.

### Admin 통계 대시보드 (F013)

- [ ] Admin 계정 로그인 → `/protected/admin` 접속
- [ ] 전체 모임 수, 이번 달 신규, 활성 모임, 정산 완료율 실제 숫자 표시 확인
- [ ] 비Admin 계정으로 `/protected/admin` 접속 → 접근 거부 UI 표시 확인

### 사용자 관리 (F014)

- [ ] `/protected/admin/users` → 실제 가입 사용자 목록 표시 확인
- [ ] 역할 변경 드롭다운 → '호스트로 변경' 클릭 → profiles.role 업데이트 확인
- [ ] 변경 후 목록 새로고침 시 변경된 역할 뱃지 표시 확인

### 모임 강제 관리 (F015)

- [ ] `/protected/admin/events` → 실제 모임 목록 표시 확인
- [ ] '마감' 버튼 클릭 → AlertDialog 확인 → 모임 status='closed' 변경 확인
- [ ] '취소' 버튼 클릭 → AlertDialog 확인 → 모임 status='cancelled' 변경 확인

### Supabase 최종 검증

- [ ] `mcp__supabase__get_advisors({ type: 'security' })` — RLS 경고 없음
- [ ] `mcp__supabase__get_logs({ service: 'postgres' })` — DB 에러 없음
