# Task 002: 타입 정의 및 데이터 모델 설계

## 개요

Phase 3(Task 008~011)에서 Supabase `apply_migration`으로 적용할 DB 스키마와 RLS 정책을 문서화합니다.
이 단계에서는 TypeScript 타입 정의만 완성하며, SQL 실행은 Phase 3에서 수행합니다.

---

## DB 스키마 SQL

### 1. profiles 테이블 (role 컬럼 추가)

```sql
-- profiles 테이블은 Supabase Auth의 users 테이블을 참조하는 공개 프로필 테이블
-- 기존 테이블에 role 컬럼 추가
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'member'
    CHECK (role IN ('admin', 'host', 'member'));
```

### 2. events 테이블

```sql
CREATE TABLE IF NOT EXISTS public.events (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  description  TEXT,
  location     TEXT,
  event_date   TIMESTAMPTZ,
  max_capacity INTEGER CHECK (max_capacity > 0),
  cost         INTEGER NOT NULL DEFAULT 0 CHECK (cost >= 0),
  status       TEXT NOT NULL DEFAULT 'open'
                 CHECK (status IN ('draft', 'open', 'closed', 'cancelled')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- updated_at 자동 갱신 트리거
CREATE OR REPLACE TRIGGER set_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION moddatetime(updated_at);
```

### 3. event_participants 테이블

```sql
CREATE TABLE IF NOT EXISTS public.event_participants (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id     UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status       TEXT NOT NULL DEFAULT 'pending'
                 CHECK (status IN ('pending', 'approved', 'rejected', 'waitlisted', 'cancelled')),
  payment_done BOOLEAN NOT NULL DEFAULT false,
  joined_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (event_id, user_id)
);
```

### 4. event_announcements 테이블

```sql
CREATE TABLE IF NOT EXISTS public.event_announcements (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id   UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  author_id  UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title      TEXT NOT NULL,
  content    TEXT NOT NULL,
  is_pinned  BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE OR REPLACE TRIGGER set_announcements_updated_at
  BEFORE UPDATE ON public.event_announcements
  FOR EACH ROW EXECUTE FUNCTION moddatetime(updated_at);
```

### 5. carpools 테이블

```sql
CREATE TABLE IF NOT EXISTS public.carpools (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id   UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  driver_id  UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  departure  TEXT NOT NULL,
  capacity   INTEGER NOT NULL CHECK (capacity > 0),
  note       TEXT
);
```

### 6. carpool_requests 테이블

```sql
CREATE TABLE IF NOT EXISTS public.carpool_requests (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  carpool_id   UUID NOT NULL REFERENCES public.carpools(id) ON DELETE CASCADE,
  passenger_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status       TEXT NOT NULL DEFAULT 'pending'
                 CHECK (status IN ('pending', 'accepted', 'rejected')),
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (carpool_id, passenger_id)
);
```

---

## RLS 정책 설계

### events 테이블

| 정책          | 역할               | 조건                                 |
| ------------- | ------------------ | ------------------------------------ |
| SELECT (조회) | 인증된 모든 사용자 | `auth.uid() IS NOT NULL`             |
| INSERT (생성) | 인증된 사용자      | `host_id = auth.uid()`               |
| UPDATE (수정) | 호스트 또는 Admin  | `host_id = auth.uid()` OR Admin role |
| DELETE (삭제) | 호스트 또는 Admin  | `host_id = auth.uid()` OR Admin role |

### event_participants 테이블

| 정책   | 역할                                               | 조건                                                   |
| ------ | -------------------------------------------------- | ------------------------------------------------------ |
| SELECT | 이벤트 호스트 또는 본인                            | `event.host_id = auth.uid()` OR `user_id = auth.uid()` |
| INSERT | 인증된 사용자                                      | `user_id = auth.uid()`                                 |
| UPDATE | 이벤트 호스트(status 변경) 또는 본인(payment_done) | 조건 분리                                              |
| DELETE | 본인(취소) 또는 호스트 또는 Admin                  | -                                                      |

### event_announcements 테이블

| 정책   | 역할                      | 조건                                                      |
| ------ | ------------------------- | --------------------------------------------------------- |
| SELECT | 이벤트 참여자 또는 호스트 | 참여자 조인 검증                                          |
| INSERT | 이벤트 호스트만           | `author_id = auth.uid()` AND `event.host_id = auth.uid()` |
| UPDATE | 작성자(호스트)만          | `author_id = auth.uid()`                                  |
| DELETE | 작성자 또는 Admin         | -                                                         |

### carpools / carpool_requests 테이블

| 정책             | 역할                     | 조건                             |
| ---------------- | ------------------------ | -------------------------------- |
| SELECT           | 이벤트 참여자            | 이벤트 참여 여부 검증            |
| INSERT (carpool) | 이벤트 참여자(드라이버)  | `driver_id = auth.uid()`         |
| INSERT (request) | 이벤트 참여자(승객)      | `passenger_id = auth.uid()`      |
| UPDATE (request) | 카풀 드라이버(수락/거절) | `carpool.driver_id = auth.uid()` |

---

## 완료 기준

- [x] `types/database.types.ts`에 모든 엔티티 타입 추가
- [x] EventStatus: `draft | open | closed | cancelled`
- [x] ParticipantStatus: `pending | approved | rejected | waitlisted | cancelled`
- [x] CarpoolRequestStatus: `pending | accepted | rejected`
- [x] `EventFormState`에 `eventId?` 포함
- [x] `SettlementSummary`에 `per_person` 필드 존재
- [x] DB 스키마 SQL 문서화
- [x] RLS 정책 설계 문서화
