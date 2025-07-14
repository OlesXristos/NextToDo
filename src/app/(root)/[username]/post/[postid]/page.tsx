import { getPosts } from '@/action/post.action';
import { getDbUserId } from '@/action/user.action';
import PostCard from '@/shared/components/shared/PostCard';
import React from 'react';

const ContentPage = async ({ params }: { params: { username: string; postid: string } }) => {
  const { username, postid } = params;
  console.log('taskId from URL:', postid);
  const Posts = (await getPosts(postid, username)).find(
    (task) => task.author.username === username && task.id === postid,
  );
  const dbUserId = await getDbUserId();

  if (!Posts) return null;

  return (
    <main className="p-4">
      <PostCard key={Posts.id} post={Posts} dbUserId={dbUserId} separatePage={true} />
    </main>
  );
};

export default ContentPage;
