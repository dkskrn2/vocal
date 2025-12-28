# YouTube API 설정 가이드

## 1. Google Cloud Console 설정

### 프로젝트 생성
1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 새 프로젝트 생성 또는 기존 프로젝트 선택
3. 프로젝트 이름: `vocal-app` (또는 원하는 이름)

### YouTube Data API v3 활성화
1. 좌측 메뉴에서 "API 및 서비스" > "라이브러리" 선택
2. "YouTube Data API v3" 검색
3. "사용 설정" 클릭

### API 키 생성
1. "API 및 서비스" > "사용자 인증 정보" 선택
2. "사용자 인증 정보 만들기" > "API 키" 선택
3. API 키 복사 (예: `AIzaSyXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxX`)

### API 키 제한 설정 (선택사항, 보안 강화)
1. 생성된 API 키 옆의 편집 아이콘 클릭
2. "애플리케이션 제한사항" 설정:
   - HTTP 리퍼러: 배포된 도메인 추가 (예: `*.vercel.app/*`)
3. "API 제한사항" 설정:
   - "키 제한" 선택
   - "YouTube Data API v3"만 선택
4. 저장

## 2. 환경 변수 설정

### 로컬 개발 (.env.local)
```bash
YOUTUBE_API_KEY=your_api_key_here
```

### Vercel 배포
1. Vercel 프로젝트 설정 접속
2. "Settings" > "Environment Variables" 선택
3. 새 환경 변수 추가:
   - Name: `YOUTUBE_API_KEY`
   - Value: 복사한 API 키
   - Environments: Production, Preview, Development 모두 체크
4. 저장 후 재배포

## 3. API 사용량 확인

### 할당량
- YouTube Data API v3 무료 할당량: **10,000 units/day**
- 주요 작업별 비용:
  - search.list: 100 units
  - videos.list: 1 unit
  
### 일일 사용량 예상
- 트렌딩 노래 검색 1회: ~101 units (search 100 + videos 1)
- 커버 영상 검색 1회: ~101 units
- 일일 약 **100회** 검색 가능 (무료 할당량 내)

### 사용량 모니터링
1. Google Cloud Console > "API 및 서비스" > "대시보드"
2. YouTube Data API v3 클릭
3. "할당량" 탭에서 일일 사용량 확인

## 4. 할당량 초과 시 대책

### 캐싱 전략
데이터를 캐싱하여 API 호출 횟수를 줄입니다:
- Redis/Vercel KV 사용
- 트렌딩 데이터: 1시간 캐싱
- 커버 영상 데이터: 30분 캐싱

### 할당량 증가 신청
1. Google Cloud Console에서 할당량 증가 요청
2. 또는 유료 플랜으로 업그레이드 고려

## 5. API 테스트

### API 라우트 테스트
```bash
# 트렌딩 노래 검색 (주간)
curl "http://localhost:3000/api/youtube/trending?period=weekly&category=K-POP"

# 커버 영상 검색
curl "http://localhost:3000/api/youtube/covers?songTitle=어떻게 이별까지 사랑하겠어&artist=AKMU"
```

### Server Action 테스트
프론트엔드에서 Server Action을 직접 호출하여 테스트할 수 있습니다.

## 6. 주의사항

- API 키는 **절대 클라이언트 코드에 노출하지 마세요**
- 모든 YouTube API 호출은 **서버 사이드**에서만 수행
- 환경 변수는 `NEXT_PUBLIC_` 접두사를 사용하지 마세요
- API 키가 노출된 경우 즉시 재생성하세요

## 7. 다음 단계

1. Vercel에 `YOUTUBE_API_KEY` 환경 변수 추가
2. 프론트엔드에서 Server Action 연동
3. 캐싱 전략 구현 (Vercel KV 또는 Redis)
4. 에러 핸들링 및 로딩 상태 추가
