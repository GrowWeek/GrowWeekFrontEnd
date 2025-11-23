import React from 'react';
import { Card } from "@/components/ui/Card";
import { Lock, History } from "lucide-react";
import { cn } from '@/lib/utils';
import { Task } from '../types';

interface TaskCardProps {
  task: Task;
  onClick?: (task: Task) => void;
  isReadOnly?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export function TaskCard({ task, onClick, isReadOnly, className, style }: TaskCardProps) {
  return (
    <Card 
      onClick={() => onClick && onClick(task)}
      style={style}
      className={cn(
        "p-4 cursor-grab active:cursor-grabbing hover:shadow-md transition-all bg-white dark:bg-gray-800 group relative border-l-4",
        task.isSensitive ? "border-l-orange-400" : "border-l-transparent",
        isReadOnly && "opacity-80 hover:shadow-sm cursor-default",
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium leading-normal line-clamp-2">{task.title}</p>
        <div className="flex flex-col gap-1 shrink-0">
            {task.isSensitive && (
                <Lock className="w-3 h-3 text-orange-400" />
            )}
             {task.isCarriedOver && (
                <History className="w-3 h-3 text-blue-400" />
            )}
        </div>
      </div>
      {/* Hover effect hint */}
      <div className="absolute inset-0 rounded-xl ring-2 ring-blue-500 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity" />
    </Card>
  );
}

