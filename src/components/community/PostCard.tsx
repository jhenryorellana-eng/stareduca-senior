'use client';

import { useState } from 'react';
import { Avatar } from '@/components/ui';
import { Heart, MessageCircle, Lightbulb, HelpCircle, MessageSquare, MoreHorizontal, Trash2 } from 'lucide-react';
import { formatRelativeTime, cn } from '@/lib/utils';
import type { Post } from '@/types';

interface PostCardProps {
  post: Post;
  currentUserId?: string;
  onReaction: (postId: string) => void;
  onComment: (postId: string) => void;
  onDelete?: (postId: string) => void;
}

const postTypeConfig = {
  experience: {
    label: 'Experiencia',
    icon: MessageSquare,
    bgColor: 'bg-emerald-50',
    textColor: 'text-emerald-700',
    iconColor: 'text-emerald-600',
  },
  question: {
    label: 'Pregunta',
    icon: HelpCircle,
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    iconColor: 'text-blue-600',
  },
  advice: {
    label: 'Consejo',
    icon: Lightbulb,
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-700',
    iconColor: 'text-amber-600',
  },
};

export function PostCard({ post, currentUserId, onReaction, onComment, onDelete }: PostCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const config = postTypeConfig[post.postType] || postTypeConfig.experience;
  const TypeIcon = config.icon;
  const isOwner = currentUserId && post.author?.id === currentUserId;

  const handleDelete = () => {
    setShowMenu(false);
    if (onDelete) {
      onDelete(post.id);
    }
  };

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-50">
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <Avatar
          src={post.author?.avatarUrl}
          firstName={post.author?.firstName || 'Usuario'}
          lastName={post.author?.lastName || ''}
          size="md"
        />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <p className="font-bold text-gray-900">
              {post.author?.firstName || 'Usuario'} {post.author?.lastName || 'Eliminado'}
            </p>
            <div className="flex items-center gap-2">
              <span className={cn(
                'px-2 py-1 rounded-full text-[10px] font-semibold flex items-center gap-1',
                config.bgColor,
                config.textColor
              )}>
                <TypeIcon className={cn('w-3 h-3', config.iconColor)} />
                {config.label}
              </span>
              {isOwner && (
                <div className="relative">
                  <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="p-1 rounded-full hover:bg-gray-100 text-gray-400 transition-colors"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                  {showMenu && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setShowMenu(false)}
                      />
                      <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border py-1 z-20 min-w-[120px]">
                        <button
                          onClick={handleDelete}
                          className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          Eliminar
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
          <p className="text-xs text-gray-400">{formatRelativeTime(post.createdAt)}</p>
        </div>
      </div>

      {/* Content */}
      <p className="text-gray-700 text-base leading-relaxed mb-4 line-clamp-3">
        {post.content}
      </p>

      {/* Image */}
      {post.imageUrl && (
        <div className="rounded-xl overflow-hidden mb-4">
          <img
            src={post.imageUrl}
            alt="Post image"
            className="w-full h-48 object-cover"
          />
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-4 pt-3 border-t border-gray-100">
        <button
          onClick={() => onReaction(post.id)}
          className={cn(
            'flex items-center gap-2 text-sm transition-colors',
            post.hasReacted ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
          )}
        >
          <Heart className={cn('w-5 h-5', post.hasReacted && 'fill-current')} />
          <span className="font-medium">{post.reactionCount}</span>
        </button>
        <button
          onClick={() => onComment(post.id)}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-primary transition-colors"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="font-medium">{post.commentCount}</span>
        </button>
      </div>
    </div>
  );
}
