# 프론트엔드 개발 작업 및 이슈 리포트 (GrowWeek)

본 문서는 GrowWeek 프로젝트의 프론트엔드 백엔드 API 연동 작업 내역과, 해당 과정에서 발생했던 주요 버그 및 해결 방법을 정리한 문서입니다. 향후 유지보수 및 추가 개발 시 참고 자료로 활용됩니다.

## 1. 작업 개요
*   **작업 기간**: 2025년 11월 23일
*   **주요 목표**: 기존 Zustand/LocalStorage 기반의 Mock 데이터를 실제 백엔드 API(Swagger) 연동으로 전환
*   **기술 스택**: Next.js 16, TypeScript, TanStack Query, Axios, Tailwind CSS v4

## 2. 주요 구현 내용

### 2.1 API 클라이언트 및 인증 (Auth)
*   **`src/lib/api-client.ts`**: Axios 인스턴스 구성.
    *   Access Token을 `localStorage`에서 조회하여 `Authorization: Bearer ...` 헤더 주입.
    *   401 Unauthorized 발생 시 Refresh Token API(`/api/v1/auth/refresh`) 호출 및 자동 재시도 로직(Interceptor) 구현.
    *   인증 실패 시 강제 로그아웃 및 `/login` 리다이렉트 처리.
*   **`src/features/auth/components/AuthProvider.tsx`**: 앱 전역에서 인증 상태를 감시.
    *   페이지 이동 시마다 토큰 유무를 체크하여, 비로그인 상태에서 보호된 라우트 접근 시 `/login`으로 리다이렉트.
*   **로그인/회원가입 페이지**: `/login`, `/register` 구현 및 API 연동.

### 2.2 할일 관리 (Todo)
*   **데이터 페칭**: Zustand Store 제거 및 **TanStack Query (`useTasks`, `useTaskMutations`)** 로 전환.
    *   `GET /api/v1/tasks/current-week`: 현재 주차 할일 목록 조회.
    *   `POST/PATCH/DELETE`: 할일 생성, 수정, 상태 변경, 삭제 구현.
    *   Optimistic Updates(낙관적 업데이트) 적용으로 드래그 앤 드롭 반응성 확보.
*   **민감 정보 처리**: `isSensitive` 필드에 대한 별도 API(`PATCH .../sensitive`) 연동 및 체크박스 UI 구현.
*   **상태 관리 불일치 해결**: 백엔드 Status(`NOT_STARTED`, `IN_PROGRESS`, `COMPLETED`)와 프론트엔드 Status(`TODO` 등) 간의 매핑 불일치 수정.

## 3. 주요 버그 및 트러블슈팅 (Lessons Learned)

### 3.1 401 무한 루프 및 리다이렉트 실패
*   **현상**: Access Token 만료 시 401 에러가 발생하는데, 갱신 요청이 반복되거나 로그인 페이지로 이동하지 않음.
*   **원인**:
    1.  `api-client` 인터셉터에서 Refresh Token 갱신 요청(`refresh`) 자체가 401일 때, 이를 또다시 갱신하려는 재귀적 호출이 발생.
    2.  초기 `AuthProvider` 부재로 인해, 클라이언트 상태(토큰 없음)와 URL(메인 페이지) 간의 불일치를 즉시 감지하지 못함.
*   **해결**:
    *   인터셉터에서 `url`이 `/auth/refresh`인 경우 재시도하지 않고 즉시 로그아웃 처리 (`api-client.ts`).
    *   `AuthProvider`를 도입하여 라우트 변경 시마다 토큰 검사 및 강제 리다이렉트 수행.

### 3.2 화면에 데이터가 보이지 않음 (API 응답 구조 불일치)
*   **현상**: `POST` 요청은 성공(201)했으나, `GET` 요청 후 화면에 리스트가 렌더링되지 않음.
*   **원인**:
    *   백엔드 응답은 `{ success: true, data: [...], ... }` 형태이나, Axios 인터셉터가 `response.data`를 반환하면서 훅에서는 `response` 자체가 객체(`{ success, data }`)가 됨.
    *   컴포넌트는 배열을 기대했으나 객체를 받아 렌더링 실패.
*   **해결**: `useTasks` 훅에서 `response.data` (실제 배열)를 명시적으로 추출하고, 배열 여부를 체크하는 방어 코드 추가.

### 3.3 상태값(Status) 불일치
*   **현상**: 특정 할일이 "Unknown Status" 경고와 함께 칸반 보드에 표시되지 않음.
*   **원인**: 프론트엔드는 `TODO`를 사용했으나, 백엔드 실제 데이터는 `NOT_STARTED`를 반환. Swagger 명세나 초기 가정과 실제 구현이 달랐음.
*   **해결**: `types/index.ts` 및 `KanbanBoard.tsx`의 상수 값을 백엔드 데이터(`NOT_STARTED`, `IN_PROGRESS`, `COMPLETED`)에 맞춰 전면 수정.

### 3.4 Checkbox Controlled/Uncontrolled 에러
*   **현상**: 수정 모달을 열었을 때 React Checkbox 관련 콘솔 에러 발생.
*   **원인**: `Checkbox` 컴포넌트에 `checked` prop이 초기 렌더링 시 `undefined`로 전달되어 Uncontrolled로 인식되었다가, 나중에 `boolean`이 되면서 Controlled로 변경됨.
*   **해결**: `TaskModal` 초기화 로직에서 `undefined` 대신 `false`를 기본값으로 설정하고, `Checkbox` 컴포넌트에 `onCheckedChange` 핸들러 지원 추가.

### 3.5 민감 정보 수정 미반영
*   **현상**: 민감 정보 체크박스를 변경해도 서버에 반영되지 않음.
*   **원인**: 백엔드의 `updateTask` (제목/설명 수정) API와 `toggleSensitive` (민감여부 수정) API가 분리되어 있었으나, 프론트엔드는 `updateTask`만 호출함.
*   **해결**: `useTaskMutations`에 `toggleSensitive` 추가 및 `KanbanBoard` 수정 핸들러에서 값이 변경된 경우 해당 API를 별도로 호출하도록 로직 분기.

## 4. 향후 과제 (Pending Tasks)
*   **주간(Week) 및 회고(Retrospect) API 연동**: 현재는 할일(Task) 위주로 구현되어 있으며, 주차 관리 및 회고 완료 처리는 백엔드 API가 준비되는 대로 연동 필요.
*   **에러 핸들링 고도화**: 현재 `alert` 위주의 에러 처리를 Toast UI 등으로 개선 필요.
*   **서버 사이드 렌더링(SSR) 고려**: 현재 인증 로직은 `client` 위주(`localStorage`)이나, 향후 Next.js Middleware 및 Cookie 기반 인증으로 고도화 고려 가능.

