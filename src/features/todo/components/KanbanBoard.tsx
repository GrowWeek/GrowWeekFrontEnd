'use client';

import { useState, useEffect, useMemo } from 'react';
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
import { Plus, Lock } from "lucide-react";
import { useTodoStore } from '../hooks/useTodoStore';
import { TaskModal } from './TaskModal';
import { KanbanColumn } from './KanbanColumn';
import { TaskCard } from './TaskCard';
import { Task, TaskStatus, CreateTaskInput } from '../types';

const statusMap = {
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
  const { tasks, currentWeekId, createTask, updateTask, initialize, isWeekLocked, setTasks } = useTodoStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  useEffect(() => {
    initialize();
  }, [initialize]);

  const isLocked = isWeekLocked(currentWeekId);
  
  // Use different sensors for mouse and touch to improve mobile UX (scroll vs drag)
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

  const tasksByStatus = useMemo(() => {
    const acc: Record<TaskStatus, Task[]> = {
      NOT_STARTED: [],
      IN_PROGRESS: [],
      COMPLETED: [],
    };
    tasks.forEach((task) => {
        if (acc[task.status]) {
            acc[task.status].push(task);
        }
    });
    return acc;
  }, [tasks]);

  const handleCreateTask = (input: CreateTaskInput) => {
    if (isLocked) return;
    createTask(input);
  };

  const handleUpdateTask = (input: CreateTaskInput) => {
    if (editingTask && !isLocked) {
      updateTask(editingTask.id, input);
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

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveTask = active.data.current?.type === 'Task';
    const isOverTask = over.data.current?.type === 'Task';
    const isOverColumn = over.data.current?.type === 'Column';

    if (!isActiveTask) return;

    const activeTaskIndex = tasks.findIndex((t) => t.id === activeId);
    if (activeTaskIndex === -1) return;

    const activeTask = tasks[activeTaskIndex];

    if (isOverTask) {
       const overTaskIndex = tasks.findIndex((t) => t.id === overId);
       const overTask = tasks[overTaskIndex];
       
       if (activeTask.status !== overTask.status) {
         const newTasks = [...tasks];
         newTasks[activeTaskIndex] = { ...newTasks[activeTaskIndex], status: overTask.status };
         setTasks(newTasks);
       }
    }

    if (isOverColumn) {
       const overStatus = over.data.current?.status as TaskStatus;
       if (activeTask.status !== overStatus) {
          const newTasks = [...tasks];
          newTasks[activeTaskIndex] = { ...newTasks[activeTaskIndex], status: overStatus };
          setTasks(newTasks);
       }
    }
  };

  const onDragEnd = (event: DragEndEvent) => {
    setActiveTask(null);
    if (isLocked) return;

    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;
    
    const activeTask = tasks.find(t => t.id === activeId);
    if (!activeTask) return;

    const isOverColumn = over.data.current?.type === 'Column';
    const isOverTask = over.data.current?.type === 'Task';

    let newStatus = activeTask.status;

    if (isOverColumn) {
        newStatus = over.data.current?.status as TaskStatus;
    } else if (isOverTask) {
        const overTask = tasks.find(t => t.id === overId);
        if (overTask) newStatus = overTask.status;
    }

    if (activeTask.status !== newStatus) {
        updateTask(activeId, { status: newStatus });
    }
  };

  const handleTaskStatusChange = (taskId: string, newStatus: TaskStatus) => {
    if (isLocked) return;
    updateTask(taskId, { status: newStatus });
  };

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
        {/* Responsive Layout: Flex Col (Mobile, scrollable) vs Grid (Desktop, fixed) */}
        <div className="flex flex-col md:grid md:grid-cols-3 gap-6 flex-1 min-h-0 overflow-y-auto md:overflow-hidden pb-10 md:pb-0">
            {(Object.keys(statusMap) as TaskStatus[]).map((status) => (
                <KanbanColumn
                    key={status}
                    status={status}
                    title={statusMap[status].label}
                    bgClass={statusMap[status].bg}
                    tasks={tasksByStatus[status]}
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
