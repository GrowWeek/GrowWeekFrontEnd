# 백엔드 API 연동 및 리팩토링 계획서

본 문서는 백엔드 API 명세가 전달된 이후, 기존 프론트엔드(Mock/Local State)를 실제 서버 데이터 기반으로 전환하기 위한 단계별 계획입니다.

## 1. 사전 준비 (Environment & Setup)

### 1.1 API 클라이언트 설정
*   [ ] **Axios 인스턴스 구성**: `src/lib/api-client.ts` 생성
    *   `baseURL` 설정 (환경변수 `NEXT_PUBLIC_API_URL` 활용)
    *   요청/응답 인터셉터 설정 (토큰 주입, 에러 공통 처리)
*   [ ] **환경변수 설정**: `.env.local`에 API 주소 정의

### 1.2 타입 동기화
*   [ ] 전달받은 API 명세(Swagger/Docs)를 기반으로 `src/features/**/types` 내의 인터페이스(`Task`, `Week` 등)를 실제 DTO와 일치하도록 수정
*   [ ] Request/Response 타입 정의 추가

## 2. 상태 관리 마이그레이션 전략 (Zustand → React Query)

현재 로컬 스토리지와 Zustand로 관리되던 "서버 데이터 성격"의 상태들을 **TanStack Query (React Query)**로 이관합니다.

### 2.1 원칙
*   **Server State**: 할일 목록, 주차 정보 등 DB에 저장되는 데이터는 `useQuery`, `useMutation`으로 관리
*   **Client State**: 모달 열림/닫힘, 드래그 앤 드롭 중인 아이템 등 UI 상태는 `useState` 또는 `Zustand` 유지

## 3. 단계별 연동 계획 (Phase-by-Phase)

### Phase 1: 할일(Todo) 기본 CRUD 연동
**목표**: 로컬 스토리지의 할일 데이터를 서버 데이터로 대체

1.  **API 함수 작성** (`src/features/todo/api/`)
    *   `getTasks(weekId)`
    *   `createTask(data)`
    *   `updateTask(id, data)`
    *   `deleteTask(id)`
2.  **Query Hooks 작성** (`src/features/todo/hooks/`)
    *   `useTasks(weekId)`: `useQuery`로 조회
    *   `useTaskMutations()`: `useMutation`으로 생성/수정/삭제 및 `invalidateQueries` 처리
3.  **컴포넌트 연결**
    *   `KanbanBoard`에서 `useTodoStore` 대신 `useTasks` 훅 사용하도록 변경
    *   `TaskModal` 등에서 Mutation 훅 사용

### Phase 2: 주차(Week) 및 회고 관리 연동
**목표**: 클라이언트에서 계산하던 주차 로직을 서버 데이터로 대체

1.  **API 함수 작성**
    *   `getCurrentWeek()`
    *   `completeReview(weekId)`
2.  **로직 교체**
    *   `useTodoStore`의 `initialize` 로직 제거 → 서버의 `getCurrentWeek` 호출로 변경
    *   회고 완료 시 로컬 상태 변경 로직 → 서버 API 호출 (`completeReview`)

### Phase 3: 이월(Carry-over) 로직 검증
*   백엔드에서 이월 처리가 수행되므로, 프론트엔드의 **"Lazy 이월 로직" 제거**
*   서버에서 받아온 데이터에 이월된 할일이 정상적으로 포함되어 있는지 확인 및 UI 표시(`isCarriedOver`) 검증

## 4. 에러 처리 및 UX 개선
*   [ ] **Loading State**: 데이터 로딩 시 스켈레톤(Skeleton) UI 또는 스피너 적용
*   [ ] **Optimistic Updates**: 할일 상태 변경(드래그 앤 드롭) 시 UI를 즉시 업데이트하고 백그라운드에서 API 요청 (실패 시 롤백)
*   [ ] **Error Handling**: API 실패 시 토스트 메시지(Toast) 등으로 사용자 알림

## 5. 정리 (Cleanup)
*   [ ] `useTodoStore`에서 데이터 관리 로직(tasks, weeks 배열) 삭제 (UI 상태만 남김)
*   [ ] `localStorage` 관련 코드 및 `persist` 미들웨어 제거

