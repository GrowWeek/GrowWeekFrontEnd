export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';

export interface Task {
  id: number;                // 백엔드 Long -> number
  userId: number;
  weekId: number;            // 백엔드 Long -> number
  title: string;
  description?: string;
  status: TaskStatus;
  isSensitive: boolean;
  originalTaskId?: number;   // 이월된 원본 ID
  isCarriedOver: boolean;
  isDeleted: boolean;
  isLocked: boolean;
  lockedAt?: string;         // ISO Date Time
  createdAt: string;         // ISO Date Time
  updatedAt: string;         // ISO Date Time
}

export interface Week {
  id: number;                // 백엔드 Week ID
  weekNumber: number;        // 몇 주차인지 (예: 47)
  startDate: string;         // YYYY-MM-DD
  endDate: string;           // YYYY-MM-DD
  isReviewCompleted: boolean;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  isSensitive: boolean;
  weekId?: number;           // 선택적
  createdDate: string;       // YYYY-MM-DD
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
}

export interface ChangeTaskStatusRequest {
  status: TaskStatus;
}

// API 공통 응답 타입
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
