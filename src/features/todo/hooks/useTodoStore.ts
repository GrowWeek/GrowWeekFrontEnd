import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Task, Week, CreateTaskInput, TaskStatus } from '../types';

// Simple ID generator
const generateId = () => Math.random().toString(36).substring(2, 9) + Date.now().toString(36);

// Helper to get current week ID (Mock implementation for now)
const getCurrentWeekId = () => "2024-W47"; 

interface TodoState {
  tasks: Task[];
  weeks: Record<string, Week>;
  currentWeekId: string;

  // Actions
  createTask: (input: CreateTaskInput) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  moveTask: (id: string, newStatus: TaskStatus) => void;
  
  // Week Actions
  initialize: () => void;
  completeReview: (weekId?: string) => void; 
  isWeekLocked: (weekId: string) => boolean;
  
  // Debug Actions
  resetState: () => void;
  setTasks: (tasks: Task[]) => void;
}

export const useTodoStore = create<TodoState>()(
  persist(
    (set, get) => ({
      tasks: [],
      weeks: {},
      currentWeekId: getCurrentWeekId(),

      initialize: () => {
        const currentWeekId = getCurrentWeekId();
        set((state) => {
          if (!state.weeks[currentWeekId]) {
            return {
              weeks: {
                ...state.weeks,
                [currentWeekId]: {
                  id: currentWeekId,
                  startDate: new Date().toISOString(),
                  endDate: new Date().toISOString(),
                  isReviewCompleted: false,
                }
              }
            };
          }
          return {};
        });
      },

      createTask: (input) => set((state) => {
        if (state.weeks[state.currentWeekId]?.isReviewCompleted) {
          console.warn("Cannot create task in a locked week.");
          return {};
        }

        const newTask: Task = {
          id: generateId(),
          title: input.title,
          description: input.description,
          status: input.status || 'NOT_STARTED',
          isSensitive: input.isSensitive || false,
          weekId: state.currentWeekId,
          isCarriedOver: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        return { tasks: [...state.tasks, newTask] };
      }),

      updateTask: (id, updates) => set((state) => {
        const task = state.tasks.find(t => t.id === id);
        if (!task) return {};

        if (state.weeks[task.weekId]?.isReviewCompleted) {
           console.warn("Cannot update task in a locked week.");
           return {};
        }

        return {
          tasks: state.tasks.map((t) =>
            t.id === id
              ? { ...t, ...updates, updatedAt: new Date().toISOString() }
              : t
          ),
        };
      }),

      deleteTask: (id) => set((state) => {
         const task = state.tasks.find(t => t.id === id);
         if (!task) return {};

         if (state.weeks[task.weekId]?.isReviewCompleted) {
            console.warn("Cannot delete task in a locked week.");
            return {};
         }

         return {
            tasks: state.tasks.filter((t) => t.id !== id),
         };
      }),

      moveTask: (id, newStatus) => set((state) => {
        const task = state.tasks.find(t => t.id === id);
        if (!task) return {};

        if (state.weeks[task.weekId]?.isReviewCompleted) {
            console.warn("Cannot move task in a locked week.");
            return {};
        }

        return {
          tasks: state.tasks.map((t) =>
            t.id === id
              ? { ...t, status: newStatus, updatedAt: new Date().toISOString() }
              : t
          ),
        };
      }),

      completeReview: (weekId) => set((state) => {
        const targetWeekId = weekId || state.currentWeekId;
        const week = state.weeks[targetWeekId];
        
        if (!week) return {};

        return {
          weeks: {
            ...state.weeks,
            [targetWeekId]: {
              ...week,
              isReviewCompleted: true,
              reviewCompletedAt: new Date().toISOString(),
            }
          },
          tasks: state.tasks.map(t => 
             t.weekId === targetWeekId ? { ...t, lockedAt: new Date().toISOString() } : t
          )
        };
      }),

      isWeekLocked: (weekId) => {
        const state = get();
        return !!state.weeks[weekId]?.isReviewCompleted;
      },

      resetState: () => {
        set({ tasks: [], weeks: {} });
        localStorage.removeItem('grow-week-storage');
        // Re-initialize week immediately after reset
        get().initialize();
      },
      
      setTasks: (tasks) => set({ tasks }),
    }),
    {
      name: 'grow-week-storage',
    }
  )
);
