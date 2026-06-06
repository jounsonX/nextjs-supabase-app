# Task 010: 정산 및 카풀 기능 구현

## 개요

Phase 3 핵심 기능 구현의 세 번째 단계. 정산 관리(F009) 및 카풀 매칭(F010) 기능을 구현한다.
Task 008에서 생성된 스켈레톤 Server Actions(togglePayment, createCarpool, requestCarpool)를 완전 구현하고,
더미 데이터(getDummySettlement, getDummyCarpools)를 실제 Supabase 쿼리로 교체하며,
납부 확인 버튼과 동승 신청 버튼을 Client Components로 활성화한다.

---

## 완료 기준

- [ ] `tasks/010-settlement-carpool.md` 파일 생성
- [ ] `togglePayment(participantId)` Server Action 구현 (Host 전용, payment_done 토글)
- [ ] `getCarpools(eventId)` 조회 함수 구현 (carpool_requests join, remaining_seats 계산)
- [ ] `createCarpool()` Server Action 구현 (드라이버 등록, departure/capacity 필수)
- [ ] `requestCarpool()` Server Action 구현 (선착순 즉시 accepted, 좌석 초과 거절)
- [ ] `SettlementPaymentButton` Client Component 생성 (납부 확인/취소)
- [ ] `CarpoolRequestButton` Client Component 생성 (동승 신청, 좌석 초과 시 disabled)
- [ ] `CarpoolRegisterButton` createCarpool Server Action 연결 (TODO 제거)
- [ ] `page.tsx` 더미 데이터 교체 (getDummySettlement → event.cost, getDummyCarpools → getCarpools)
- [ ] `npm run build` 프로덕션 빌드 성공
- [ ] Playwright MCP E2E 테스트 통과

---

## 관련 파일

### 신규 생성

- `tasks/010-settlement-carpool.md` — 이 파일
- `components/events/settlement-payment-button.tsx` — 납부 확인/취소 Client Component
- `components/events/carpool-request-button.tsx` — 동승 신청 Client Component

### 수정 대상

- `app/protected/events/[eventId]/actions.ts` — 스켈레톤 Server Actions 완전 구현, getCarpools 추가
- `components/events/carpool-register-button.tsx` — createCarpool Server Action 연결
- `app/protected/events/[eventId]/page.tsx` — 더미 데이터 교체, Client Components 연결

### 참조

- `tasks/009-announcements-participants.md` — 이전 작업 패턴 참조
- `app/protected/events/[eventId]/actions.ts` — 기존 getClaims → 권한검증 → DB작업 → revalidatePath 패턴
- `types/database.types.ts` — CarpoolFormState, CarpoolRequestFormState, CarpoolWithRequests 타입
- `components/events/participant-manage-row.tsx` — useActionState 패턴 참조
- `components/events/carpool-register-button.tsx` — 기존 UI 골격 (TODO 주석 존재)

---

## 구현 단계

### Step 1: Server Actions 구현

1. `togglePayment(participantId)` — Host 전용, event_participants.payment_done 불리언 토글
2. `getCarpools(eventId)` — carpools + carpool_requests join, remaining_seats 계산 후 반환
3. `createCarpool(_prevState, formData)` — Host 또는 승인된 참여자 권한 검증, carpools INSERT
4. `requestCarpool(_prevState, formData)` — 좌석 초과 거절, 드라이버 본인 신청 방지, 즉시 accepted

### Step 2: 정산 납부 버튼 Client Component 생성

1. `settlement-payment-button.tsx` — useTransition으로 togglePayment 호출
2. `page.tsx` SettlementTab — getDummySettlement 제거, event.cost 직접 사용, 버튼 교체

### Step 3: 카풀 Client Components 연결

1. `carpool-request-button.tsx` — useActionState(requestCarpool), 잔여 좌석 0 시 disabled
2. `carpool-register-button.tsx` — useActionState(createCarpool) 연결, TODO 제거
3. `page.tsx` CarpoolTab — getDummyCarpools → getCarpools 교체, 버튼 컴포넌트 연결

### Step 4: 빌드 검증 및 E2E 테스트

1. `npm run type-check` → `npm run lint` → `npm run build`
2. Playwright MCP E2E 테스트 실행

---

## 테스트 체크리스트

Playwright MCP를 사용하여 아래 시나리오를 테스트한다.

### 정산 관리 플로우 (F009)

- [ ] 호스트 로그인 → 모임 상세 → 정산 탭 접속
- [ ] 승인된 참여자의 '납부 확인' 버튼 클릭 → payment_done=true 확인
- [ ] '납부 취소' 버튼 클릭 → payment_done=false 복구 확인
- [ ] 1인당 금액 = Math.ceil(cost / approved_count) 계산 검증
- [ ] 비호스트는 납부 버튼 미노출 확인

### 카풀 매칭 플로우 (F010)

- [ ] 호스트 로그인 → 카풀 탭 → '+ 카풀 등록' 클릭
- [ ] 출발지·좌석 수 입력 후 등록 → 카풀 카드 생성 확인
- [ ] 다른 계정으로 로그인 → 동승 신청 → 잔여 좌석 감소 확인
- [ ] 좌석 수 초과 시 '자리 없음' 버튼(disabled) 표시 확인
- [ ] 드라이버 본인이 동승 신청 시 거절 확인

### Supabase 최종 검증

- [ ] `mcp__supabase__get_advisors({ type: 'security' })` — RLS 경고 없음
- [ ] `mcp__supabase__get_logs({ service: 'postgres' })` — DB 에러 없음
