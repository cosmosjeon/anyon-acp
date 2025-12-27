import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Save, Loader2 } from '@/lib/icons';

interface CreateSnapshotDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (message: string) => Promise<void>;
  changedFilesCount: number;
  isLoading: boolean;
}

/**
 * 스냅샷 생성 다이얼로그
 */
export const CreateSnapshotDialog: React.FC<CreateSnapshotDialogProps> = ({
  open,
  onOpenChange,
  onConfirm,
  changedFilesCount,
  isLoading,
}) => {
  const [message, setMessage] = useState('');

  const handleConfirm = async () => {
    const trimmedMessage = message.trim() || '작업 내용 저장';
    await onConfirm(trimmedMessage);
    setMessage('');
    onOpenChange(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.metaKey) {
      e.preventDefault();
      handleConfirm();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Save className="w-5 h-5" />
            현재 상태 저장하기
          </DialogTitle>
          <DialogDescription>
            {changedFilesCount > 0 ? (
              <>변경된 파일 <strong>{changedFilesCount}개</strong>를 저장합니다</>
            ) : (
              '현재 상태를 저장 시점으로 기록합니다'
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <label className="text-sm font-medium text-foreground mb-2 block">
            설명 (선택사항)
          </label>
          <Textarea
            placeholder="어떤 작업을 했는지 간단히 적어주세요"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            className="resize-none"
            rows={3}
            disabled={isLoading}
          />
          <p className="text-xs text-muted-foreground mt-2">
            ⌘+Enter로 빠르게 저장
          </p>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            취소
          </Button>
          <Button onClick={handleConfirm} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                저장 중...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                저장하기
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateSnapshotDialog;
