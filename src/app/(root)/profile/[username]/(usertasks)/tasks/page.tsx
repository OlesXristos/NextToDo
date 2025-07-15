import { getProfileByUsername, getUserSharedTasks, getUserTask } from '@/action/profile.action';
import TaskCard from '@/shared/components/shared/TaskCard';
import TasksTabs from '@/shared/components/shared/TaskTabs';
import { FileTextIcon } from 'lucide-react';
import { notFound } from 'next/navigation';

async function TaskPage({ params }: { params: { username: string } }) {
  const user = await getProfileByUsername(params.username);

  if (!user) notFound();

  const [tasks, sharedTasks] = await Promise.all([
    getUserTask(user.id),
    getUserSharedTasks(user.id),
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
              content:
                tasks.length > 0 ? (
                  tasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={{ ...task, type: 'task' }}
                      dbUserId={user.id}
                      diaseble
                    />
                  ))
                ) : (
                  <p className="text-muted-foreground mt-4 text-center">Завдань ще немає</p>
                ),
            },
            {
              value: 'sharedTasks',
              label: 'Shared Tasks',
              icon: <FileTextIcon className="size-4" />,
              content:
                sharedTasks.length > 0 ? (
                  sharedTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={{ ...task, type: 'sharedTask' }}
                      dbUserId={user.id}
                      diaseble
                    />
                  ))
                ) : (
                  <p className="text-muted-foreground mt-4 text-center">Немає спільних завдань</p>
                ),
            },
          ]}
        />
      </div>
    </div>
  );
}

export default TaskPage;
