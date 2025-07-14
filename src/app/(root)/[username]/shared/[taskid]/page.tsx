import { getSharedTask } from '@/action/sharedTask.action';
import { getDbUserId } from '@/action/user.action';
import TaskCard from '@/shared/components/shared/TaskCard';
import React from 'react';

const ContentPage = async ({ params }: { params: { username: string; taskid: string } }) => {
  const { username, taskid } = params;
  const sharedTask = (await getSharedTask(taskid, username)).find(
    (task) => task.author.username === username && task.id === taskid,
  );
  const dbUserId = await getDbUserId();

  if (!sharedTask) return null;

  return (
    <main className="p-4">
      <TaskCard
        key={sharedTask.id}
        task={{ ...sharedTask, type: 'sharedTask' }}
        dbUserId={dbUserId}
        separatePage={true}
      />
    </main>
  );
};

export default ContentPage;
