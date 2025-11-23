import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { 
  CreateTaskRequest, 
  UpdateTaskRequest, 
  ChangeTaskStatusRequest,
  Task,
  ApiResponse
} from '../types';

export const useTaskMutations = () => {
  const queryClient = useQueryClient();

  const createTask = useMutation({
    mutationFn: (data: CreateTaskRequest) => 
      apiClient.post<ApiResponse<Task>>('/api/v1/tasks', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const updateTask = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateTaskRequest }) =>
      apiClient.patch<ApiResponse<Task>>(`/api/v1/tasks/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const deleteTask = useMutation({
    mutationFn: (id: number) => apiClient.delete<ApiResponse<void>>(`/api/v1/tasks/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: number; status: ChangeTaskStatusRequest['status'] }) =>
      apiClient.patch<ApiResponse<Task>>(`/api/v1/tasks/${id}/status`, { status }),
    
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: ['tasks'] });
      
      const previousTasks = queryClient.getQueryData<Task[]>(['tasks', 'current']);

      if (previousTasks) {
        queryClient.setQueryData<Task[]>(['tasks', 'current'], (old) => {
           if (!old) return [];
           return old.map((task) => 
             task.id === id ? { ...task, status } : task
           );
        });
      }

      return { previousTasks };
    },
    onError: (err, newTodo, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(['tasks', 'current'], context.previousTasks);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  return { 
    createTask, 
    updateTask, 
    deleteTask, 
    updateStatus 
  };
};
