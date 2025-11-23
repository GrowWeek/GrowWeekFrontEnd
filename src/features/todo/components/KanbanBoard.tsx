'use client';

import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Plus, Lock, History } from "lucide-react";
import { useTodoStore } from '../hooks/useTodoStore';
import { TaskModal } from './TaskModal';
import { Task, TaskStatus, CreateTaskInput } from '../types';
import { cn } from '@/lib/utils';

const statusMap = {
  NOT_STARTED: { label: '진행 전', bg: 'bg-gray-100 dark:bg-gray-800' },
  IN_PROGRESS: { label: '진행 중', bg: 'bg-blue-50 dark:bg-blue-900/20' },
  COMPLETED: { label: '완료', bg: 'bg-green-50 dark:bg-green-900/20' },
};

export function KanbanBoard() {
  const { tasks, currentWeekId, createTask, updateTask, initialize, isWeekLocked } = useTodoStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);

  // Initialize store (create current week if needed)
  useEffect(() => {
    initialize();
  }, [initialize]);

  const isLocked = isWeekLocked(currentWeekId);
  const getTodosByStatus = (status: TaskStatus) => tasks.filter(t => t.status === status);

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

  return (
    <div className="h-full flex flex-col p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
            {isLocked && <Badge variant="secondary" className="gap-1"><Lock className="w-3 h-3"/> Read Only</Badge>}
        </h2>
        <Button onClick={openCreateModal} disabled={isLocked}>
          <Plus className="w-4 h-4 mr-2" />
          할일 추가
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-6 flex-1 min-h-0">
        {(Object.keys(statusMap) as TaskStatus[]).map((status) => (
          <div 
            key={status} 
            className={`rounded-xl p-4 border border-gray-200 dark:border-gray-800 ${statusMap[status].bg} flex flex-col h-full`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-700 dark:text-gray-300">
                {statusMap[status].label}
              </h3>
              <Badge variant="secondary" className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                {getTodosByStatus(status).length}
              </Badge>
            </div>
            
            <div className="space-y-3 overflow-y-auto flex-1 pr-2 custom-scrollbar">
              {getTodosByStatus(status).map(todo => (
                <Card 
                  key={todo.id} 
                  onClick={() => openEditModal(todo)}
                  className={cn(
                    "p-4 cursor-pointer hover:shadow-md transition-all bg-white dark:bg-gray-800 group relative border-l-4",
                    todo.isSensitive ? "border-l-orange-400" : "border-l-transparent",
                    isLocked && "opacity-80 hover:shadow-sm cursor-default"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium leading-normal line-clamp-2">{todo.title}</p>
                    <div className="flex flex-col gap-1 shrink-0">
                        {todo.isSensitive && (
                            <Lock className="w-3 h-3 text-orange-400" />
                        )}
                         {todo.isCarriedOver && (
                            <History className="w-3 h-3 text-blue-400" />
                        )}
                    </div>
                  </div>
                  {/* Hover effect hint only if clickable/editable (or just always show hover for consistency but maybe different cursor) */}
                  <div className="absolute inset-0 rounded-xl ring-2 ring-blue-500 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity" />
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

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
