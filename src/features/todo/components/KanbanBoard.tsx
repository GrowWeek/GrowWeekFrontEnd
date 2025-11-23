'use client';

import { useState } from 'react';
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Plus } from "lucide-react";
import { Dialog, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/Dialog";

// Mock Data
const initialTodos = [
  { id: 1, title: "새로운 API 엔드포인트 설계", status: "todo" },
  { id: 2, title: "데이터베이스 스키마 리뷰", status: "todo" },
  { id: 3, title: "A회사 프로젝트 미팅 준비", status: "todo" },
  { id: 4, title: "로그인 기능 개발", status: "in_progress" },
  { id: 5, title: "코드 리뷰 진행", status: "in_progress" },
  { id: 6, title: "버그 수정 - 로그인 오류", status: "done" },
  { id: 7, title: "단위 테스트 작성", status: "done" },
  { id: 8, title: "문서 업데이트", status: "done" },
  { id: 9, title: "팀 미팅 참석", status: "done" },
  { id: 10, title: "개발 환경 설정", status: "done" },
];

type TodoStatus = 'todo' | 'in_progress' | 'done';

const statusMap = {
  todo: { label: '진행 전', bg: 'bg-gray-100 dark:bg-gray-800' },
  in_progress: { label: '진행 중', bg: 'bg-blue-50 dark:bg-blue-900/20' },
  done: { label: '완료', bg: 'bg-green-50 dark:bg-green-900/20' },
};

export function KanbanBoard() {
  const [todos, setTodos] = useState(initialTodos);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getTodosByStatus = (status: TodoStatus) => todos.filter(t => t.status === status);

  return (
    <div className="h-full flex flex-col p-6">
      <div className="flex justify-end mb-4">
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          할일 추가
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-6 flex-1 min-h-0">
        {(Object.keys(statusMap) as TodoStatus[]).map((status) => (
          <div 
            key={status} 
            className={`rounded-xl p-4 border border-gray-200 dark:border-gray-800 ${statusMap[status].bg}`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-700 dark:text-gray-300">
                {statusMap[status].label}
              </h3>
              <Badge variant="secondary" className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                {getTodosByStatus(status).length}
              </Badge>
            </div>
            
            <div className="space-y-3">
              {getTodosByStatus(status).map(todo => (
                <Card 
                  key={todo.id} 
                  className="p-4 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow bg-white dark:bg-gray-800"
                >
                  <p className="text-sm font-medium leading-normal">{todo.title}</p>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Add Task Modal Placeholder */}
       <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <div className="space-y-4">
           <DialogHeader>
              <DialogTitle>새 할일 추가</DialogTitle>
           </DialogHeader>
           <div className="p-4">
              <p className="text-gray-500">할일 추가 폼이 여기에 들어갑니다.</p>
           </div>
           <DialogFooter>
              <Button variant="secondary" onClick={() => setIsModalOpen(false)}>취소</Button>
              <Button onClick={() => setIsModalOpen(false)}>추가</Button>
           </DialogFooter>
        </div>
      </Dialog>
    </div>
  );
}

