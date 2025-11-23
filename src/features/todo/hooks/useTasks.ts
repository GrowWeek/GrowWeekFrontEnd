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
      // Axios interceptor returns response.data, so we cast it to ApiResponse<Task[]>
      // However, the interceptor implementation: `response.data` (which is the whole JSON body)
      // The ApiResponse type represents that body structure.
      // So `response` here IS the body.
      return (response as unknown as ApiResponse<Task[]>).data; 
    },
  });
};

