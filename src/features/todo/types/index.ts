// 백엔드 실제 반환값에 맞게 Status 타입 업데이트
export type TaskStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED'; 

export interface Task {
  id: number;
  userId: number;
  weekId: number;
  title: string;
  description?: string;
  status: TaskStatus;
  isSensitive: boolean;
  originalTaskId?: number;
  isCarriedOver: boolean;
  isDeleted: boolean;
  isLocked: boolean;
  lockedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Week {
  id: number;
  weekNumber: number;
  startDate: string;
  endDate: string;
  isReviewCompleted: boolean;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  isSensitive: boolean;
  weekId?: number;
  createdDate: string;
  status?: TaskStatus; // Optional for passing from modal to handler
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
}

export interface ChangeTaskStatusRequest {
  status: TaskStatus;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, object>;
  };
  timestamp: string;
}
