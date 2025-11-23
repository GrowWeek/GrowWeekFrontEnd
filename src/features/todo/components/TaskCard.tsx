import React from 'react';
import { Card } from "@/components/ui/Card";
import { Lock, History, MoreHorizontal } from "lucide-react";
import { cn } from '@/lib/utils';
import { Task, TaskStatus } from '../types';

interface TaskCardProps {
  task: Task;
  onClick?: (task: Task) => void;
  onStatusChange?: (taskId: number, newStatus: TaskStatus) => void;
  isReadOnly?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export function TaskCard({ task, onClick, onStatusChange, isReadOnly, className, style }: TaskCardProps) {
  
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    e.stopPropagation(); // Prevent card click
    if (onStatusChange) {
      onStatusChange(task.id, e.target.value as TaskStatus);
    }
  };

  return (
    <Card 
      onClick={() => onClick && onClick(task)}
      style={style}
      className={cn(
        "p-4 cursor-pointer hover:shadow-md transition-all bg-white dark:bg-gray-800 group relative border-l-4",
        task.isSensitive ? "border-l-orange-400" : "border-l-transparent",
        isReadOnly && "opacity-80 hover:shadow-sm cursor-default",
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1 flex-1 min-w-0">
            <p className="text-sm font-medium leading-normal line-clamp-2 break-words">{task.title}</p>
            
            {/* Mobile/Quick Status Change UI */}
            {!isReadOnly && (
                <div className="relative inline-block md:hidden" onClick={(e) => e.stopPropagation()}>
                    <select
                        value={task.status}
                        onChange={handleStatusChange}
                        className="appearance-none bg-gray-100 dark:bg-gray-700 text-xs rounded px-2 py-1 pr-6 border-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    >
                        <option value="TODO">진행 전</option>
                        <option value="IN_PROGRESS">진행 중</option>
                        <option value="DONE">완료</option>
                    </select>
                    <MoreHorizontal className="w-3 h-3 absolute right-1.5 top-1.5 text-gray-500 pointer-events-none" />
                </div>
            )}
        </div>

        <div className="flex flex-col gap-1 shrink-0 items-end">
            {task.isSensitive && (
                <Lock className="w-3 h-3 text-orange-400" />
            )}
             {task.isCarriedOver && (
                <History className="w-3 h-3 text-blue-400" />
            )}
        </div>
      </div>
      
      {/* Hover effect hint (Desktop only) */}
      <div className="hidden md:block absolute inset-0 rounded-xl ring-2 ring-blue-500 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity" />
    </Card>
  );
}
