import {
  getProfileByUsername,
  getUserLikedPosts,
  getUserPosts,
  getUserSharedTasks,
  getUserTask,
  isFollowing,
} from '@/action/profile.action';
import { notFound } from 'next/navigation';
import ProfilePageClient from '@/shared/components/shared/ProfilePageClient';
import { getDbUserId } from '@/action/user.action';

export async function generateMetadata({ params }: { params: { username: string } }) {
  const user = await getProfileByUsername(params.username);
  if (!user) return;

  return {
    title: `${user.name ?? user.username}`,
    description: user.bio || `Check out ${user.name}'s profile.`,
  };
}

async function ProfilePageServer({ params }: { params: { username: string } }) {
  const user = await getProfileByUsername(params.username);
  const dbUserId = await getDbUserId();
  if (!user) notFound();

  const [posts, likedPosts, isCurrentUserFollowing, sharedTasks, tasks] = await Promise.all([
    getUserPosts(user.id),
    getUserLikedPosts(user.id),
    isFollowing(user.id),
    getUserSharedTasks(user.id),
    getUserTask(user.id),
  ]);

  return (
    <ProfilePageClient
      user={user}
      posts={posts}
      likedPosts={likedPosts}
      isFollowing={isCurrentUserFollowing}
      sharedTasks={sharedTasks}
      getDbUserId={dbUserId}
      tasks={tasks}
    />
  );
}
export default ProfilePageServer;
