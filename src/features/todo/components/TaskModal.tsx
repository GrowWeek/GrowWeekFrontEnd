import { useState, useEffect } from 'react';
import { Dialog, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Checkbox } from "@/components/ui/Checkbox";
import { CreateTaskRequest, Task, TaskStatus } from '../types';
import { Lock } from 'lucide-react';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: CreateTaskRequest) => void;
  initialData?: Task;
  mode: 'create' | 'edit';
  isReadOnly?: boolean;
}

export function TaskModal({ isOpen, onClose, onSubmit, initialData, mode, isReadOnly = false }: TaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>('TODO');
  const [isSensitive, setIsSensitive] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && initialData) {
        setTitle(initialData.title);
        setDescription(initialData.description || '');
        setStatus(initialData.status);
        setIsSensitive(initialData.isSensitive);
      } else {
        setTitle('');
        setDescription('');
        setStatus('TODO');
        setIsSensitive(false);
      }
    }
  }, [isOpen, initialData, mode]);

  const handleSubmit = () => {
    if (isReadOnly) return;
    if (!title.trim()) return;

    onSubmit({
      title,
      description,
      // status: status, // Removed as it's not in CreateTaskRequest
      isSensitive,
      createdDate: new Date().toISOString().split('T')[0] // Default for now
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          {isReadOnly && <Lock className="w-4 h-4 text-gray-500" />}
          {mode === 'create' ? '새 할일 추가' : isReadOnly ? '할일 상세 (읽기 전용)' : '할일 수정'}
        </DialogTitle>
      </DialogHeader>
      
      <div className="space-y-4 py-4">
        {isReadOnly && (
            <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md text-sm text-gray-600 dark:text-gray-400">
                회고가 완료된 주차의 할일은 수정할 수 없습니다.
            </div>
        )}

        {/* Title */}
        <div className="space-y-2">
          <label className="text-sm font-medium leading-none">
            할일 제목 *
          </label>
          <Input 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            placeholder="예: API 개발 완료하기" 
            autoFocus={!isReadOnly}
            disabled={isReadOnly}
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="text-sm font-medium leading-none">
            상세 설명 (선택)
          </label>
          <Textarea 
            value={description} 
            onChange={(e) => setDescription(e.target.value)} 
            placeholder="할일에 대한 추가 정보를 입력하세요" 
            disabled={isReadOnly}
          />
        </div>

        {/* Status */}
        <div className="space-y-2">
          <label className="text-sm font-medium leading-none">
            상태
          </label>
          <Select 
            value={status} 
            onChange={(e) => setStatus(e.target.value as TaskStatus)}
            disabled={isReadOnly}
          >
            <option value="TODO">진행 전</option>
            <option value="IN_PROGRESS">진행 중</option>
            <option value="DONE">완료</option>
          </Select>
        </div>

        {/* Sensitive Toggle */}
        <div className="flex items-center space-x-2 border p-3 rounded-md bg-yellow-50/50 border-yellow-100 dark:bg-yellow-900/10 dark:border-yellow-900/30">
          <Checkbox 
            id="sensitive" 
            checked={isSensitive}
            onChange={(e) => setIsSensitive(e.target.checked)}
            disabled={isReadOnly}
          />
          <div className="grid gap-1.5 leading-none">
            <label
              htmlFor="sensitive"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              민감정보로 표시
            </label>
            <p className="text-xs text-muted-foreground text-gray-500">
              회사명, 고객사, 금액 등이 포함된 경우 체크해주세요.
            </p>
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button variant="secondary" onClick={onClose}>
            {isReadOnly ? '닫기' : '취소'}
        </Button>
        {!isReadOnly && (
            <Button onClick={handleSubmit}>{mode === 'create' ? '추가' : '수정'}</Button>
        )}
      </DialogFooter>
    </Dialog>
  );
}
