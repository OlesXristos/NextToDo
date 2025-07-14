'use client';

import {
  createComment,
  deleteComment,
  deletePost,
  getPosts,
  toggleLike,
} from '@/action/post.action';
import { SignInButton, useUser } from '@clerk/nextjs';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { Card, CardContent } from '../ui/card';
import Link from 'next/link';
import { Avatar, AvatarImage } from '../ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '../ui/button';
import { HeartIcon, LogInIcon, MessageCircleIcon, SendIcon } from 'lucide-react';
import { Textarea } from '../ui/textarea';
import { DeleteAlertDialog } from './DeleteAlertDialog';
import { useRouter } from 'next/navigation';

type Posts = Awaited<ReturnType<typeof getPosts>>;
type Post = Posts[number];

function PostCard({
  post,
  dbUserId,
  separatePage,
}: {
  post: Post;
  dbUserId: string | null;
  separatePage?: boolean;
}) {
  const { user } = useUser();
  const router = useRouter();

  const [newComment, setNewComment] = useState('');
  const [isCommenting, setIsCommenting] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [hasLiked, setHasLiked] = useState(post.likes.some((like) => like.userId === dbUserId));
  const [optimisticLikes, setOptmisticLikes] = useState(post._count.likes);
  const [showComments, setShowComments] = useState(separatePage ? true : false);

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLiking) return;
    try {
      setIsLiking(true);
      setHasLiked((prev) => !prev);
      setOptmisticLikes((prev) => prev + (hasLiked ? -1 : 1));
      await toggleLike(post.id);
    } catch (error) {
      setOptmisticLikes(post._count.likes);
      setHasLiked(post.likes.some((like) => like.userId === dbUserId));
    } finally {
      setIsLiking(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || isCommenting) return;
    try {
      setIsCommenting(true);
      const result = await createComment(post.id, newComment);
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

  const handleDeletePost = async () => {
    if (isDeleting) return;
    try {
      setIsDeleting(true);
      const result = await deletePost(post.id);
      if (result.success) toast.success('Post deleted successfully');
      else throw new Error(result.error);
    } catch (error) {
      toast.error('Failed to delete post');
    } finally {
      setIsDeleting(false);
    }
  };
  const handleDeleteComent = async (coment: string) => {
    if (isDeleting) return;
    try {
      setIsDeleting(true);
      const result = await deleteComment(coment);
      if (result?.success) toast.success('coment deleted successfully');
      else throw new Error(result?.error);
    } catch (error) {
      toast.error('Failed to delete coment');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardContent
        className="p-4 sm:p-6 cursor-pointer"
        onClick={() => router.push(`/${post.author.username}/post/${post.id}`)}>
        <div className="space-y-4">
          <div className="flex space-x-3 sm:space-x-4">
            <Link href={`/profile/${post.author.username}`} onClick={(e) => e.stopPropagation()}>
              <Avatar className="size-8 sm:w-10 sm:h-10">
                <AvatarImage src={post.author.image ?? '/avatar.png'} />
              </Avatar>
            </Link>

            {/* POST HEADER & TEXT CONTENT */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex flex-col   items-start   truncate">
                  <Link
                    href={`/profile/${post.author.username}`}
                    onClick={(e) => e.stopPropagation()}
                    className="font-semibold truncate">
                    {post.author.name}
                  </Link>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Link href={`/profile/${post.author.username}`}>@{post.author.username}</Link>
                    <span>•</span>
                    <span>{formatDistanceToNow(new Date(post.createdAt))} ago</span>
                  </div>
                </div>
                {/* Check if current user is the post author */}
                {dbUserId === post.author.id && (
                  <div onClick={(e) => e.stopPropagation()}>
                    <DeleteAlertDialog isDeleting={isDeleting} onDelete={handleDeletePost} />
                  </div>
                )}
              </div>
              <p className="mt-2 text-sm text-foreground break-words">{post.content}</p>
            </div>
          </div>

          {/* POST IMAGE */}
          {post.image && (
            <div className="rounded-lg overflow-hidden">
              <img src={post.image} alt="Post content" className="w-full h-auto object-cover" />
            </div>
          )}

          {/* LIKE & COMMENT BUTTONS */}
          <div className="flex items-center pt-2 space-x-4">
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
              onClick={(e) => {
                e.stopPropagation();
                setShowComments((prev) => !prev);
              }}>
              <MessageCircleIcon
                className={`size-5 ${showComments ? 'fill-blue-500 text-blue-500' : ''}`}
              />
              <span>{post.comments.length}</span>
            </Button>
          </div>

          {/* COMMENTS SECTION */}
          {showComments && (
            <div className="space-y-4 pt-4 border-t" onClick={(e) => e.stopPropagation()}>
              <div className="space-y-4">
                {/* DISPLAY COMMENTS */}
                {post.comments.map((comment) => (
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
                        {(dbUserId === comment.author.id || dbUserId === post.author.id) && (
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
export default PostCard;
