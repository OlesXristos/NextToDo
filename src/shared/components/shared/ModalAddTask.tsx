'use client';
import { Button } from '@/shared/components/ui/button';
import { Checkbox } from '@/shared/components/ui/checkbox';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/components/ui/dialog';
import { useState } from 'react';
import { useUser } from '@clerk/nextjs';

import { Card, CardContent } from '../ui/card';
import { Avatar, AvatarImage } from '../ui/avatar';
import { Textarea } from '../ui/textarea';
import { CirclePlus, ImageIcon, Loader2Icon, SendIcon } from 'lucide-react';

import toast from 'react-hot-toast';
import ImageUpload from './ImageUpload';
import { createTask } from '@/action/task.action';
import { createSharedTask } from '@/action/sharedTask.action';

export function ModalAddTask() {
  const [open, setOpen] = useState(false);
  const { user } = useUser();
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [isPublick, setIsPublic] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim() && !imageUrl) return;

    setIsPosting(true);
    try {
      const result = isPublick
        ? await createSharedTask(content, imageUrl)
        : await createTask(content, imageUrl);
      if (result?.success) {
        // reset the form
        setContent('');
        setImageUrl('');
        setShowImageUpload(false);
        setOpen(false);
        toast.success('Post created successfully');
      }
    } catch (error) {
      console.error('Failed to create post:', error);
      toast.error('Failed to create post');
    } finally {
      setIsPosting(false);
    }
  };
  return (
    <div className="mb-5">
      <Dialog
        open={open}
        onOpenChange={(state) => {
          setOpen(state);
          if (!state) {
            setIsPublic(false); // скидання прапорця при закритті
          }
        }}>
        <DialogTrigger asChild>
          <Button className="flex items-center gap-2">
            <CirclePlus />
            <span className="hidden sm:inline">Додати задачу</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle className="text-center font-black text-2xl ">
              Що у тебе на думці?
            </DialogTitle>
            <DialogDescription className="text-center">
              Детально опишіть свою ціль, задля кращого розуміння
            </DialogDescription>
          </DialogHeader>
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="space-y-4 ">
                <div className="flex space-x-4 ">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={user?.imageUrl || '/avatar.png'} />
                  </Avatar>
                  <Textarea
                    placeholder="Make up your mind !"
                    className="min-h-[100px] resize-none border-none focus-visible:ring-0 p-0 text-base"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    disabled={isPosting}
                  />
                </div>

                {(showImageUpload || imageUrl) && (
                  <div className="border rounded-lg  ">
                    <ImageUpload
                      endpoint="postImage"
                      value={imageUrl}
                      onChange={(url) => {
                        setImageUrl(url);
                        if (!url) setShowImageUpload(false);
                      }}
                    />
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    disabled={(!content.trim() && !imageUrl) || isPosting}
                    onClick={() => setIsPublic((prev) => !prev)}
                    id="terms"
                  />
                  <label
                    htmlFor="terms"
                    className="  leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Share
                  </label>
                </div>
                <div className="flex items-center justify-between border-t pt-4">
                  <div className="flex space-x-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-primary"
                      onClick={() => setShowImageUpload(!showImageUpload)}
                      disabled={isPosting}>
                      <ImageIcon className="size-4 mr-1" />
                      Photo
                    </Button>
                  </div>

                  <Button
                    className="flex items-center"
                    onClick={handleSubmit}
                    disabled={(!content.trim() && !imageUrl) || isPosting}>
                    {isPosting ? (
                      <>
                        <Loader2Icon className="size-4 mr-2 animate-spin" />
                        Posting...
                      </>
                    ) : (
                      <>
                        {isPublick ? (
                          <>
                            <SendIcon className="size-4 mr-2" />
                            Share
                          </>
                        ) : (
                          <>
                            <SendIcon className="size-4 mr-2" />
                            Add
                          </>
                        )}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </DialogContent>
      </Dialog>
    </div>
  );
}
