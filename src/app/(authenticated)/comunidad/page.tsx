'use client';

import { useEffect, useState, useRef } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { PostCard, CommentsSheet } from '@/components/community';
import { Avatar, Textarea } from '@/components/ui';
import { Bell, Image, Send, MessageSquare, HelpCircle, Lightbulb, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Post, PostType } from '@/types';

const filterOptions = [
  { value: 'all', label: 'Todo' },
  { value: 'experience', label: 'Experiencias' },
  { value: 'question', label: 'Preguntas' },
  { value: 'advice', label: 'Consejos' },
];

const postTypeOptions: { value: PostType; label: string; icon: typeof MessageSquare }[] = [
  { value: 'experience', label: 'Experiencia', icon: MessageSquare },
  { value: 'question', label: 'Pregunta', icon: HelpCircle },
  { value: 'advice', label: 'Consejo', icon: Lightbulb },
];

export default function ComunidadPage() {
  const { token, parent } = useAuthStore();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [newContent, setNewContent] = useState('');
  const [newPostType, setNewPostType] = useState<PostType>('experience');
  const [isPosting, setIsPosting] = useState(false);
  const [showTypeSelect, setShowTypeSelect] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [showCommentsSheet, setShowCommentsSheet] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchPosts();
  }, [token, filter]);

  async function fetchPosts() {
    if (!token) return;

    try {
      const params = new URLSearchParams();
      if (filter !== 'all') params.set('type', filter);

      const response = await fetch(`/api/posts?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  }

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('La imagen es muy grande (máximo 10MB)');
        return;
      }
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  }

  function clearImage() {
    setSelectedImage(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  async function handleCreatePost() {
    if (!token || !newContent.trim()) return;

    setIsPosting(true);
    try {
      let imageUrl: string | null = null;

      // Upload image if selected
      if (selectedImage) {
        const formData = new FormData();
        formData.append('file', selectedImage);
        formData.append('folder', 'posts');

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });

        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          imageUrl = uploadData.url;
        }
      }

      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newContent,
          postType: newPostType,
          imageUrl,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setPosts([data.post, ...posts]);
        setNewContent('');
        clearImage();
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsPosting(false);
    }
  }

  async function handleDeletePost(postId: string) {
    if (!token) return;

    // Confirm deletion
    if (!confirm('¿Estás seguro de que deseas eliminar esta publicación?')) {
      return;
    }

    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setPosts(posts.filter((p) => p.id !== postId));
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }

  async function handleReaction(postId: string) {
    if (!token) return;

    // Optimistic update
    setPosts(posts.map((p) =>
      p.id === postId
        ? {
            ...p,
            hasReacted: !p.hasReacted,
            reactionCount: p.hasReacted ? p.reactionCount - 1 : p.reactionCount + 1,
          }
        : p
    ));

    try {
      await fetch(`/api/posts/${postId}/reactions`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      console.error('Error:', error);
      fetchPosts();
    }
  }

  function handleComment(postId: string) {
    setSelectedPostId(postId);
    setShowCommentsSheet(true);
  }

  function handleCommentAdded() {
    // Update local comment count
    if (selectedPostId) {
      setPosts(posts.map((p) =>
        p.id === selectedPostId
          ? { ...p, commentCount: p.commentCount + 1 }
          : p
      ));
    }
  }

  return (
    <div className="min-h-screen bg-background-light">
      {/* Header */}
      <header className="gradient-header h-48 pt-8 px-6">
        <div className="flex items-center justify-between">
          <h1 className="text-white text-3xl font-bold">Comunidad</h1>
          <button className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
            <Bell size={20} />
          </button>
        </div>
      </header>

      {/* Create Post Card */}
      <div className="px-4 -mt-10 relative z-10">
        <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100">
          <div className="flex items-start gap-3">
            <Avatar
              src={parent?.avatarUrl}
              firstName={parent?.firstName || ''}
              lastName={parent?.lastName || ''}
              size="md"
            />
            <div className="flex-1">
              <Textarea
                placeholder="¿Qué tienes en mente?"
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                rows={2}
                className="min-h-[60px]"
              />
              {/* Image Preview */}
              {imagePreview && (
                <div className="relative mt-3 rounded-lg overflow-hidden">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-40 object-cover"
                  />
                  <button
                    onClick={clearImage}
                    className="absolute top-2 right-2 p-1.5 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleImageSelect}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  'p-2 rounded-lg hover:bg-gray-100 transition-colors',
                  selectedImage ? 'text-primary bg-primary/10' : 'text-primary'
                )}
              >
                <Image size={20} />
              </button>
              <div className="relative">
                <button
                  onClick={() => setShowTypeSelect(!showTypeSelect)}
                  className="px-3 py-1.5 rounded-lg bg-gray-100 text-sm font-medium text-gray-700 flex items-center gap-2"
                >
                  {postTypeOptions.find((o) => o.value === newPostType)?.label}
                </button>
                {showTypeSelect && (
                  <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border py-1 z-20">
                    {postTypeOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setNewPostType(option.value);
                          setShowTypeSelect(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                      >
                        <option.icon size={16} />
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={handleCreatePost}
              disabled={!newContent.trim() || isPosting}
              className={cn(
                'px-4 py-2 rounded-lg font-semibold text-sm flex items-center gap-2 transition-all',
                newContent.trim() && !isPosting
                  ? 'gradient-primary text-white'
                  : 'bg-gray-100 text-gray-400'
              )}
            >
              {isPosting ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send size={16} />
              )}
              Publicar
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mt-6 px-4">
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2">
          {filterOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setFilter(option.value)}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all',
                filter === option.value
                  ? 'gradient-primary text-white'
                  : 'bg-white text-gray-700 border border-gray-200'
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Posts */}
      <div className="p-4 space-y-4 pb-24">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-11 h-11 rounded-full bg-gray-200" />
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
                    <div className="h-3 bg-gray-200 rounded w-1/4" />
                  </div>
                </div>
                <div className="h-20 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No hay publicaciones todavía</p>
            <p className="text-gray-400 text-sm mt-1">Sé el primero en compartir</p>
          </div>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              currentUserId={parent?.id}
              onReaction={handleReaction}
              onComment={handleComment}
              onDelete={handleDeletePost}
            />
          ))
        )}
      </div>

      {/* Comments Sheet */}
      {selectedPostId && (
        <CommentsSheet
          postId={selectedPostId}
          isOpen={showCommentsSheet}
          onClose={() => {
            setShowCommentsSheet(false);
            setSelectedPostId(null);
          }}
          onCommentAdded={handleCommentAdded}
        />
      )}
    </div>
  );
}
