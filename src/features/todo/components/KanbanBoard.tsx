'use client';

import { useState, useMemo, useEffect } from 'react';
import { 
  DndContext, 
  DragOverlay, 
  closestCorners, 
  KeyboardSensor, 
  MouseSensor,
  TouchSensor,
  useSensor, 
  useSensors, 
  DragStartEvent, 
  DragOverEvent, 
  DragEndEvent,
  defaultDropAnimationSideEffects,
  DropAnimation
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { createPortal } from 'react-dom';

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Plus, Lock, Loader2 } from "lucide-react";
import { useTasks } from '../hooks/useTasks';
import { useTaskMutations } from '../hooks/useTaskMutations';
import { TaskModal } from './TaskModal';
import { KanbanColumn } from './KanbanColumn';
import { TaskCard } from './TaskCard';
import { Task, TaskStatus, CreateTaskRequest } from '../types';
import { useQueryClient } from '@tanstack/react-query';

const statusMap: Record<string, { label: string; bg: string }> = {
  NOT_STARTED: { label: '진행 전', bg: 'bg-gray-100 dark:bg-gray-800' },
  IN_PROGRESS: { label: '진행 중', bg: 'bg-blue-50 dark:bg-blue-900/20' },
  COMPLETED: { label: '완료', bg: 'bg-green-50 dark:bg-green-900/20' }, 
};

const dropAnimation: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: '0.5',
      },
    },
  }),
};

export function KanbanBoard() {
  // Data Fetching
  const { data: tasks = [], isLoading, isError } = useTasks();
  const { createTask, updateTask, updateStatus, toggleSensitive } = useTaskMutations();
  const queryClient = useQueryClient();

  // Local State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  
  // Debugging
  // useEffect(() => {
  //   console.log('KanbanBoard Tasks:', tasks);
  // }, [tasks]);
  
  const isLocked = false;
  
  // Sensors
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 10, // 10px movement required to start drag
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Group Tasks by Status
  const tasksByStatus = useMemo(() => {
    const acc: Record<string, Task[]> = {
      NOT_STARTED: [],
      IN_PROGRESS: [],
      COMPLETED: [], 
    };
    
    if (!Array.isArray(tasks)) {
        return acc;
    }
    
    tasks.forEach((task) => {
        const status = task.status as string; 
        if (acc[status]) {
            acc[status].push(task);
        } else if (status === 'TODO') { 
            acc['NOT_STARTED'].push(task);
        } else if (status === 'DONE') {
            acc['COMPLETED'].push(task);
        } else {
            console.warn('Unknown task status:', status);
        }
    });
    return acc;
  }, [tasks]);

  // Handlers
  const handleCreateTask = (input: CreateTaskRequest) => {
    if (isLocked) return;
    createTask.mutate({
      title: input.title,
      description: input.description,
      isSensitive: input.isSensitive || false,
      createdDate: new Date().toISOString().split('T')[0],
    }, {
      onSuccess: () => {
        setIsModalOpen(false);
        queryClient.invalidateQueries({ queryKey: ['tasks'] });
      }
    });
  };

  const handleUpdateTask = (input: CreateTaskRequest) => {
    if (editingTask && !isLocked) {
      // 1. 민감 정보 토글 (값이 변경된 경우에만 호출)
      if (input.isSensitive !== editingTask.isSensitive) {
         toggleSensitive.mutate({
             id: editingTask.id,
             isSensitive: input.isSensitive
         });
      }
      
      // 2. 기본 정보 수정 (제목, 설명)
      updateTask.mutate({
        id: editingTask.id,
        data: {
          title: input.title,
          description: input.description,
        }
      }, {
        onSuccess: () => setIsModalOpen(false)
      });
      
      // Note: 상태(Status) 변경은 드래그앤드롭이나 카드 내 액션으로 처리됨.
      // 만약 모달에서도 상태 변경을 지원하려면 여기서 updateStatus 호출 필요.
      if (input.status && input.status !== editingTask.status) {
         updateStatus.mutate({
            id: editingTask.id,
            status: input.status
         });
      }
    }
  };

  const openCreateModal = () => {
    if (isLocked) {
      alert("회고가 완료된 주차에는 할일을 추가할 수 없습니다.");
      return;
    }
    setEditingTask(undefined);
    setIsModalOpen(true);
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  // DND Handlers
  const onDragStart = (event: DragStartEvent) => {
    if (isLocked) return;
    const { active } = event;
    const task = tasks.find((t) => t.id === active.id);
    if (task) setActiveTask(task);
  };

  const onDragOver = (event: DragOverEvent) => {
    if (isLocked) return;
    const { active, over } = event;
    if (!over) return;

    const activeId = Number(active.id);
    const overId = over.id;

    if (activeId === Number(overId)) return;

    const isActiveTask = active.data.current?.type === 'Task';
    const isOverTask = over.data.current?.type === 'Task';
    const isOverColumn = over.data.current?.type === 'Column';

    if (!isActiveTask) return;
  };

  const onDragEnd = (event: DragEndEvent) => {
    setActiveTask(null);
    if (isLocked) return;

    const { active, over } = event;
    if (!over) return;

    const activeId = Number(active.id);
    const overId = over.id;
    
    const activeTask = tasks.find(t => t.id === activeId);
    if (!activeTask) return;

    const isOverColumn = over.data.current?.type === 'Column';
    const isOverTask = over.data.current?.type === 'Task';

    let newStatus = activeTask.status as string;

    if (isOverColumn) {
        newStatus = over.data.current?.status;
    } else if (isOverTask) {
        const overTask = tasks.find(t => t.id === Number(overId));
        if (overTask) newStatus = overTask.status;
    }

    // Type safe check
    if (activeTask.status !== newStatus) {
      updateStatus.mutate({ id: activeId, status: newStatus as any });
    }
  };

  const handleTaskStatusChange = (taskId: number, newStatus: TaskStatus) => {
    if (isLocked) return;
    updateStatus.mutate({ id: taskId, status: newStatus });
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4">
        <p className="text-red-500">데이터를 불러오는데 실패했습니다.</p>
        <Button onClick={() => window.location.reload()}>새로고침</Button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-4 md:p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
            {isLocked && <Badge variant="secondary" className="gap-1"><Lock className="w-3 h-3"/> Read Only</Badge>}
        </h2>
        <Button onClick={openCreateModal} disabled={isLocked}>
          <Plus className="w-4 h-4 mr-2" />
          할일 추가
        </Button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragEnd={onDragEnd}
      >
        <div className="flex flex-col md:grid md:grid-cols-3 gap-6 flex-1 min-h-0 overflow-y-auto md:overflow-hidden pb-10 md:pb-0">
            {(Object.keys(statusMap)).map((status) => (
                <KanbanColumn
                    key={status}
                    status={status as TaskStatus}
                    title={statusMap[status].label}
                    bgClass={statusMap[status].bg}
                    tasks={tasksByStatus[status] || []}
                    onTaskClick={openEditModal}
                    onTaskStatusChange={handleTaskStatusChange}
                    isReadOnly={isLocked}
                />
            ))}
        </div>

        {createPortal(
            <DragOverlay dropAnimation={dropAnimation}>
                {activeTask && (
                    <TaskCard task={activeTask} />
                )}
            </DragOverlay>,
            document.body
        )}
      </DndContext>

      <TaskModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
        initialData={editingTask}
        mode={editingTask ? 'edit' : 'create'}
        isReadOnly={isLocked}
      />
    </div>
  );
}
