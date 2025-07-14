'use client';

import * as React from 'react';
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { CheckIcon, XIcon } from 'lucide-react';

import toast from 'react-hot-toast';
import { updateTaskStatus } from '@/action/task.action';
import { useRouter } from 'next/navigation';
import { getUserSharedTasks, getUserTask } from '@/action/profile.action';

type Tasks = Awaited<ReturnType<typeof getUserTask>>;
type Task = Tasks[number];
type SharedTasks = Awaited<ReturnType<typeof getUserSharedTasks>>;
type SharedTask = SharedTasks[number];

type TaskType = Task & { type: 'task' };
type SharedTaskType = SharedTask & { type: 'sharedTask' };

type TaskCardProps = {
  task: TaskType | SharedTaskType;
  dbUserId: string | null;
};

export function TaskStatus({ task, dbUserId }: TaskCardProps) {
  const [taskStatus, setTaskStatus] = React.useState(task.status);
  const [updating, setUpdating] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);
  const router = useRouter();
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  const handleUpdateStatus = async (status: 'COMPLETED' | 'FAILED') => {
    if (updating) return;
    try {
      setUpdating(true);
      await updateTaskStatus(task.id, status, task.type);
      setTaskStatus(status);
      toast.success(`Task marked as ${status.toLowerCase()}`);
      router.refresh();
    } catch {
      toast.error('Failed to update task status');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="flex cursor-pointer " onClick={(e) => e.stopPropagation()}>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger
          asChild
          disabled={
            taskStatus === 'COMPLETED' || taskStatus === 'FAILED' || dbUserId !== task.author.id
          }>
          <div
            className={`flex  justify-center w-full py-2 border rounded-xl  ${
              taskStatus === 'FAILED'
                ? 'bg-red-100'
                : taskStatus === 'COMPLETED'
                ? 'bg-green-100'
                : taskStatus === 'PENDING'
                ? ' bg-blue-100'
                : ''
            }`}>
            <p className="text-black ">Status: {taskStatus}</p>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent ref={dropdownRef} className="w-56">
          <DropdownMenuLabel>Task Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />

          {dbUserId === task.author.id && (
            <>
              {taskStatus !== 'FAILED' && (
                <DropdownMenuItem onSelect={() => handleUpdateStatus('COMPLETED')}>
                  <CheckIcon className="mr-2 h-4 w-4" />
                  Mark as Completed
                </DropdownMenuItem>
              )}

              {taskStatus !== 'COMPLETED' && (
                <DropdownMenuItem onSelect={() => handleUpdateStatus('FAILED')}>
                  <XIcon className="mr-2 h-4 w-4" />
                  Mark as Failed
                </DropdownMenuItem>
              )}
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
