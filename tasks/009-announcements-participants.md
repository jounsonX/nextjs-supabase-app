# Task 009: 공지 및 참여자 관리

## 개요

Phase 3 핵심 기능 구현의 두 번째 단계. 공지 관리(F005~F006) 및 참여자 관리(F007~F008) 기능을 구현한다.
Task 008에서 생성된 스켈레톤 Server Actions를 완전 구현하고, 더미 데이터를 실제 Supabase 쿼리로 교체하며, Client Components로 버튼을 활성화한다.

---

## 완료 기준

- [ ] `tasks/009-announcements-participants.md` 파일 생성
- [ ] `getAnnouncements(eventId)` Server Action 구현
- [ ] `createAnnouncement()` Server Action 구현 (Host 전용, F005)
- [ ] `deleteAnnouncement()` Server Action 구현 (Host 전용, F006)
- [ ] `togglePin()` Server Action 구현 (Host 전용, F006)
- [ ] `joinEvent()` Server Action 구현 (정원 초과 시 waitlisted 처리, F007)
- [ ] `cancelParticipation()` Server Action 구현 (취소 시 대기자 자동 승급, F007)
- [ ] `approveParticipant()` Server Action 구현 (Host 전용, F008)
- [ ] `rejectParticipant()` Server Action 구현 (Host 전용, F008)
- [ ] `JoinButton` Client Component 생성 (참여 신청/취소)
- [ ] `ParticipantActions` Client Component 생성 또는 동등한 구현 (호스트용 승인/거절)
- [ ] `AnnouncementActions` Client Component 생성 (삭제/핀 고정)
- [ ] `AnnouncementForm` Client Component 생성 (공지 작성 폼)
- [ ] 상세 페이지 더미 데이터 교체 및 Client Components 연결
- [ ] 공지 작성 페이지 `AnnouncementForm` Server Action 연결
- [ ] `npm run build` 프로덕션 빌드 성공
- [ ] Playwright MCP E2E 테스트 통과

---

## 관련 파일

### 신규 생성

- `tasks/009-announcements-participants.md` — 이 파일
- `components/events/join-button.tsx` — 참여 신청/취소 Client Component
- `components/events/participant-manage-row.tsx` — 호스트용 참여자 승인/거절 Client Component
- `components/events/announcement-actions.tsx` — 공지 핀 고정/삭제 Client Component
- `components/events/announcement-form.tsx` — 공지 작성 폼 Client Component

### 수정 대상

- `app/protected/events/[eventId]/actions.ts` — 스켈레톤 Server Actions 완전 구현
- `app/protected/events/[eventId]/page.tsx` — 더미 데이터 교체, Client Components 연결
- `app/protected/events/[eventId]/announcements/new/page.tsx` — AnnouncementForm 연결

### 참조

- `tasks/002-types.md` — RLS 정책 설계, 참여 상태 플로우
- `app/protected/profile/actions.ts` — 인증 패턴 (getClaims → 권한 검증)
- `app/protected/events/[eventId]/actions.ts` — Task 008 기존 패턴 (getEvent 등)
- `types/database.types.ts` — Participant, Announcement, 관련 타입
- `components/events/event-edit-form.tsx` — useActionState 패턴 참조

---

## 구현 단계

### Step 1: 조회 Server Actions 구현

1. `getAnnouncements(eventId)` — event_announcements 조회, pinned 우선 정렬
2. `getParticipants(eventId)` — event_participants + profiles join 조회

### Step 2: 공지 관리 Server Actions 구현

1. `createAnnouncement(_prevState, formData)` — Host 권한 검증 + INSERT
2. `deleteAnnouncement(announcementId)` — Host 권한 검증 + DELETE
3. `togglePin(announcementId)` — Host 권한 검증 + pinned 반전 UPDATE

### Step 3: 참여자 관리 Server Actions 구현

1. `joinEvent(eventId)` — 중복/정원 체크, waitlisted 처리
2. `cancelParticipation(eventId)` — 취소 후 waitlisted → approved 자동 승급
3. `approveParticipant(participantId)` — Host 전용, status → approved
4. `rejectParticipant(participantId)` — Host 전용, status → rejected

### Step 4: Client Components 생성

1. `join-button.tsx` — `useActionState(joinEvent/cancelParticipation, ...)`
2. `participant-manage-row.tsx` — `approveParticipant/rejectParticipant` 연결
3. `announcement-actions.tsx` — `togglePin/deleteAnnouncement` 연결
4. `announcement-form.tsx` — `useActionState(createAnnouncement, ...)`

### Step 5: 상세 페이지 더미 데이터 교체 및 연결

1. `page.tsx` — getDummyAnnouncements/Participants → 실제 쿼리
2. JoinButton, ParticipantManageRow, AnnouncementActions 연결
3. 정산/카풀 더미 데이터는 Task 010 범위이므로 유지

### Step 6: 공지 작성 페이지 연결

1. `announcements/new/page.tsx` — 정적 form → AnnouncementForm 교체
2. 호스트 권한 검증 유지

### Step 7: 빌드 검증 및 E2E 테스트

1. `npm run type-check` → `npm run lint` → `npm run build`
2. Playwright MCP E2E 테스트 실행

---

## 테스트 체크리스트

Playwright MCP를 사용하여 아래 시나리오를 테스트한다.

### 공지 관리 플로우

- [ ] 호스트로 로그인 → 공지 작성 페이지 접속 → 공지 등록 확인
- [ ] 빈 내용 제출 → 에러 메시지 표시 확인
- [ ] 공지 핀 고정 버튼 클릭 → 상단 고정 확인
- [ ] 공지 삭제 → 목록에서 제거 확인
- [ ] 비호스트가 공지 작성 시도 → 권한 없음 확인

### 참여자 관리 플로우

- [ ] 다른 계정으로 로그인 → 모임 참여 신청 → "대기 중" 상태 확인
- [ ] 호스트로 로그인 → 참여자 승인 → "승인됨" 상태 확인
- [ ] 호스트로 참여자 거절 → "거절됨" 상태 확인
- [ ] 참여 취소 → 대기자 자동 승급 확인 (정원 초과 시)
- [ ] 정원 초과 신청 → waitlisted 처리 확인

### Supabase 최종 검증

- [ ] `mcp__supabase__get_advisors({ type: 'security' })` — RLS 경고 없음
- [ ] `mcp__supabase__get_logs({ service: 'postgres' })` — DB 에러 없음
