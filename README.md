# 불혹청년 - 프리미엄 영상 촬영 소스 다운로드 서비스

## 기술 스택
- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Backend**: Supabase (Auth, Database)
- **Storage**: Google Drive API
- **Payment**: PortOne (구 아임포트)

## 시작하기

```bash
# 의존성 설치
npm install

# 환경변수 설정
cp .env.example .env.local

# 개발 서버 실행
npm run dev
```

## 핵심 기능
- **타임락 해금 시스템**: 구독 시작일 기준 N일마다 콘텐츠 순차 해금
- **Google Drive 연동**: 영상 파일을 Google Drive에서 직접 다운로드
- **구독 결제**: PortOne을 통한 월 정기 결제 (25만원/월)
- **관리자 대시보드**: 콘텐츠/유저/설정 관리

## 프로젝트 구조
```
src/
├── app/          # Next.js App Router 페이지
├── components/   # React 컴포넌트
├── lib/          # 유틸리티 (Supabase, GDrive, Auth, TimeLock, Payment)
└── types/        # TypeScript 타입 정의
supabase/
└── migrations/   # DB 마이그레이션 SQL
```

## 환경변수
- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase 프로젝트
- `SUPABASE_SERVICE_ROLE_KEY`: 서버사이드 Supabase 접근
- `GOOGLE_*`: Google Drive API 인증
- `PORTONE_*`: 결제 연동
