# MeetUp Manager 개발 로드맵

소규모 친목 모임(5~20명) 주최자가 공지·참여자 관리·카풀·정산을 카카오톡 단체방 없이 한 곳에서 처리하는 모임 운영 플랫폼

## 개요

MeetUp Manager는 수영/헬스/친구 소셜 모임을 주관하거나 참여하는 5~20인 규모 모임의 주최자·참여자·운영자를 위한 통합 모임 관리 플랫폼으로 다음 기능을 제공합니다:

- **모임 관리**: 모임 생성·수정·삭제, 목록/상세 조회 (F001~F004)
- **공지 관리**: 공지 작성·삭제·핀 고정, 공지 목록 조회 (F005~F006)
- **참여자 관리**: 참여 신청/취소, 정원 초과 시 대기자 자동 처리, 주최자의 승인/거절 (F007~F008)
- **정산 관리**: 1/n 자동 계산(올림) 및 참여자별 완료 체크 (F009)
- **카풀 매칭**: 드라이버 카풀 등록 및 참여자 선착순 동승 신청 (F010)
- **Admin 운영**: 플랫폼 통계 대시보드, 사용자 역할 관리, 모임 강제 관리 (F013~F015)
- **인증/프로필**: 이메일·Google OAuth·카카오 인증, 표시 이름 프로필 관리 (F011~F012)

## 개발 워크플로우

1. **작업 계획**

- 기존 코드베이스를 학습하고 현재 상태를 파악
- 새로운 작업을 포함하도록 `ROADMAP.md` 업데이트
- 우선순위 작업은 마지막 완료된 작업 다음에 삽입

2. **작업 생성**

- 기존 코드베이스를 학습하고 현재 상태를 파악
- `/tasks` 디렉토리에 새 작업 파일 생성
- 명명 형식: `XXX-description.md` (예: `001-skeleton.md`)
- 고수준 명세서, 관련 파일, 수락 기준, 구현 단계 포함
- API/비즈니스 로직 작업 시 "## 테스트 체크리스트" 섹션 필수 포함 (Playwright MCP 테스트 시나리오 작성)
- 예시를 위해 `/tasks` 디렉토리의 마지막 완료된 작업 참조. 현재 작업이 `008`이라면 `007`과 `006`을 예시로 참조.
- 완료된 작업 파일은 체크된 박스와 변경 사항 요약을 포함하며, 새 작업은 빈 박스와 변경 사항 요약이 없어야 함. 초기 상태 샘플은 `000-sample.md` 참조.

3. **작업 구현**

- 작업 파일의 명세서를 따름
- 기능과 기능성 구현
- API 연동 및 Server Actions, 비즈니스 로직 구현 시 Playwright MCP로 테스트 수행 필수
- 각 단계 후 작업 파일 내 단계 진행 상황 업데이트
- 구현 완료 후 Playwright MCP를 사용한 E2E 테스트 실행
- 테스트 통과 확인 후 다음 단계로 진행
- 각 단계 완료 후 중단하고 추가 지시를 기다림

4. **로드맵 업데이트**

- 로드맵에서 완료된 작업을 ✅로 표시

## 기술 스택

- **프레임워크**: Next.js 15.5.3 App Router + React 19 (useActionState) + TypeScript 5 (strict)
- **백엔드**: Supabase (PostgreSQL + RLS + Auth: 이메일/비밀번호 + Google OAuth + 카카오)
- **세션 관리**: `@supabase/ssr` (쿠키 기반, 미들웨어 세션 갱신)
- **UI**: TailwindCSS v4 + shadcn/ui (Radix UI 기반) + Lucide React
- **폼 처리**: React Hook Form 7.x + Zod, Server Actions + `useActionState` 패턴
- **캐시 무효화**: `revalidatePath()`
- **테스트**: Playwright MCP (E2E / 통합 테스트)
- **배포**: Vercel

## 개발 단계

### Phase 1: 애플리케이션 골격 구축

