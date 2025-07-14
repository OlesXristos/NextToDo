import { getPosts } from '@/action/post.action';
import { getSharedTask } from '@/action/sharedTask.action';
import { getDbUserId } from '@/action/user.action';
import CreatePost from '@/shared/components/shared/CreatePost';
import PostCard from '@/shared/components/shared/PostCard';
import TaskCard from '@/shared/components/shared/TaskCard';
import TasksTabs from '@/shared/components/shared/TaskTabs';

import { currentUser } from '@clerk/nextjs/server';
import { FileTextIcon } from 'lucide-react';

export default async function Home({ params }: { params: { id: string } }) {
  const user = await currentUser();
  const posts = await getPosts();
  const dbUserId = await getDbUserId();
  if (!user) null;
  const sharedTasks = await getSharedTask();

  return (
    <div
      className={`grid gap-1 ${
        user ? 'xs:[grid-template-columns:65px_3fr] md:grid-cols-[2fr_10fr_3fr]' : 'grid-cols-1'
      }`}>
      <div className="col-span-6 mb-20">
        <TasksTabs
          defaultTab="posts"
          createComponent={user ? <CreatePost /> : null}
          tabs={[
            {
              value: 'posts',
              label: 'Posts',
              icon: <FileTextIcon className="size-4" />,
              content: posts.map((post) => (
                <PostCard key={post.id} post={post} dbUserId={dbUserId} />
              )),
            },
            {
              value: 'sharedTasks',
              label: 'Shared Tasks',
              icon: <FileTextIcon className="size-4" />,
              content: sharedTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={{ ...task, type: 'sharedTask' }}
                  dbUserId={dbUserId}
                />
              )),
            },
          ]}
        />
      </div>
    </div>
  );
}
