# 백엔드 API 연동 상세 명세서 (Technical Spec)

본 문서는 `docs/api-integration-plan.md`와 제공된 Swagger API 명세(`http://localhost:8080/v3/api-docs`)를 기반으로 작성된 구체적인 구현 계획입니다.

## 1. API 클라이언트 및 환경 설정

### 1.1 Axios 인스턴스 (`src/lib/api-client.ts`)
백엔드 API와의 통신을 위한 Axios 인스턴스를 구성합니다.

```typescript
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // 쿠키(Refresh Token) 전송 허용
});

// 요청 인터셉터: Access Token 주입
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken'); // 또는 쿠키/Zustand에서 가져옴
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 응답 인터셉터: 401 처리 (토큰 갱신) 및 에러 정규화
apiClient.interceptors.response.use(
  (response) => response.data, // data 레벨로 바로 접근
  async (error) => {
    // 401 시 토큰 갱신 로직 (api/v1/auth/refresh)
    // 실패 시 로그아웃 처리
    return Promise.reject(error);
  }
);
```

### 1.2 환경 변수 (`.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

## 2. 타입 정의 (Type Definitions)

`src/features/todo/types/index.ts` 및 공통 타입 파일에 Swagger 스키마를 기반으로 타입을 정의합니다.

### 2.1 Task 관련 타입
```typescript
// API 응답 래퍼
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: { code: string; message: string };
  timestamp: string;
}

// Task 모델 (DTO)
export interface TaskDto {
  id: number;
  userId: number;
  weekId: number;
  title: string;
  description?: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE'; // 백엔드 string 타입을 구체화
  isSensitive: boolean;
  isCarriedOver: boolean;
  isDeleted: boolean;
  isLocked: boolean;
  lockedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// 요청 DTO
export interface CreateTaskRequest {
  title: string;
  description?: string;
  isSensitive: boolean;
  weekId?: number; // 선택적 (없으면 현재 주차?)
  createdDate: string; // YYYY-MM-DD
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
}

export interface ChangeTaskStatusRequest {
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
}
```

## 3. React Query Hooks 구현 (`src/features/todo/hooks/`)

서버 상태 관리를 위해 React Query 훅을 구현합니다.

### 3.1 `useTasks.ts` (조회)
```typescript
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { ApiResponse, TaskDto } from '../types';

export const useTasks = (weekId?: number) => {
  return useQuery({
    queryKey: ['tasks', weekId || 'current'],
    queryFn: async () => {
      const url = weekId 
        ? `/api/v1/tasks/week/${weekId}`
        : `/api/v1/tasks/current-week`;
      const response = await apiClient.get<ApiResponse<TaskDto[]>>(url);
      return response.data; // 인터셉터에서 data를 꺼냈다고 가정 시
    },
  });
};
```

### 3.2 `useTaskMutation.ts` (변경)
```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export const useTaskMutations = () => {
  const queryClient = useQueryClient();

  const createTask = useMutation({
    mutationFn: (data: CreateTaskRequest) => apiClient.post('/api/v1/tasks', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      apiClient.patch(`/api/v1/tasks/${id}/status`, { status }),
    onMutate: async ({ id, status }) => {
      // Optimistic Update 구현 (드래그 앤 드롭 반응성 향상)
      await queryClient.cancelQueries({ queryKey: ['tasks'] });
      const previousTasks = queryClient.getQueryData(['tasks']);
      
      queryClient.setQueryData(['tasks'], (old: any) => {
        // 리스트 내 해당 아이템 상태 즉시 변경 로직
      });
      
      return { previousTasks };
    },
    onError: (err, newTodo, context) => {
      queryClient.setQueryData(['tasks'], context.previousTasks);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  return { createTask, updateStatus };
};
```

## 4. 컴포넌트 통합 계획

### 4.1 KanbanBoard (`src/features/todo/components/KanbanBoard.tsx`)
*   **기존**: `useTodoStore`에서 `tasks`를 가져와 렌더링.
*   **변경**: 
    *   `useTasks()` 훅을 호출하여 `data` (tasks) 수신.
    *   `DragEnd` 핸들러에서 `useTodoStore` 대신 `useTaskMutations().updateStatus.mutate(...)` 호출.
    *   로딩 상태 (`isLoading`) 처리.

### 4.2 Task 생성/수정
*   **TaskModal**: `onSubmit` 시 `createTask.mutateAsync()` 호출.

## 5. 미구현 API 및 대안 (Gap Analysis)

현재 Swagger 문서 상 **Week(주차) 및 Retrospective(회고) 관리 API**가 명시적으로 보이지 않습니다 (`/api/v1/weeks` 등).

*   **현재 주차 확인**: `GET /api/v1/tasks/current-week`를 호출하면 현재 주차의 할일 목록이 오는데, 이 응답 헤더나 데이터 내부에 `WeekInfo`가 포함되어 있는지 확인 필요. 없다면 백엔드에 요청 필요.
*   **회고 완료**: 회고 관련 API (`completeReview` 등)는 `Future Implementation`으로 되어 있어, 당분간은 프론트엔드 Mock으로 유지하거나, 할일 기능만 우선 연동합니다.

## 6. 우선순위 작업 순서

1.  `src/lib/api-client.ts` 생성 및 Axios 설정.
2.  `Task` 관련 인터페이스(Types) 정의 업데이트.
3.  `useTasks`, `useTaskMutations` 훅 작성.
4.  `KanbanBoard` 컴포넌트에서 Store 의존성 제거 및 Query 훅 연결.
5.  로그인/회원가입 페이지 연동 (Auth API가 존재하므로).

