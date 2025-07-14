'use server';

import prisma from '@/lib/prisma';
import { getDbUserId } from './user.action';
import { revalidatePath } from 'next/cache';

export async function createPost(content: string, image: string) {
  try {
    const userId = await getDbUserId();
    if (!userId) return;
    const post = await prisma.post.create({
      data: {
        content,
        authorId: userId,
        image,
      },
    });
    revalidatePath('/');
    return { success: true, post };
  } catch (error) {
    console.error('Error creating post:', error);
    return { success: false, error: 'Failed to create post' };
  }
}

export async function getPosts(taskId?: string, userName?: string) {
  try {
    const posts = await prisma.post.findMany({
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
    return posts;
  } catch (error) {
    console.log('Error getting posts:', error);
    throw new Error('Failed to fetch posts');
  }
}

export async function toggleLike(postId: string) {
  try {
    const userId = await getDbUserId();
    if (!userId) return;

    // check if like exists
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true },
    });

    if (!post) throw new Error('Post not found');

    if (existingLike) {
      // unlike + delete notification in one transaction
      await prisma.$transaction([
        prisma.like.delete({
          where: {
            userId_postId: {
              userId,
              postId,
            },
          },
        }),
        prisma.notification.deleteMany({
          where: {
            type: 'LIKE',
            userId: post.authorId, // отримувач сповіщення
            creatorId: userId, // той, хто лайкнув
            postId,
          },
        }),
      ]);
    } else {
      // like and maybe create notification
      await prisma.$transaction([
        prisma.like.create({
          data: {
            userId,
            postId,
          },
        }),
        ...(post.authorId !== userId
          ? [
              prisma.notification.create({
                data: {
                  type: 'LIKE',
                  userId: post.authorId,
                  creatorId: userId,
                  postId,
                },
              }),
            ]
          : []),
      ]);
    }

    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Failed to toggle like:', error);
    return { success: false, error: 'Failed to toggle like' };
  }
}

export async function createComment(postId: string, content: string) {
  try {
    const userId = await getDbUserId();

    if (!userId) return;
    if (!content) throw new Error('Content is required');

    const post = await prisma.post.findUnique({
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
          postId,
        },
      });

      // Create notification if commenting on someone else's post
      if (post.authorId !== userId) {
        await tx.notification.create({
          data: {
            type: 'COMMENT',
            userId: post.authorId,
            creatorId: userId,
            postId,
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
export async function deleteComment(commentId: string) {
  try {
    const userId = await getDbUserId();
    if (!userId) return;

    // Отримуємо коментар + автора поста
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: {
        authorId: true,
        post: {
          select: {
            authorId: true,
          },
        },
      },
    });

    if (!comment) throw new Error('Comment not found');

    const isCommentAuthor = comment.authorId === userId;
    const isPostOwner = comment.post?.authorId === userId;

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

export async function deletePost(postId: string) {
  try {
    const userId = await getDbUserId();

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true },
    });

    if (!post) throw new Error('Post not found');
    if (post.authorId !== userId) throw new Error('Unauthorized - no delete permission');

    await prisma.post.delete({
      where: { id: postId },
    });

    revalidatePath('/'); // purge the cache
    return { success: true };
  } catch (error) {
    console.error('Failed to delete post:', error);
    return { success: false, error: 'Failed to delete post' };
  }
}
