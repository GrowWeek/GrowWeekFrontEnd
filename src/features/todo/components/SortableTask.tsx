import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { TaskCard } from './TaskCard';
import { Task, TaskStatus } from '../types';

interface SortableTaskProps {
  task: Task;
  onClick: (task: Task) => void;
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
  isReadOnly: boolean;
}

export function SortableTask({ task, onClick, onStatusChange, isReadOnly }: SortableTaskProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: 'Task',
      task,
    },
    disabled: isReadOnly,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="opacity-50"
      >
        <TaskCard 
          task={task} 
          className="bg-white dark:bg-gray-800 border-2 border-blue-500 h-[80px]" 
        />
      </div>
    );
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskCard 
        task={task} 
        onClick={onClick}
        onStatusChange={onStatusChange}
        isReadOnly={isReadOnly}
      />
    </div>
  );
}