- **Task 001: 라우트 구조 및 페이지 골격 생성** - 우선순위
  - `app/protected/` 하위 전체 라우트 구조 생성 (홈, 모임 목록/생성/상세/수정, 공지 작성)
  - `app/protected/admin/` 하위 Admin 라우트 구조 생성 (대시보드, 사용자 관리, 모임 관리)
  - 12개 주요 페이지의 빈 껍데기 파일 생성 (PRD 페이지 목록 기준)
  - 모임 상세 페이지의 탭 구조(정보/공지/정산/카풀) 골격 구현
  - 각 도메인별 빈 Server Actions 파일 생성 (`events/actions.ts`, `admin/actions.ts` 등)
  - 보호 라우트 레이아웃 연동 확인 (미들웨어 인증 가드 동작 검증)

- **Task 002: 타입 정의 및 데이터 모델 설계**
  - `types/database.types.ts`에 신규 엔티티 타입 추가
    - `Event`, `EventInsert`, `EventUpdate` (status: open/closed/cancelled)
    - `EventParticipant` (status: pending/approved/rejected/waitlisted/cancelled, payment_done)
    - `EventAnnouncement` (is_pinned)
    - `Carpool`, `CarpoolRequest` (status: pending/accepted/rejected)
  - `Profile` 타입에 `role`(host/member/admin) 필드 정의 추가
  - Server Action 폼 상태 타입 정의 (`EventFormState`, `AnnouncementFormState` 등)
  - 정산/카풀/통계 비즈니스 로직용 파생 타입 정의 (`SettlementSummary`, `AdminStats` 등)
  - 6개 신규 테이블 DB 스키마 설계 (SQL 작성, 구현은 Phase 3)
  - RLS(Row Level Security) 정책 설계 문서화 (Host/Member/Admin 권한별)

- **Task 003: 공통 레이아웃 및 네비게이션 골격 구현**
  - 하단 탭 네비게이션 구현 (홈 / 모임 목록 / 프로필 — 모바일 우선)
  - 모임 생성 FAB(Floating Action Button) 골격 배치
  - Admin 전용 레이아웃 및 네비게이션 골격 (`app/protected/admin/layout.tsx`)
  - 기존 스타터킷 데모 UI(`FetchDataSteps`, `hero` 등) 정리 및 홈 골격으로 교체

### Phase 2: UI/UX 완성 (더미 데이터 활용)

- **Task 004: 공통 컴포넌트 및 더미 데이터 구축** ✅ - 완료
  - ✅ 추가 shadcn/ui 컴포넌트 도입 (tabs, dialog, textarea, select, avatar, table, separator)
  - ✅ 모임 카드, 참여자 배지, 상태 뱃지, 정원 표시 등 공통 컴포넌트 구현
  - ✅ 더미 데이터 생성 유틸리티 작성 (`lib/dummy/` — 모임/참여자/공지/카풀/사용자)
  - ✅ 디자인 시스템 및 스타일 가이드 적용 (`cn()` 유틸리티 기반, 다크 모드 대응)

- **Task 005: 인증/프로필 및 모임 목록·생성 UI 구현** ✅ - 완료
  - 홈 페이지 UI (내 모임 카드 요약 — 하단 탭 1번)
  - 모임 목록 페이지 UI (주최/참여 탭 분리, 더미 데이터 카드 그리드 — 하단 탭 2번)
  - 모임 생성 페이지 폼 UI (제목/일시/장소/정원/비용/설명 — FAB 진입)
  - 프로필 페이지 UI 보강 (표시 이름 조회·수정 — 하단 탭 3번)
  - 카카오 로그인 버튼 UI 추가 (로그인/회원가입 페이지)
  - 반응형 디자인 및 모바일 최적화

- **Task 006: 모임 상세 탭 UI 구현** ✅ - 완료
  - ✅ [정보] 탭: 모임 정보 표시, 참여 신청/취소 버튼, 참여자 목록 UI
  - ✅ [공지] 탭: 공지 목록 UI (핀 고정 우선 정렬), 작성/삭제 액션 UI
  - ✅ [정산] 탭: 1인당 금액 표시, 참여자별 완료 체크 UI
  - ✅ [카풀] 탭: 카풀 목록, 등록 폼, 동승 신청 버튼 UI
  - ✅ 주최자/참여자 권한별 UI 분기 처리
  - ✅ 모임 수정 페이지 및 공지 작성 페이지 UI 완성 (Host 전용)

