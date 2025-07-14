'use client';

import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/shared/components/ui/dialog';
import { Trash2Icon, Loader2Icon } from 'lucide-react';

interface DeleteTaskModalProps {
  isDeleting: boolean;
  onDelete: () => Promise<void>;
  triggerClassName?: string;
  taskTitle?: string;
}

export function DeleteAlertDialog({
  isDeleting,
  onDelete,
  triggerClassName = '',
  taskTitle = 'this task',
}: DeleteTaskModalProps) {
  const [open, setOpen] = useState(false);

  const handleDelete = async () => {
    await onDelete();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`text-muted-foreground hover:text-red-500 ${triggerClassName}`}>
          {isDeleting ? (
            <Loader2Icon className="size-4 animate-spin" />
          ) : (
            <Trash2Icon className="size-4" />
          )}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Task</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete <strong>{taskTitle}</strong>? This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-500 hover:bg-red-600">
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
