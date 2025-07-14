'use server';

import prisma from '@/lib/prisma';
import { getDbUserId } from './user.action';
import { revalidatePath } from 'next/cache';
import { TaskStatus } from '@prisma/client';

export async function createSharedTask(content: string, image: string) {
  try {
    const userId = await getDbUserId();
    if (!userId) return;
    const sharedTask = await prisma.sharedTask.create({
      data: {
        content,
        authorId: userId,
        image,
      },
    });
    revalidatePath('/');
    return { success: true, sharedTask };
  } catch (error) {
    console.error('Error creating sharedTask:', error);
    return { success: false, error: 'Failed to create sharedTask' };
  }
}

export async function getSharedTask(taskId?: string, userName?: string) {
  try {
    const sharedTask = await prisma.sharedTask.findMany({
      where: { id: taskId, author: { username: userName } },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          },
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                username: true,
                image: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
        likes: {
          select: {
            userId: true,
          },
        },
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
      },
    });
    return sharedTask;
  } catch (error) {
    console.log('Error getting sharedTask:', error);
    throw new Error('Failed to fetch sharedTask');
  }
}

export async function toggleTaskLike(taskId: string) {
  try {
    const userId = await getDbUserId();
    if (!userId) return;

    const task = await prisma.sharedTask.findUnique({
      where: { id: taskId },
      select: { authorId: true },
    });

    if (!task) throw new Error('Task not found');

    const existingLike = await prisma.like.findUnique({
      where: {
        userId_sharedTaskId: {
          userId,
          sharedTaskId: taskId,
        },
      },
    });

    if (existingLike) {
      await prisma.$transaction([
        prisma.like.delete({
          where: {
            userId_sharedTaskId: {
              userId,
              sharedTaskId: taskId,
            },
          },
        }),
        prisma.notification.deleteMany({
          where: {
            type: 'LIKE',
            userId: task.authorId,
            creatorId: userId,
            sharedTaskId: taskId,
          },
        }),
      ]);
    } else {
      await prisma.$transaction([
        prisma.like.create({
          data: {
            userId,
            sharedTaskId: taskId,
          },
        }),
        ...(task.authorId !== userId
          ? [
              prisma.notification.create({
                data: {
                  type: 'LIKE',
                  userId: task.authorId,
                  creatorId: userId,
                  sharedTaskId: taskId,
                },
              }),
            ]
          : []),
      ]);
    }

    revalidatePath('/'); // оновлення сторінки, якщо потрібно
    return { success: true };
  } catch (error) {
    console.error('Failed to toggle task like:', error);
    return { success: false, error: 'Failed to toggle task like' };
  }
}

export async function createSharedTaskComment(postId: string, content: string) {
  try {
    const userId = await getDbUserId();

    if (!userId) return;
    if (!content) throw new Error('Content is required');

    const post = await prisma.sharedTask.findUnique({
      where: { id: postId },
      select: { authorId: true },
    });

    if (!post) throw new Error('Post not found');

    // Create comment and notification in a transaction
    const [comment] = await prisma.$transaction(async (tx) => {
      // Create comment first
      const newComment = await tx.comment.create({
        data: {
          content,
          authorId: userId,
          sharedTaskId: postId,
        },
      });

      // Create notification if commenting on someone else's post
      if (post.authorId !== userId) {
        await tx.notification.create({
          data: {
            type: 'COMMENT',
            userId: post.authorId,
            creatorId: userId,
            sharedTaskId: postId,
            commentId: newComment.id,
          },
        });
      }

      return [newComment];
    });

    revalidatePath(`/`);
    return { success: true, comment };
  } catch (error) {
    console.error('Failed to create comment:', error);
    return { success: false, error: 'Failed to create comment' };
  }
}

export async function deleteSharedTaskComment(commentId: string) {
  try {
    const userId = await getDbUserId();
    if (!userId) return;

    // Отримуємо коментар + автора поста
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: {
        authorId: true,
        sharedTask: {
          select: {
            authorId: true,
          },
        },
      },
    });

    if (!comment) throw new Error('Comment not found');

    const isCommentAuthor = comment.authorId === userId;
    const isPostOwner = comment.sharedTask?.authorId === userId;

    if (!isCommentAuthor && !isPostOwner) {
      throw new Error('Not authorized to delete this comment');
    }

    await prisma.$transaction(async (tx) => {
      // Видалити пов'язані сповіщення
      await tx.notification.deleteMany({
        where: {
          commentId: commentId,
        },
      });

      // Видалити коментар
      await tx.comment.delete({
        where: { id: commentId },
      });
    });

    revalidatePath(`/`);
    return { success: true };
  } catch (error) {
    console.error('Failed to delete comment:', error);
    return { success: false, error: 'Failed to delete comment' };
  }
}

export async function deleteSharedTask(postId: string) {
  try {
    const userId = await getDbUserId();

    const post = await prisma.sharedTask.findUnique({
      where: { id: postId },
      select: { authorId: true },
    });

    if (!post) throw new Error('Post not found');
    if (post.authorId !== userId) throw new Error('Unauthorized - no delete permission');

    await prisma.sharedTask.delete({
      where: { id: postId },
    });

    revalidatePath('/'); // purge the cache
    return { success: true };
  } catch (error) {
    console.error('Failed to delete post:', error);
    return { success: false, error: 'Failed to delete post' };
  }
}

export async function updateSharedTask(formData: FormData, taskId: string) {
  try {
    const userId = await getDbUserId();
    if (!userId) return;
    const content = formData.get('content') as string;
    const image = formData.get('image') as string;

    const task = await prisma.sharedTask.update({
      where: { id: taskId, authorId: userId },
      data: {
        content,
        image,
      },
    });

    revalidatePath('/');
    return { success: true, task };
  } catch (error) {
    console.error('Error updating task:', error);
    return { success: false, error: 'Failed to update task' };
  }
}
