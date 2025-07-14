'use client';
import toast from 'react-hot-toast';
import { Card, CardContent } from '../ui/card';
import Link from 'next/link';
import { Avatar, AvatarImage } from '../ui/avatar';
import { formatDistanceToNow } from 'date-fns';

import { TaskStatus } from './TaskStatus';
import { DeleteAlertDialog } from './DeleteAlertDialog';
import React, { useState } from 'react';
import { SignInButton, useUser } from '@clerk/nextjs';
import { Button } from '../ui/button';
import { EditIcon, HeartIcon, LogInIcon, MessageCircleIcon, SendIcon } from 'lucide-react';
import { Textarea } from '../ui/textarea';
import { getUserSharedTasks, getUserTask } from '@/action/profile.action';

import {
  deleteSharedTask,
  toggleTaskLike,
  createSharedTaskComment,
  deleteSharedTaskComment,
  updateSharedTask,
} from '@/action/sharedTask.action';
import { usePathname, useRouter } from 'next/navigation';
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { deleteTask, updateTask } from '@/action/task.action';

type Tasks = Awaited<ReturnType<typeof getUserTask>>;
type Task = Tasks[number];
type SharedTasks = Awaited<ReturnType<typeof getUserSharedTasks>>;
type SharedTask = SharedTasks[number];

type TaskType = Task & { type: 'task' };
type SharedTaskType = SharedTask & { type: 'sharedTask' };

type TaskCardProps = {
  task: TaskType | SharedTaskType;
  dbUserId: string | null;
  diaseble?: boolean;
  separatePage?: boolean;
};

