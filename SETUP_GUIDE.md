# TeaLog Server - Setup Guide

## 서버 기본 정보

| 항목 | 값 |
|------|-----|
| Strapi 버전 | 5.36.0 |
| 데이터베이스 | SQLite (로컬: `.tmp/data.db`) |
| 기본 포트 | 1337 |
| Admin Panel | http://localhost:1337/admin |
| API Base URL | http://localhost:1337/api |

---

## 계정 정보

### Admin (관리자 패널 전용)

| 항목 | 값 |
|------|-----|
| 이메일 | `admin@tealog.app` |
| 비밀번호 | `Admin1234pass` |
| 역할 | Super Admin |
| 용도 | `/admin` 패널에서 콘텐츠 관리, 권한 설정 |

### 테스트 유저 (API 사용자)

| 유저 | username | email | password |
|------|----------|-------|----------|
| 테스터1 | `tester1` | `tester1@tealog.app` | `Test1234pass` |
| 테스터2 | `tester2` | `tester2@tealog.app` | `Test1234pass` |

> 각 유저는 자신의 데이터만 조회/수정/삭제 가능 (owner 기반 격리)

---

## 서버 실행 방법

```bash
cd tealog-server

# 개발 모드 (파일 변경 시 자동 재시작)
npm run develop

# 프로덕션 모드
npm run build && npm run start
```

---

## API 엔드포인트

### 인증

```bash
# 로그인
POST /api/auth/local
Body: { "identifier": "tester1", "password": "Test1234pass" }
Response: { "jwt": "...", "user": {...} }

# 회원가입
POST /api/auth/local/register
Body: { "username": "...", "email": "...", "password": "..." }
Response: { "jwt": "...", "user": {...} }
```

### Teaware (다구)

```bash
# 목록 조회 (본인 것만)
GET /api/teawares
Header: Authorization: Bearer <JWT>

# 생성
POST /api/teawares
Header: Authorization: Bearer <JWT>
Body: {
  "data": {
    "name": "White Gaiwan",
    "type": "Gaiwan",           // Gaiwan | Yixing_Pot | Glass_Pot | Pitcher | Cup
    "material": "Porcelain",
    "volume_ml": 150,
    "is_favorite": true,
    "status": "Active"          // Active | Broken | Sold
  }
}

# 단건 조회 / 수정 / 삭제
GET    /api/teawares/:documentId
PUT    /api/teawares/:documentId
DELETE /api/teawares/:documentId
```

### TeaLeaf (찻잎)

```bash
GET  /api/tea-leaves
POST /api/tea-leaves
Body: {
  "data": {
    "name": "2015 Menghai 7542",
    "category": "Sheng_Puerh",  // Green | White | Oolong | Black | Sheng_Puerh | Shou_Puerh | Herbal
    "brand_origin": "Menghai Tea Factory",
    "year": 2015,
    "tasting_notes": "Rich and earthy",
    "in_stock": true
  }
}

GET    /api/tea-leaves/:documentId
PUT    /api/tea-leaves/:documentId
DELETE /api/tea-leaves/:documentId
```

### BrewLog (브루 기록)

```bash
GET  /api/brew-logs
POST /api/brew-logs
Body: {
  "data": {
    "brewed_at": "2026-02-13T10:00:00.000Z",
    "water_type": "Samdasoo",
    "water_temp": 95,
    "leaf_amount_g": 5.5,
    "steeping_details": "10s / 15s / 20s",
    "rating": 4,
    "review": "Smooth and sweet aftertaste"
  }
}

GET    /api/brew-logs/:documentId
PUT    /api/brew-logs/:documentId
DELETE /api/brew-logs/:documentId
```

---

## 데이터 격리 구조

모든 컬렉션(Teaware, TeaLeaf, BrewLog)에 `owner` 관계가 설정되어 있습니다.

- **생성 시**: 로그인한 유저가 자동으로 owner로 설정
- **조회 시**: 본인이 owner인 데이터만 반환
- **수정/삭제 시**: 본인 owner 데이터만 조작 가능
- **비로그인 접근**: 403 Forbidden

---

## DB 초기화 (필요 시)

데이터를 완전히 리셋하려면:

```bash
rm .tmp/data.db
npm run start
# → /admin 에서 Admin 계정 재등록 필요
# → 테스트 유저도 다시 회원가입 필요
```

---

## 블로그 서버와의 관계

| | 블로그 서버 | TeaLog 서버 |
|---|---|---|
| 위치 | `strapi-blog-server/` | `tealog-server/` |
| DB | 독립 (자체 `.tmp/data.db`) | 독립 (자체 `.tmp/data.db`) |
| 포트 | 1337 (동시 실행 시 변경 필요) | 1337 |
| 콘텐츠 | Post, Category, Tag | Teaware, TeaLeaf, BrewLog |
| Cloud 배포 | 별도 프로젝트 | 별도 프로젝트 |

> 두 서버를 동시에 로컬에서 실행하려면 한쪽의 `PORT` 환경변수를 변경하세요:
> `PORT=1338 npm run develop`
