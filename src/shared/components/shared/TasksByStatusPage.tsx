import { getProfileByUsername, getUserTask } from '@/action/profile.action';
import TaskCard from '@/shared/components/shared/TaskCard';
import { notFound } from 'next/navigation';
import React from 'react';

interface TasksByStatusPageProps {
  params: { username: string; status: 'COMPLETED' | 'FAILED' };
}

async function TasksByStatusPage({ params }: TasksByStatusPageProps) {
  const { username, status } = params;

  const user = await getProfileByUsername(username);
  if (!user) notFound();

  const tasks = await getUserTask(user.id, status);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 relative">
      <div className="lg:col-span-10">
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <TaskCard key={task.id} task={{ ...task, type: 'task' }} dbUserId={user.id} />
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">No tasks yet</div>
        )}
      </div>
    </div>
  );
}

export default TasksByStatusPage;
