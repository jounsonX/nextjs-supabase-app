# 모임 관리 플랫폼 개발 로드맵

소규모 정기 모임 주최자가 공지·참여자 관리·정산·카풀을 한 곳에서 처리하는 모임 운영 플랫폼

## 개요

본 프로젝트는 5~15인 규모의 소규모 정기 모임(수영/헬스 정기 운동, 친구 소셜 모임, 소규모 동호회)을 주관하는 주최자와 참여자를 위한 통합 모임 관리 플랫폼으로 다음 기능을 제공합니다:

- **모임 관리**: 모임 생성·수정·삭제, 목록/상세 조회 (F001~F004)
- **공지 관리**: 공지 작성·삭제·핀 고정, 공지 목록 조회 (F005~F006)
- **참여자 관리**: 참여 신청/취소, 주최자의 승인/거절 (F007~F008)
- **정산 관리**: N/1 균등 분배 정산 및 참여자별 완료 체크 (F009)
- **카풀 관리**: 카풀 등록 및 선착순 자동 수락 신청 (F010)
- **인증/프로필**: 이메일·Google OAuth 인증, 프로필 관리 (F011~F012, 기존 완료)

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

- **프레임워크**: Next.js 15 App Router + React 19 + TypeScript
- **백엔드**: Supabase (PostgreSQL + Auth: 이메일/비밀번호 + Google OAuth)
- **UI**: shadcn/ui (Radix UI + Tailwind CSS)
- **데이터 처리**: Server Actions + `useActionState` 패턴
- **인증 가드**: `getClaims()` → `redirect("/auth/login")`
- **캐시 무효화**: `revalidatePath()`
- **테스트**: Playwright MCP (E2E / 통합 테스트)

## 개발 단계

### Phase 1: 애플리케이션 골격 구축

- **Task 001: 라우트 구조 및 페이지 골격 생성** - 우선순위
  - `app/protected/events/` 하위 전체 라우트 구조 생성
  - 모든 주요 페이지의 빈 껍데기 파일 생성 (목록, 생성, 상세, 수정, 공지 작성)
  - 모임 상세 페이지의 탭 구조(정보/공지/정산/카풀) 골격 구현
  - `app/protected/page.tsx`를 내 모임 대시보드 골격으로 교체
  - `app/protected/events/[eventId]/actions.ts` 빈 Server Actions 파일 생성
  - 공통 네비게이션 및 보호 라우트 레이아웃 연동 확인

- **Task 002: 타입 정의 및 데이터 모델 설계**
  - `types/database.types.ts`에 신규 엔티티 타입 추가
    - `Event`, `EventInsert`, `EventUpdate` (status: draft/open/closed/cancelled)
    - `EventParticipant` (status: pending/approved/rejected/waitlisted/cancelled)
    - `EventAnnouncement`, `Carpool`, `CarpoolRequest` (status: pending/accepted/rejected)
  - Server Action 폼 상태 타입 정의 (`EventFormState` 등)
  - 정산/카풀 비즈니스 로직용 파생 타입 정의 (예: `SettlementSummary`)
  - 5개 신규 테이블 DB 스키마 설계 (SQL 작성, 구현은 Phase 3)
  - RLS(Row Level Security) 정책 설계 문서화

### Phase 2: UI/UX 완성 (더미 데이터 활용)

- **Task 003: 공통 컴포넌트 및 더미 데이터 구축**
  - 모임 카드, 참여자 배지, 상태 뱃지 등 공통 컴포넌트 구현
  - 추가 shadcn/ui 컴포넌트 도입 (tabs, dialog, textarea, select, avatar 등)
  - 더미 데이터 생성 유틸리티 작성 (`lib/dummy/` — 모임/참여자/공지/카풀)
  - 디자인 시스템 및 스타일 가이드 적용 (`cn()` 유틸리티 기반)

- **Task 004: 모임 목록·생성·대시보드 UI 구현**
  - 내 모임 대시보드 UI (주최/참여 모임 분리 표시)
  - 모임 목록 페이지 UI (더미 데이터 기반 카드 그리드)
  - 모임 생성 페이지 폼 UI (제목/설명/장소/일시/정원/비용)
  - 반응형 디자인 및 모바일 최적화

- **Task 005: 모임 상세 탭 UI 구현**
  - [정보] 탭: 모임 정보 표시, 참여 신청/취소 버튼, 참여자 목록 UI
  - [공지] 탭: 공지 목록 UI (핀 고정 우선 정렬), 작성/삭제 액션 UI
  - [정산] 탭: 1인당 금액 표시, 참여자별 완료 체크 UI
  - [카풀] 탭: 카풀 목록, 등록 폼, 신청 버튼 UI
  - 주최자/참여자 권한별 UI 분기 처리
  - 모임 수정 페이지 및 공지 작성 페이지 UI 완성

### Phase 3: 핵심 기능 구현

