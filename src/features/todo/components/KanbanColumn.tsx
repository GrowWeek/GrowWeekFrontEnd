import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Badge } from "@/components/ui/Badge";
import { SortableTask } from './SortableTask';
import { Task, TaskStatus } from '../types';

interface KanbanColumnProps {
  status: TaskStatus;
  title: string;
  tasks: Task[];
  bgClass: string;
  onTaskClick: (task: Task) => void;
  isReadOnly: boolean;
}

export function KanbanColumn({ status, title, tasks, bgClass, onTaskClick, isReadOnly }: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({
    id: status,
    data: {
      type: 'Column',
      status,
    },
  });

  return (
    <div 
      ref={setNodeRef}
      className={`rounded-xl p-4 border border-gray-200 dark:border-gray-800 ${bgClass} flex flex-col h-full`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-700 dark:text-gray-300">
          {title}
        </h3>
        <Badge variant="secondary" className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
          {tasks.length}
        </Badge>
      </div>
      
      <div className="space-y-3 overflow-y-auto flex-1 pr-2 custom-scrollbar">
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map(task => (
            <SortableTask 
              key={task.id} 
              task={task} 
              onClick={onTaskClick}
              isReadOnly={isReadOnly}
            />
          ))}
        </SortableContext>
        {tasks.length === 0 && (
           <div className="h-full min-h-[100px] flex items-center justify-center text-gray-400 text-sm border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
              할일 없음
           </div>
        )}
      </div>
    </div>
  );
}

