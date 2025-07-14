import { getUserFollowers, getUserFollowing } from '@/action/profile.action';
import { getProfileByUsername } from '@/action/profile.action';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import FollowButton from '@/shared/components/shared/FollowButton';
import { Avatar, AvatarImage } from '@/shared/components/ui/avatar';
import { FileTextIcon } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }: { params: { username: string } }) {
  const user = await getProfileByUsername(params.username);
  if (!user) return;

  return {
    title: `${user.name ?? user.username} — Followers`,
    description: `See who follows ${user.username}`,
  };
}

export default async function FollowersPage({ params }: { params: { username: string } }) {
  const user = await getProfileByUsername(params.username);
  if (!user) notFound();

  const following = await getUserFollowing(user.id);
  if (!following) notFound();
  return (
    <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 relative ">
      <div className="lg:col-span-10 ">
        <Tabs defaultValue="following" className=" w-full grid grid-cols-1 ">
          <TabsList className="w-full  sticky top-[105px]  overflow-auto justify-start border-b rounded h-auto p-0  backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10">
            <TabsTrigger
              value="following"
              className="flex items-center gap-2 rounded data-[state=active]:border-b-2 data-[state=active]:border-primary
             data-[state=active]:bg-transparent px-6 font-semibold w-full">
              <FileTextIcon className="size-4" />
              Following
            </TabsTrigger>
            <Link href={`/profile/${user.username}/followers`}>
              <TabsTrigger
                value="followers"
                className="flex  items-center gap-2 rounded data-[state=active]:border-b-2 data-[state=active]:border-primary
            data-[state=active]:bg-transparent px-6 font-semibold w-full">
                <FileTextIcon className="size-4" />
                Followers
              </TabsTrigger>
            </Link>
          </TabsList>

          <div className="min-h-screen">
            <TabsContent value="following" className="mt-6 ">
              <div className="space-y-6">
                {following.length > 0 ? (
                  following.map((user) => (
                    <div
                      key={user.following.id}
                      className="flex gap-2 items-center justify-between ">
                      <div className="flex items-center gap-1">
                        <Link href={`/profile/${user.following.username}`}>
                          <Avatar>
                            <AvatarImage src={user.following.image ?? '/avatar.png'} />
                          </Avatar>
                        </Link>
                        <div className="text-xs">
                          <Link
                            href={`/profile/${user.following.username}`}
                            className="font-medium cursor-pointer">
                            {user.following.name}
                          </Link>
                          <p className="text-muted-foreground">@{user.following.username}</p>
                        </div>
                      </div>
                      <FollowButton userId={user.following.id} />
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">No following yet</div>
                )}
              </div>
            </TabsContent>
            <TabsContent value="sharedTasks" className="mt-6"></TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
