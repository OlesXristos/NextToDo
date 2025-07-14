import { getProfileByUsername, getUserSharedTasks, getUserTask } from '@/action/profile.action';
import CreatePost from '@/shared/components/shared/CreatePost';
import TaskCard from '@/shared/components/shared/TaskCard';
import TasksTabs from '@/shared/components/shared/TaskTabs';
import { FileTextIcon } from 'lucide-react';
import { notFound } from 'next/navigation';
import React from 'react';

interface TasksByStatusPageProps {
  params: { username: string; status: 'completed' | 'failed' };
}

async function TasksByStatusPage({ params }: TasksByStatusPageProps) {
  const { username, status } = params;

  const user = await getProfileByUsername(username);
  if (!user) notFound();

  // Приводимо статус до великого регістру, бо в базі, мабуть, так зберігається
  const formattedStatus = status.toUpperCase() as 'COMPLETED' | 'FAILED';

  if (formattedStatus !== 'COMPLETED' && formattedStatus !== 'FAILED') {
    notFound(); // Якщо статус невідомий — кидаємо 404
  }
  const [tasks, sharedTasks] = await Promise.all([
    getUserTask(user.id, formattedStatus),
    getUserSharedTasks(user.id, formattedStatus),
  ]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 relative">
      <div className="lg:col-span-10 mb-20">
        <TasksTabs
          defaultTab="tasks"
          tabs={[
            {
              value: 'tasks',
              label: 'Tasks',
              icon: <FileTextIcon className="size-4" />,
              content: tasks.map((task) => (
                <TaskCard key={task.id} task={{ ...task, type: 'task' }} dbUserId={user.id} />
              )),
            },
            {
              value: 'sharedTasks',
              label: 'Shared Tasks',
              icon: <FileTextIcon className="size-4" />,
              content: sharedTasks.map((task) => (
                <TaskCard key={task.id} task={{ ...task, type: 'sharedTask' }} dbUserId={user.id} />
              )),
            },
          ]}
        />
      </div>
    </div>
  );
}

export default TasksByStatusPage;