- **Task 007: Admin 페이지 UI 구현** ✅ - 완료
  - ✅ Admin 대시보드 UI (총 모임 수·신규·활성·정산 완료율 카드/차트 — 더미 통계)
  - ✅ 사용자 관리 페이지 UI (가입자 테이블, 역할 변경 드롭다운)
  - ✅ 모임 관리 페이지 UI (모임 테이블, 강제 닫기/취소/삭제 액션 버튼)
  - ✅ Admin 전용 접근 분기 UI 처리 (더미 role 기반, fixed inset-0 오버레이 레이아웃)

### Phase 3: 핵심 기능 구현

- **Task 008: 데이터베이스 구축 및 모임 CRUD Server Actions** ✅ - 완료
  - ✅ Supabase에 6개 신규 테이블 마이그레이션 적용 (events, event_participants, event_announcements, carpools, carpool_requests, profiles role 컬럼)
  - ✅ RLS 정책 적용 및 검증 (Host/Member/Admin 권한 분리)
  - ✅ `generate_typescript_types`로 DB 타입 동기화
  - ✅ 모임 CRUD Server Actions 구현 (생성/목록/상세/수정/삭제) — F001~F004
  - ✅ 주최/참여 모임 분리 조회 쿼리 구현
  - ✅ 더미 데이터를 실제 Supabase 쿼리로 교체, `revalidatePath()` 캐시 무효화 적용
  - ✅ **테스트**: Playwright MCP로 모임 CRUD E2E 테스트 (생성→목록→상세→수정→삭제, 권한 검증)

- **Task 009: 공지 및 참여자 관리 기능 구현** ✅ - 완료
  - ✅ 공지 작성/삭제/핀 고정·해제 Server Actions (Host 전용) — F005~F006
  - ✅ 핀 고정 우선 공지 목록 조회 — F006
  - ✅ 참여 신청/취소 Server Actions (정원 초과 시 waitlisted 자동 처리) — F007
  - ✅ 주최자 참여자 승인/거절 Server Actions, 취소 시 waitlist 자동 승급 — F008
  - ✅ 권한 검증 로직 (Host만 승인/거절/공지 관리 가능)
  - ✅ 모임 수정/삭제 전 AlertDialog 확인 절차 추가
  - ✅ 모임 상세 헤더 레이아웃 개선 (상태 배지 제목 인라인 배치, 수정 버튼 아이콘화)
  - ✅ **테스트**: Playwright MCP로 공지 작성/핀 고정 및 참여 신청→승인→대기자 승급 플로우 E2E 테스트

- **Task 010: 정산 및 카풀 기능 구현** ✅ - 완료
  - ✅ 정산 관리 Server Actions — F009
    - ✅ 1인당 금액 = `Math.ceil(cost / 승인된 참여자 수)` 계산 로직
    - ✅ 참여자별 `payment_done` 토글 처리 (Host 전용)
  - ✅ 카풀 매칭 Server Actions — F010
    - ✅ 드라이버 카풀 등록 (출발지·좌석 수)
    - ✅ 참여자 선착순 동승 신청 및 좌석 초과 시 거절 로직
  - ✅ **테스트**: Playwright MCP로 정산 계산(올림) 및 카풀 선착순 동승 자동 처리 로직 E2E 테스트

- **Task 011: Admin 기능 구현** ✅ - 완료
  - ✅ Admin 통계 집계 Server Actions (총 모임 수·신규·활성·정산 완료율) — F013
  - ✅ 사용자 목록 조회 및 역할(Host/Member/Admin) 변경 Server Actions — F014
  - ✅ 모임 강제 닫기·취소·삭제 Server Actions — F015
  - ✅ Admin 권한 가드 (layout.tsx async Server Component + profiles.role 검증)
  - ✅ 더미 통계를 실제 집계 쿼리로 교체 (3개 페이지)
  - ✅ profiles UPDATE RLS 정책 Admin 허용 마이그레이션
  - ✅ **테스트**: Playwright MCP로 Admin 통계 조회·역할 변경·모임 강제 마감 플로우 E2E 테스트