function TaskCard({ task, dbUserId, diaseble, separatePage }: TaskCardProps) {
  const { user } = useUser();
  const [newComment, setNewComment] = useState('');
  const [isCommenting, setIsCommenting] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showComments, setShowComments] = useState(separatePage ? true : false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editForm, setEditForm] = useState({
    content: task.content || '',
    image: task.image || '',
  });

  const router = useRouter();
  const isSharedTask = task.type === 'sharedTask';

  const [hasLiked, setHasLiked] = useState(
    isSharedTask ? task.likes.some((like) => like.userId === dbUserId) : false,
  );
  const [optimisticLikes, setOptimisticLikes] = useState(isSharedTask ? task._count.likes : 0);

  const handleLike = async () => {
    if (isLiking || !isSharedTask) return;

    try {
      setIsLiking(true);
      setHasLiked((prev) => !prev);
      setOptimisticLikes((prev) => prev + (hasLiked ? -1 : 1));
      await toggleTaskLike(task.id);
    } catch (error) {
      setOptimisticLikes(task._count.likes);
      setHasLiked(task.likes.some((like) => like.userId === dbUserId));
    } finally {
      setIsLiking(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || isCommenting || !isSharedTask) return;
    try {
      setIsCommenting(true);
      const result = await createSharedTaskComment(task.id, newComment);
      if (result?.success) {
        toast.success('Comment posted successfully');
        setNewComment('');
      }
    } catch (error) {
      toast.error('Failed to add comment');
    } finally {
      setIsCommenting(false);
    }
  };
  const handleDeleteComent = async (coment: string) => {
    if (isDeleting) return;
    try {
      setIsDeleting(true);
      const result = await deleteSharedTaskComment(coment);
      if (result?.success) toast.success('coment deleted successfully');
      else throw new Error(result?.error);
    } catch (error) {
      toast.error('Failed to delete coment');
    } finally {
      setIsDeleting(false);
    }
  };
  const handleDeleteTask = async () => {
    if (isDeleting) return;
    try {
      setIsDeleting(true);
      const result =
        task.type === 'task' ? await deleteTask(task.id) : await deleteSharedTask(task.id);
      if (result.success) {
        toast.success('Task deleted');
      } else {
        throw new Error(result.error);
      }
    } catch {
      toast.error('Failed to delete task');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditSubmit = async () => {
    const formData = new FormData();
    Object.entries(editForm).forEach(([key, value]) => {
      formData.append(key, value);
    });

    const result =
      task.type === 'task'
        ? await updateTask(formData as FormData, task.id)
        : await updateSharedTask(formData as FormData, task.id);
    if (result?.success) {
      setShowEditDialog(false);
      toast.success('Profile updated successfully');
    }
  };
  return (
    <Card className="overflow-hidden">
      <CardContent
        className="p-4 sm:p-6 cursor-pointer"
        onClick={() =>
          diaseble ? null : router.push(`/${task.author.username}/shared/${task.id}`)
        }>
        <div className="space-y-4">
          <div className="flex space-x-3 sm:space-x-4">
            <Link href={`/${task.author.username}`} onClick={(e) => e.stopPropagation()}>
              <Avatar className="size-8 sm:w-10 sm:h-10">
                <AvatarImage src={task.author.image ?? '/avatar.png'} />
              </Avatar>
            </Link>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex flex-col items-start truncate">
                  <Link
                    href={`/profile/${task.author.username}`}
                    onClick={(e) => e.stopPropagation()}
                    className="font-semibold truncate">
                    {task.author.name}
                  </Link>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Link
                      href={`/profile/${task.author.username}`}
                      onClick={(e) => e.stopPropagation()}>
                      @{task.author.username}
                    </Link>
                    <span>•</span>
                    <span>{formatDistanceToNow(new Date(task.createdAt))} ago</span>
                  </div>
                </div>
                {dbUserId === task.author.id && (
                  <div onClick={(e) => e.stopPropagation()} className="flex items-center space-x-2">
                    <Button variant="ghost" onClick={() => setShowEditDialog(true)}>
                      <EditIcon className="size-4 " />
                    </Button>
                    <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                      <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                          <DialogTitle>Edit task</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label>Content</Label>
                            <Input
                              name="content"
                              value={editForm.content}
                              onChange={(e) =>
                                setEditForm({ ...editForm, content: e.target.value })
                              }
                              placeholder="Edit your task content"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Image</Label>
                            <Textarea
                              name="image"
                              value={editForm.image}
                              onChange={(e) => setEditForm({ ...editForm, image: e.target.value })}
                              className="min-h-[100px]"
                              placeholder="Edit image URL (optional)"
                            />
                          </div>
                        </div>
                        <div className="flex justify-end gap-3">
                          <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                          </DialogClose>
                          <Button onClick={handleEditSubmit}>Save Changes</Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <DeleteAlertDialog isDeleting={isDeleting} onDelete={handleDeleteTask} />
                  </div>
                )}
              </div>

              <p className="max-w-[calc(100%-2rem)] text-sm text-foreground break-words mt-2">
                {task.content}
              </p>
            </div>
          </div>

          {/* TASK IMAGE */}
          {task.image && (
            <div className="rounded-lg overflow-hidden">
              <img src={task.image} alt="Task content" className="w-full h-auto object-cover" />
            </div>
          )}

          <TaskStatus task={task} dbUserId={dbUserId} />

          {/* LIKE & COMMENT BUTTONS */}
          {isSharedTask && (
            <div className="flex items-center pt-2 space-x-4" onClick={(e) => e.stopPropagation()}>
              {user ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className={`text-muted-foreground gap-2 ${
                    hasLiked ? 'text-red-500 hover:text-red-600' : 'hover:text-red-500'
                  }`}
                  onClick={handleLike}>
                  {hasLiked ? (
                    <HeartIcon className="size-5 fill-current" />
                  ) : (
                    <HeartIcon className="size-5" />
                  )}
                  <span>{optimisticLikes}</span>
                </Button>
              ) : (
                <SignInButton mode="modal">
                  <Button variant="ghost" size="sm" className="text-muted-foreground gap-2">
                    <HeartIcon className="size-5" />
                    <span>{optimisticLikes}</span>
                  </Button>
                </SignInButton>
              )}

              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground gap-2 hover:text-blue-500"
                onClick={() => setShowComments((prev) => !prev)}>
                <MessageCircleIcon
                  className={`size-5 ${showComments ? 'fill-blue-500 text-blue-500' : ''}`}
                />
                <span>{task.comments.length}</span>
              </Button>
            </div>
          )}

          {/* COMMENTS SECTION */}
          {isSharedTask && showComments && (
            <div className="space-y-4 pt-4 border-t" onClick={(e) => e.stopPropagation()}>
              <div className="space-y-4">
                {/* DISPLAY COMMENTS */}
                {task.comments.map((comment) => (
                  <div className="flex space-x-3 sm:space-x-4" key={comment.id}>
                    <Link href={`/profile/${comment.author.username}`}>
                      <Avatar className="size-8 sm:w-10 sm:h-10">
                        <AvatarImage src={comment.author.image ?? '/avatar.png'} />
                      </Avatar>
                    </Link>

                    {/* comment HEADER & TEXT CONTENT */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex flex-col   items-start   truncate">
                          <Link
                            href={`/profile/${comment.author.username}`}
                            className="font-semibold truncate">
                            {comment.author.name}
                          </Link>
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <Link href={`/profile/${comment.author.username}`}>
                              @{comment.author.username}
                            </Link>
                            <span>•</span>
                            <span>{formatDistanceToNow(new Date(comment.createdAt))} ago</span>
                          </div>
                        </div>
                        {/* Check if current user is the post author */}
                        {(dbUserId === comment.author.id || dbUserId === task.author.id) && (
                          <DeleteAlertDialog
                            isDeleting={isDeleting}
                            onDelete={() => handleDeleteComent(comment.id)}
                          />
                        )}
                      </div>
                      <p className="mt-2 text-sm text-foreground break-words">{comment.content}</p>
                    </div>
                  </div>
                ))}
              </div>

              {user ? (
                <div className="flex space-x-3">
                  <Avatar className="size-8 flex-shrink-0">
                    <AvatarImage src={user?.imageUrl || '/avatar.png'} />
                  </Avatar>
                  <div className="flex-1">
                    <Textarea
                      placeholder="Write a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="min-h-[80px] resize-none"
                    />
                    <div className="flex justify-end mt-2">
                      <Button
                        size="sm"
                        onClick={handleAddComment}
                        className="flex items-center gap-2"
                        disabled={!newComment.trim() || isCommenting}>
                        {isCommenting ? (
                          'Posting...'
                        ) : (
                          <>
                            <SendIcon className="size-4" />
                            Comment
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex justify-center p-4 border rounded-lg bg-muted/50">
                  <SignInButton mode="modal">
                    <Button variant="outline" className="gap-2">
                      <LogInIcon className="size-4" />
                      Sign in to comment
                    </Button>
                  </SignInButton>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default TaskCard;
