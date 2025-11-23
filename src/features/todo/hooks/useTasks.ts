import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { ApiResponse, Task } from '../types';

export const useTasks = (weekId?: number) => {
  return useQuery({
    queryKey: ['tasks', weekId || 'current'],
    queryFn: async () => {
      const url = weekId 
        ? `/api/v1/tasks/week/${weekId}`
        : `/api/v1/tasks/current-week`;
      
      const response = await apiClient.get<ApiResponse<Task[]>>(url);
      
      // 디버깅: API 응답 구조 확인
      // console.log('useTasks response:', response);

      // 백엔드가 ApiResponse<Task[]> 형태로 준다면: { success: true, data: [...], ... }
      // Interceptor는 response.data를 반환하므로 `response` 변수가 바로 { success: ..., data: [...] } 객체임.
      // 우리가 필요한 건 배열인 `data` 필드.
      
      // 만약 백엔드가 리스트를 바로 주는 게 아니라면? (명세 상 ApiResponseListTaskResponse)
      // -> { success: true, data: [Task, Task...], error: null, ... }
      
      const responseData = response as unknown as ApiResponse<Task[]>;
      
      if (responseData.success && Array.isArray(responseData.data)) {
         return responseData.data;
      }
      
      // 만약 data가 없거나 success가 false라면 빈 배열 반환 혹은 에러 throw
      // console.warn('Unexpected task response format:', response);
      return [];
    },
  });
};
