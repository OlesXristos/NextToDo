'use client';

import {
  getProfileByUsername,
  getUserPosts,
  getUserSharedTasks,
  getUserTask,
  updateProfile,
} from '@/action/profile.action';
import { getDbUserId, toggleFollow } from '@/action/user.action';

import { Avatar, AvatarImage } from '@/shared/components/ui/avatar';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Separator } from '@/shared/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Textarea } from '@/shared/components/ui/textarea';
import { SignInButton, useUser } from '@clerk/nextjs';
import { format } from 'date-fns';
import {
  CalendarIcon,
  EditIcon,
  FileTextIcon,
  HeartIcon,
  LinkIcon,
  MapPinIcon,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';

import Link from 'next/link';
import TaskCard from './TaskCard';
import PostCard from './PostCard';

type User = Awaited<ReturnType<typeof getProfileByUsername>>;
type Posts = Awaited<ReturnType<typeof getUserPosts>>;
type SharedTasks = Awaited<ReturnType<typeof getUserSharedTasks>>;
type Tasks = Awaited<ReturnType<typeof getUserTask>>;
interface ProfilePageClientProps {
  user: NonNullable<User>;
  posts: Posts;
  likedPosts: Posts;
  isFollowing: boolean;
  sharedTasks: SharedTasks;
  tasks: Tasks;
  getDbUserId: string | null;
}

function ProfilePageClient({
  isFollowing: initialIsFollowing,
  likedPosts,
  posts,
  user,
  sharedTasks,
  getDbUserId,
  tasks,
}: ProfilePageClientProps) {
  const { user: currentUser } = useUser();

  const [showEditDialog, setShowEditDialog] = useState(false);
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isUpdatingFollow, setIsUpdatingFollow] = useState(false);

  const [activeTab, setActiveTab] = useState('posts');
  const tabsListRef = useRef<HTMLDivElement>(null);

  const [editForm, setEditForm] = useState({
    name: user.name || '',
    bio: user.bio || '',
    location: user.location || '',
    website: user.website || '',
  });

  const handleEditSubmit = async () => {
    const formData = new FormData();
    Object.entries(editForm).forEach(([key, value]) => {
      formData.append(key, value);
    });

    const result = await updateProfile(formData);
    if (result.success) {
      setShowEditDialog(false);
      toast.success('Profile updated successfully');
    }
  };

  const handleFollow = async () => {
    if (!currentUser) return;

    try {
      setIsUpdatingFollow(true);
      await toggleFollow(user.id);
      setIsFollowing(!isFollowing);
    } catch (error) {
      toast.error('Failed to update follow status');
    } finally {
      setIsUpdatingFollow(false);
    }
  };

  const isOwnProfile =
    currentUser?.username === user.username ||
    currentUser?.emailAddresses[0].emailAddress.split('@')[0] === user.username;

  const formattedDate = format(new Date(user.createdAt), 'MMMM yyyy');
  useEffect(() => {
    const tabsList = tabsListRef.current;
    if (!tabsList) return;

    const activeTrigger = tabsList.querySelector(`[data-state="active"]`);
    if (activeTrigger && tabsList) {
      const triggerRect = activeTrigger.getBoundingClientRect();
      const containerRect = tabsList.getBoundingClientRect();

      const offset =
        triggerRect.left - containerRect.left - containerRect.width / 2 + triggerRect.width / 2;

      tabsList.scrollBy({
        left: offset,
        behavior: 'smooth',
      });
    }
  }, [activeTab]);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="grid grid-cols-1 gap-6">
        <div className="w-full max-w-lg mx-auto">
          <Card className="bg-card">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={user.image ?? '/avatar.png'} />
                </Avatar>
                <h1 className="mt-4 text-2xl font-bold">{user.name ?? user.username}</h1>
                <p className="text-muted-foreground">@{user.username}</p>
                <p className="mt-2 text-sm">{user.bio}</p>

                {/* PROFILE STATS */}
                <div className="w-full mt-6 ">
                  <div className="flex justify-between mb-4">
                    <div>
                      <Link href={`/profile/${user.username}/following`}>
                        <div className="font-semibold">
                          {user._count.following.toLocaleString()}
                        </div>
                        <div className="text-sm text-muted-foreground">Following</div>
                      </Link>
                    </div>
                    <Separator orientation="vertical" />
                    <div>
                      <Link href={`/profile/${user.username}/followers`}>
                        <div className="font-semibold">
                          {user._count.followers.toLocaleString()}
                        </div>
                        <div className="text-sm text-muted-foreground">Followers</div>
                      </Link>
                    </div>
                    <Separator orientation="vertical" />
                    <div>
                      <div className="font-semibold">{user._count.posts.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">Posts</div>
                    </div>
                  </div>
                </div>

                {/* "FOLLOW & EDIT PROFILE" BUTTONS */}
                {!currentUser ? (
                  <SignInButton mode="modal">
                    <Button className="w-full mt-4">Follow</Button>
                  </SignInButton>
                ) : isOwnProfile ? (
                  <Button className="w-full mt-4" onClick={() => setShowEditDialog(true)}>
                    <EditIcon className="size-4 mr-2" />
                    Edit Profile
                  </Button>
                ) : (
                  <Button
                    className="w-full mt-4"
                    onClick={handleFollow}
                    disabled={isUpdatingFollow}
                    variant={isFollowing ? 'outline' : 'default'}>
                    {isFollowing ? 'Unfollow' : 'Follow'}
                  </Button>
                )}

                {/* LOCATION & WEBSITE */}
                <div className="w-full mt-6 space-y-2 text-sm">
                  {user.location && (
                    <div className="flex items-center text-muted-foreground">
                      <MapPinIcon className="size-4 mr-2" />
                      {user.location}
                    </div>
                  )}
                  {user.website && (
                    <div className="flex items-center text-muted-foreground">
                      <LinkIcon className="size-4 mr-2" />
                      <a
                        href={
                          user.website.startsWith('http') ? user.website : `https://${user.website}`
                        }
                        className="hover:underline"
                        target="_blank"
                        rel="noopener noreferrer">
                        {user.website}
                      </a>
                    </div>
                  )}
                  <div className="flex items-center text-muted-foreground">
                    <CalendarIcon className="size-4 mr-2" />
                    Joined {formattedDate}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs
          defaultValue="posts"
          className="w-full mb-20 relative"
          value={activeTab}
          onValueChange={(val) => {
            setActiveTab(val);
          }}>
          <TabsList
            ref={tabsListRef}
            className="w-full sticky top-[105px] backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10 overflow-x-auto justify-between border-b rounded h-auto p-0 bg-transparent">
            <TabsTrigger
              value="posts"
              className="flex items-center gap-2 rounded data-[state=active]:border-b-2 data-[state=active]:border-primary
               data-[state=active]:bg-transparent px-6 font-semibold">
              <FileTextIcon className="size-4" />
              Posts
            </TabsTrigger>
            {isOwnProfile && (
              <TabsTrigger
                value="tasks"
                className="flex items-center gap-2 rounded data-[state=active]:border-b-2 data-[state=active]:border-primary
              data-[state=active]:bg-transparent px-6 font-semibold">
                <FileTextIcon className="size-4" />
                Tasks
              </TabsTrigger>
            )}
            <TabsTrigger
              value="sharedTasks"
              className="flex items-center gap-2 rounded data-[state=active]:border-b-2 data-[state=active]:border-primary
               data-[state=active]:bg-transparent px-6 font-semibold">
              <FileTextIcon className="size-4" />
              Shared Tasks
            </TabsTrigger>

            <TabsTrigger
              value="likes"
              className="flex items-center gap-2 rounded data-[state=active]:border-b-2 data-[state=active]:border-primary
               data-[state=active]:bg-transparent px-6 font-semibold">
              <HeartIcon className="size-4" />
              Likes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="mt-6 ">
            <div className="space-y-6">
              {posts.length > 0 ? (
                posts.map((post) => <PostCard key={post.id} post={post} dbUserId={getDbUserId} />)
              ) : (
                <div className="text-center py-8 text-muted-foreground">No posts yet</div>
              )}
            </div>
          </TabsContent>
          <TabsContent value="tasks" className="mt-6 ">
            <div className="space-y-6">
              {tasks.length > 0 ? (
                tasks.map((task) => (
                  <TaskCard key={task.id} task={{ ...task, type: 'task' }} dbUserId={getDbUserId} />
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">No posts yet</div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="sharedTasks" className="mt-6 ">
            <div className="space-y-6">
              {sharedTasks.length > 0 ? (
                sharedTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={{ ...task, type: 'sharedTask' }}
                    dbUserId={getDbUserId}
                  />
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">No posts yet</div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="likes" className="mt-6">
            <div className="space-y-6">
              {likedPosts.length > 0 ? (
                likedPosts.map((post) => <PostCard key={post.id} post={post} dbUserId={user.id} />)
              ) : (
                <div className="text-center py-8 text-muted-foreground">No liked posts to show</div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit Profile</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  name="name"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  placeholder="Your name"
                />
              </div>
              <div className="space-y-2">
                <Label>Bio</Label>
                <Textarea
                  name="bio"
                  value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  className="min-h-[100px]"
                  placeholder="Tell us about yourself"
                />
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Input
                  name="location"
                  value={editForm.location}
                  onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                  placeholder="Where are you based?"
                />
              </div>
              <div className="space-y-2">
                <Label>Website</Label>
                <Input
                  name="website"
                  value={editForm.website}
                  onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                  placeholder="Your personal website"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={handleEditSubmit}>Save Changes</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
export default ProfilePageClient;
