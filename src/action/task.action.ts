'use server';

import prisma from '@/lib/prisma';
import { getDbUserId } from './user.action';
import { revalidatePath } from 'next/cache';
import { TaskStatus } from '@prisma/client';
import { auth } from '@clerk/nextjs/server';
// task.action.ts
export async function updateTaskStatus(
  taskId: string,
  newStatus: TaskStatus,
  type: 'task' | 'sharedTask',
) {
  try {
    if (type === 'task') {
      const updatedTask = await prisma.task.update({
        where: { id: taskId },
        data: { status: newStatus },
      });
      return { success: true, task: updatedTask };
    } else {
      const updatedSharedTask = await prisma.sharedTask.update({
        where: { id: taskId },
        data: { status: newStatus },
      });
      return { success: true, task: updatedSharedTask };
    }
  } catch (error) {
    console.error('Failed to update task status:', error);
    return { success: false, error: 'Something went wrong updating the task status' };
  }
}

export async function updateTask(formData: FormData, taskId: string) {
  try {
    const userId = await getDbUserId();
    if (!userId) return;
    const content = formData.get('content') as string;
    const image = formData.get('image') as string;

    const task = await prisma.task.update({
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

export async function createTask(content: string, image: string) {
  try {
    const userId = await getDbUserId();
    if (!userId) return;
    const task = await prisma.task.create({
      data: {
        content,
        authorId: userId,
        image,
      },
    });
    revalidatePath('/');
    return { success: true, task };
  } catch (error) {
    console.error('Error creating task:', error);
    return { success: false, error: 'Failed to create task' };
  }
}

// export async function getTasks(userId: string) {
//   try {
//     const tasks = await prisma.task.findMany({
//       where: {
//         authorId: userId,
//       },
//       orderBy: {
//         createdAt: 'desc',
//       },
//       include: {
//         author: {
//           select: {
//             id: true,
//             name: true,
//             username: true,
//             image: true,
//           },
//         },
//       },
//     });
//     return tasks;
//   } catch (error) {
//     console.log('Error getting tasks:', error);
//     throw new Error('Failed to fetch tasks');
//   }
// }

export async function deleteTask(taskId: string) {
  try {
    const userId = await getDbUserId();

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      select: { authorId: true },
    });

    if (!task) throw new Error('task not found');
    if (task.authorId !== userId) throw new Error('Unauthorized - no delete permission');

    await prisma.task.delete({
      where: { id: taskId },
    });

    revalidatePath('/'); // purge the cache
    return { success: true };
  } catch (error) {
    console.error('Failed to delete post:', error);
    return { success: false, error: 'Failed to delete post' };
  }
}