- **Task 011-1: 핵심 기능 통합 테스트**
  - Playwright MCP를 사용한 전체 사용자 플로우 테스트
    - 주최자: 모임 생성 → 공지 작성 → 참여자 승인 → 정산 관리
    - 참여자: 모임 탐색 → 참여 신청 → 카풀 동승 신청 → 정산 완료 확인
    - 운영자: 통계 조회 → 사용자 역할 변경 → 모임 강제 관리
  - 비즈니스 로직 경계값 검증 (정원 초과 대기자 처리, 정산 분배 올림, 카풀 선착순)
  - 에러 핸들링 및 엣지 케이스 테스트 (권한 없는 접근, 중복 신청, 동시성)

### Phase 4: 고급 기능 및 최적화

- **Task 012: 사용자 경험 향상 및 부가 기능**
  - 대기자(waitlisted) 자동 승급 처리 안정화 (승인 참여자 취소 시 연쇄 검증)
  - 모임 상태 전환 자동화 (정원 마감, 일시 경과 시 closed)
  - 모임 목록 검색/필터링 (상태별·키워드 필터)
  - 토스트 알림 및 로딩/에러 상태 UX 개선

- **Task 013: 성능 최적화 및 배포**
  - 쿼리 최적화 및 N+1 방지 (참여자 수 집계, 조인 최적화)
  - Supabase advisor 점검 (보안/성능 권고 반영, RLS 검증)
  - 접근성(a11y) 점검 및 SEO 메타데이터 적용
  - CI/CD 파이프라인 점검 (lint, type-check, format, E2E 테스트)
  - Vercel 배포 및 모니터링·로깅 구성

## 기존 완료 기능

다음 기능은 스타터킷 기반으로 이미 구현되었습니다. (F011 카카오 로그인은 Task 005에서 보강 예정)

- **F011: 기본 인증** (부분 완료)
  - ✅ 이메일/비밀번호 로그인·회원가입
  - ✅ Google OAuth 소셜 로그인
  - ✅ 비밀번호 초기화 및 업데이트
  - ✅ 미들웨어 기반 세션 관리 및 보호 라우트 가드
  - 카카오 소셜 로그인 (Task 005에서 추가)

- **F012: 프로필 관리** ✅ - 완료
  - ✅ 프로필 조회/수정 Server Actions
  - ✅ 프로필 폼 (`useActionState` 패턴)
  - ✅ `Profile`, `ProfileUpdate`, `ProfileFormState` 타입 정의 (표시 이름은 Task 002에서 `role` 필드 추가)

## 기능 매핑 표

| ID   | 기능명                  | 담당 Task            | Phase   |
| ---- | ----------------------- | -------------------- | ------- |
| F001 | 모임 생성               | Task 008             | Phase 3 |
| F002 | 모임 목록 조회          | Task 008             | Phase 3 |
| F003 | 모임 상세 조회          | Task 008             | Phase 3 |
| F004 | 모임 수정/삭제          | Task 008             | Phase 3 |
| F005 | 공지 작성/관리          | Task 009             | Phase 3 |
| F006 | 공지 목록 조회          | Task 009             | Phase 3 |
| F007 | 참여 신청/취소          | Task 009             | Phase 3 |
| F008 | 참여자 승인/거절        | Task 009             | Phase 3 |
| F009 | 정산 관리 (1/n 올림)    | Task 010             | Phase 3 |
| F010 | 카풀 매칭               | Task 010             | Phase 3 |
| F011 | 기본 인증 (카카오 추가) | 부분 완료 / Task 005 | -       |
| F012 | 프로필 관리             | 완료 ✅              | -       |
| F013 | Admin 통계 대시보드     | Task 011             | Phase 3 |
| F014 | 사용자 관리             | Task 011             | Phase 3 |
| F015 | 모임 강제 관리          | Task 011             | Phase 3 |

---

**📅 최종 업데이트**: 2026-06-06
**📊 진행 상황**: Phase 3 진행 중 (8/12 Tasks 완료 — Task 004, 005, 006, 007, 008, 009, 010, 011)