- **Task 006: 데이터베이스 구축 및 모임 CRUD Server Actions** - 우선순위
  - Supabase에 5개 신규 테이블 마이그레이션 적용
  - RLS 정책 적용 및 검증
  - `generate_typescript_types`로 DB 타입 동기화
  - 모임 CRUD Server Actions 구현 (생성/수정/삭제/조회) — F001~F004
  - 더미 데이터를 실제 Supabase 쿼리로 교체
  - `revalidatePath()` 기반 캐시 무효화 적용
  - Playwright MCP를 활용한 모임 CRUD E2E 테스트 (생성→목록→상세→수정→삭제)

- **Task 007: 공지 및 참여자 관리 기능 구현**
  - 공지 작성/삭제/핀 고정 Server Actions — F005~F006
  - 참여 신청/취소 Server Actions (정원 초과 시 waitlisted 처리) — F007
  - 주최자 참여자 승인/거절 Server Actions — F008
  - 권한 검증 로직 (주최자만 승인/거절/공지 관리 가능)
  - Playwright MCP로 공지 작성/핀 고정 및 참여 신청→승인 플로우 E2E 테스트

- **Task 008: 정산 및 카풀 기능 구현**
  - 정산 관리 Server Actions — F009
    - 1인당 금액 = `Math.ceil(cost / 승인된 참여자 수)` 계산 로직
    - 참여자별 `payment_done` 토글 처리
  - 카풀 등록/신청 Server Actions — F010
    - 1인 1카풀 등록 제약
    - 선착순 자동 수락 및 정원 초과 시 거절 로직
  - Playwright MCP로 정산 계산 및 카풀 선착순 자동 수락 로직 E2E 테스트

- **Task 008-1: 핵심 기능 통합 테스트**
  - Playwright MCP를 사용한 전체 사용자 플로우 테스트
    - 주최자: 모임 생성 → 공지 작성 → 참여자 승인 → 정산 관리
    - 참여자: 모임 탐색 → 참여 신청 → 카풀 신청 → 정산 완료 체크
  - 비즈니스 로직 경계값 검증 (정원 초과, 정산 분배 반올림, 카풀 선착순)
  - 에러 핸들링 및 엣지 케이스 테스트 (권한 없는 접근, 중복 신청, 동시성)

### Phase 4: 고급 기능 및 최적화

- **Task 009: 사용자 경험 향상 및 부가 기능**
  - 대기자(waitlisted) 자동 승급 처리 (승인 참여자 취소 시)
  - 모임 상태 전환 자동화 (정원 마감, 일시 경과 시 closed)
  - 검색/필터링 (모임 목록 상태별·키워드 필터)
  - 토스트 알림 및 로딩/에러 상태 UX 개선

- **Task 010: 성능 최적화 및 배포**
  - 쿼리 최적화 및 N+1 방지 (참여자 수 집계, 조인 최적화)
  - Supabase advisor 점검 (보안/성능 권고 반영)
  - 접근성(a11y) 점검 및 SEO 메타데이터 적용
  - CI/CD 파이프라인 점검 (lint, type-check, format, E2E 테스트)
  - 모니터링 및 로깅 구성

## 기존 완료 기능

다음 기능은 이미 구현 완료되었습니다.

- **F011: 기본 인증** ✅ - 완료
  - ✅ 이메일/비밀번호 로그인·회원가입
  - ✅ Google OAuth 소셜 로그인
  - ✅ 비밀번호 초기화 및 업데이트
  - ✅ 미들웨어 기반 세션 관리 및 보호 라우트 가드

- **F012: 프로필 관리** ✅ - 완료
  - ✅ 프로필 조회/수정 Server Actions
  - ✅ 프로필 폼 (`useActionState` 패턴)
  - ✅ `Profile`, `ProfileUpdate`, `ProfileFormState` 타입 정의

## 기능 매핑 표

| ID   | 기능명                 | 담당 Task | Phase   |
| ---- | ---------------------- | --------- | ------- |
| F001 | 모임 생성              | Task 006  | Phase 3 |
| F002 | 모임 목록 조회         | Task 006  | Phase 3 |
| F003 | 모임 상세 조회         | Task 006  | Phase 3 |
| F004 | 모임 수정/삭제         | Task 006  | Phase 3 |
| F005 | 공지 작성/삭제/핀 고정 | Task 007  | Phase 3 |
| F006 | 공지 목록 조회         | Task 007  | Phase 3 |
| F007 | 참여 신청/취소         | Task 007  | Phase 3 |
| F008 | 참여자 승인/거절       | Task 007  | Phase 3 |
| F009 | 정산 관리 (N/1 균등)   | Task 008  | Phase 3 |
| F010 | 카풀 등록/신청         | Task 008  | Phase 3 |
| F011 | 기본 인증              | 완료 ✅   | -       |
| F012 | 프로필 관리            | 완료 ✅   | -       |
