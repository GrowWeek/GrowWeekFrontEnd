export type TaskStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  isSensitive: boolean;      // 민감정보 여부
  weekId: string;            // 소속 주차 (YYYY-MM-WeekN 등)
  originalTaskId?: string;   // 이월된 원본 ID
  isCarriedOver: boolean;    // 이월 여부
  createdAt: string;         // ISO Date String
  updatedAt: string;         // ISO Date String
  lockedAt?: string;         // 회고 완료 시 잠금 시간
}

export interface Week {
  id: string;                // 식별자 (예: "2024-W47")
  startDate: string;         // 주 시작일 (월)
  endDate: string;           // 주 종료일 (일)
  isReviewCompleted: boolean;
  reviewCompletedAt?: string;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  status?: TaskStatus;
  isSensitive?: boolean;
}

