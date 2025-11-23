# GrowWeek (FrontEnd)

**AI 기반 개인 회고 도우미, GrowWeek의 프론트엔드 레포지토리입니다.**
할일 관리부터 주간 회고까지, AI와 함께 성장하는 개발자 및 직장인을 위한 웹 애플리케이션입니다.

## 🚀 기술 스택 (Tech Stack)

이 프로젝트는 최신 웹 기술을 기반으로 구축되었습니다.

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **State Management**:
  - **Server State**: [React Query (TanStack Query)](https://tanstack.com/query/latest)
  - **Client State**: [Zustand](https://zustand-demo.pmnd.rs/) (예정) / React Context
- **HTTP Client**: [Axios](https://axios-http.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Utility**: [clsx](https://github.com/lukeed/clsx), [tailwind-merge](https://github.com/dcastil/tailwind-merge)

## 📂 폴더 구조 (Folder Structure)

유지보수성과 확장성을 고려하여 **기능(Feature) 단위**로 폴더를 구조화했습니다.

```
src/
├── app/                    # Next.js App Router (페이지 및 라우팅)
│   ├── providers.tsx       # Global Providers (React Query 등 설정)
│   ├── layout.tsx          # Root Layout (헤더 포함)
│   ├── page.tsx            # 메인 페이지 (할일 관리)
│   └── retrospect/         # 회고 페이지 라우트
├── components/             # 공통 컴포넌트
│   ├── ui/                 # 원자(Atom) 단위 UI 컴포넌트 (버튼, 인풋 등)
│   └── layout/             # 레이아웃 컴포넌트 (헤더, 사이드바 등)
├── features/               # 비즈니스 로직 및 기능 모듈
│   ├── todo/               # 할일 관리(Todo) 기능
│   │   ├── components/     # 해당 기능 전용 컴포넌트
│   │   ├── hooks/          # 커스텀 훅
│   │   ├── api/            # API 호출 함수
│   │   └── types/          # 타입 정의
│   └── retrospective/      # 회고(Retrospective) 기능
│       ├── components/
│       ├── hooks/
│       ├── api/
│       └── types/
└── lib/                    # 유틸리티 및 설정 (axios instance, cn helper 등)
```

## 🏃‍♂️ 실행 방법 (Getting Started)

프로젝트를 로컬 환경에서 실행하려면 다음 단계를 따르세요.

### 1. 의존성 설치

```bash
npm install
```

### 2. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)으로 접속하여 확인할 수 있습니다.

### 3. 빌드 (Production)

```bash
npm run build
npm start
```

## 📝 주요 기능 (MVP)

1.  **할일 관리**: 일일 할일 추가 및 상태 관리
2.  **주간 회고**: 주간 업무 데이터를 기반으로 회고 진행
3.  **AI 질문 생성**: (백엔드 연동 예정) 업무 내용에 따른 맞춤형 회고 질문 제공

---
© 2024 GrowWeek. All rights reserved.
