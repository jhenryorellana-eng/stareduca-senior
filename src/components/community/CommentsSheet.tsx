'use client';

import { useEffect, useState, useRef } from 'react';
import { X, Send } from 'lucide-react';
import { Avatar, Textarea } from '@/components/ui';
import { useAuthStore } from '@/stores/auth-store';
import { formatRelativeTime, cn } from '@/lib/utils';
import type { Comment } from '@/types';

interface CommentsSheetProps {
  postId: string;
  isOpen: boolean;
  onClose: () => void;
  onCommentAdded: () => void;
}

export function CommentsSheet({ postId, isOpen, onClose, onCommentAdded }: CommentsSheetProps) {
  const { token, parent } = useAuthStore();
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const commentsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && postId) {
      fetchComments();
    }
  }, [isOpen, postId]);

  async function fetchComments() {
    if (!token) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setComments(data.comments);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit() {
    if (!token || !newComment.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newComment }),
      });

      if (response.ok) {
        const data = await response.json();
        setComments([...comments, data.comment]);
        setNewComment('');
        onCommentAdded();

        // Scroll to new comment
        setTimeout(() => {
          commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    } catch (error) {
      console.error('Error posting comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[80vh] flex flex-col animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <h2 className="font-bold text-lg text-gray-900">
            Comentarios {comments.length > 0 && `(${comments.length})`}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto px-4 py-3">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3 animate-pulse">
                  <div className="w-9 h-9 rounded-full bg-gray-200" />
                  <div className="flex-1">
                    <div className="h-3 bg-gray-200 rounded w-1/3 mb-2" />
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Sin comentarios aun</p>
              <p className="text-gray-400 text-sm mt-1">Se el primero en comentar</p>
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <Avatar
                    src={comment.author.avatarUrl}
                    firstName={comment.author.firstName}
                    lastName={comment.author.lastName}
                    size="sm"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-gray-900">
                        {comment.author.firstName} {comment.author.lastName}
                      </span>
                      <span className="text-xs text-gray-400">
                        {formatRelativeTime(comment.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mt-0.5">{comment.content}</p>
                  </div>
                </div>
              ))}
              <div ref={commentsEndRef} />
            </div>
          )}
        </div>

        {/* New Comment Input */}
        <div className="border-t border-gray-100 px-4 py-3 pb-20 bg-white">
          <div className="flex items-start gap-3">
            <Avatar
              src={parent?.avatarUrl}
              firstName={parent?.firstName || ''}
              lastName={parent?.lastName || ''}
              size="sm"
            />
            <div className="flex-1 flex gap-2">
              <Textarea
                placeholder="Escribe un comentario..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={1}
                className="min-h-[40px] resize-none"
              />
              <button
                onClick={handleSubmit}
                disabled={!newComment.trim() || isSubmitting}
                className={cn(
                  'p-2 rounded-lg self-end transition-all',
                  newComment.trim() && !isSubmitting
                    ? 'gradient-primary text-white'
                    : 'bg-gray-100 text-gray-400'
                )}
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send size={20} />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
