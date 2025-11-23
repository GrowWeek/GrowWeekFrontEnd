# 할일 관리(Todo) 기능 구현 계획서 (Front-End)

본 문서는 '할일 관리 기능 상세 규칙서'를 기반으로 프론트엔드 구현을 위한 구체적인 계획을 정의합니다. 현재 백엔드 API가 준비되지 않은 상황을 가정하여, **클라이언트 상태 관리(Zustand) + Mock API** 방식으로 우선 구현한 뒤, 추후 실제 API와 연동하기 쉬운 구조로 설계합니다.

## 1. 데이터 모델링 (Type Definition)

`src/features/todo/types/index.ts`에 정의합니다.

### 1.1 Task & Week Interface

```typescript
// Task Status Enum
export type TaskStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';

// Task Interface
export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  isSensitive: boolean;      // 민감정보 여부
  weekId: string;            // 소속 주차 (YYYY-WW 형식 권장)
  originalTaskId?: string;   // 이월된 원본 ID
  isCarriedOver: boolean;    // 이월 여부
  createdAt: string;         // ISO Date String
  updatedAt: string;         // ISO Date String
  lockedAt?: string;         // 회고 완료 시 잠금 시간
}

// Week Interface
export interface Week {
  id: string;                // 식별자 (예: "2024-47")
  startDate: string;         // 주 시작일 (월)
  endDate: string;           // 주 종료일 (일)
  isReviewCompleted: boolean;
  reviewCompletedAt?: string;
  tasks?: Task[];            // Optional: 포함된 할일들
}
```

## 2. 상태 관리 아키텍처 (Store)

**Zustand**를 사용하여 전역 상태를 관리합니다.
`src/features/todo/hooks/useTodoStore.ts`

### 2.1 Store Structure
```typescript
interface TodoState {
  // Data
  tasks: Task[];
  currentWeekId: string;
  weeks: Record<string, Week>; // weekId를 키로 하는 Week 정보

  // Actions
  createTask: (task: CreateTaskInput) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  moveTask: (id: string, newStatus: TaskStatus) => void;
  
  // Week Actions
  initializeCurrentWeek: () => void; // 앱 실행 시 현재 주차 확인 및 생성
  completeReview: (weekId: string) => void; // 회고 완료 처리 (잠금)
  carryOverTasks: (prevWeekId: string, newWeekId: string) => void; // 이월 처리
}
```

## 3. 주요 컴포넌트 구조

`src/features/todo/components/`

1.  **KanbanBoard** (Main)
    *   전체 칸반 보드 레이아웃 관리
    *   `useTodoStore`를 구독하여 `tasks` 목록을 가져오고 `status`별로 필터링하여 `KanbanColumn`에 전달

2.  **KanbanColumn**
    *   `NOT_STARTED`, `IN_PROGRESS`, `COMPLETED` 각 컬럼 렌더링
    *   Drag & Drop 영역 (추후 구현)
    *   `TaskCard` 리스트 렌더링

3.  **TaskCard**
    *   개별 할일 아이템 UI
    *   **상태 표시**: 민감정보(🔒), 이월(📌) 아이콘 표시
    *   클릭 시 수정 모달 오픈

4.  **TaskModal** (Dialog)
    *   생성/수정 겸용 모달
    *   입력 필드: 제목, 설명, 상태, 민감정보 토글
    *   **Locking 처리**: `lockedAt`이 있거나 주차가 완료된 경우 `read-only` 모드로 렌더링

## 4. 단계별 구현 계획 (Roadmap)

### Phase 1: 기본 CRUD 및 데이터 모델 적용 (Current)
*   [x] `types` 정의 (Task, Week)
*   [x] `Zustand` Store 생성 및 Mock Data 초기화 로직 구현
*   [x] `KanbanBoard` 리팩토링: 실제 Store 데이터 연동
*   [x] `TaskModal` 구현: 할일 추가 및 수정 (제목, 민감여부 등)

### Phase 2: 주차(Week) 관리 및 이월(Carry-over) 로직
*   [ ] `date-fns` 활용하여 현재 주차(ISO Week) 계산 유틸리티 구현
*   [ ] 앱 시작 시 주차 확인 로직 (`initializeCurrentWeek`)
*   [ ] 이월 로직 구현 (`carryOverTasks`): 이전 주 미완료 항목 복사 및 링크

### Phase 3: 회고 연동 및 잠금(Locking)
*   [x] 회고 완료 상태 시뮬레이션 버튼 추가 (`RetrospectiveDashboard`)
*   [x] 회고 완료 시 `isReviewCompleted = true` 처리 (`useTodoStore`)
*   [x] 완료된 주의 할일 수정 시도 시 "수정 불가" 알림 및 비활성화 처리 (`TaskModal`, `KanbanBoard`)

### Phase 4: UI/UX 고도화
*   [x] Drag & Drop (dnd-kit 등 라이브러리 검토)
*   [ ] 민감 정보 시각적 차별화 (배경색/아이콘)
*   [ ] 반응형 디테일 수정

## 5. Mocking Strategy
실제 백엔드가 없으므로, 브라우저의 `localStorage`를 사용하여 데이터를 영구 저장(Persistence)합니다. `zustand/middleware`의 `persist`를 활용하면 쉽게 구현 가능합니다.

