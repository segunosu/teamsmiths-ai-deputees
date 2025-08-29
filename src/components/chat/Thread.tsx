import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Send, 
  Paperclip, 
  Edit, 
  Pin, 
  ThumbsUp, 
  Eye,
  EyeOff,
  Users,
  MessageCircle
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'expert' | 'system';
  senderId: string;
  senderRole?: string;
  timestamp: string;
  attachments?: Array<{
    id: string;
    filename: string;
    url: string;
    type: string;
  }>;
  editHistory?: Array<{
    content: string;
    timestamp: string;
  }>;
  isEdited?: boolean;
  readBy?: string[];
  isPinned?: boolean;
  upvotes?: string[];
  visibility?: 'public' | 'expert_only';
  parentId?: string;
}

interface ThreadProps {
  sessionId: string;
  messages: ChatMessage[];
  currentUserId: string;
  currentUserRole: 'client' | 'expert' | 'admin';
  anonymityMode: boolean;
  onSendMessage: (content: string, attachments?: File[], parentId?: string) => Promise<void>;
  onEditMessage: (messageId: string, newContent: string) => Promise<void>;
  onPinMessage: (messageId: string) => Promise<void>;
  onUpvoteMessage: (messageId: string) => Promise<void>;
  onRequestReveal: () => Promise<void>;
}

export const Thread: React.FC<ThreadProps> = ({
  sessionId,
  messages,
  currentUserId,
  currentUserRole,
  anonymityMode,
  onSendMessage,
  onEditMessage,
  onPinMessage,
  onUpvoteMessage,
  onRequestReveal
}) => {
  const [newMessage, setNewMessage] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [visibility, setVisibility] = useState<'public' | 'expert_only'>('public');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() && attachments.length === 0) return;

    try {
      await onSendMessage(newMessage, attachments, replyingTo || undefined);
      setNewMessage('');
      setAttachments([]);
      setReplyingTo(null);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleEdit = async (messageId: string) => {
    if (!editContent.trim()) return;

    try {
      await onEditMessage(messageId, editContent);
      setEditingId(null);
      setEditContent('');
    } catch (error) {
      console.error('Failed to edit message:', error);
    }
  };

  const handleFileAttach = (files: FileList | null) => {
    if (!files) return;
    setAttachments(prev => [...prev, ...Array.from(files)]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const startEditing = (message: ChatMessage) => {
    setEditingId(message.id);
    setEditContent(message.content);
  };

  const getDisplayName = (message: ChatMessage) => {
    if (!anonymityMode) {
      return message.senderRole || 'User';
    }

    // Anonymized display
    if (message.role === 'expert') {
      return 'Expert';
    } else if (message.role === 'user') {
      return 'Client';
    }
    return 'System';
  };

  const getAvatarInitials = (message: ChatMessage) => {
    const name = getDisplayName(message);
    return name.charAt(0).toUpperCase();
  };

  const isOwnMessage = (message: ChatMessage) => {
    return message.senderId === currentUserId;
  };

  const canEdit = (message: ChatMessage) => {
    return isOwnMessage(message) && message.role !== 'system';
  };

  const getMessageThread = (parentId?: string): ChatMessage[] => {
    if (!parentId) return [];
    return messages.filter(m => m.parentId === parentId);
  };

  const topLevelMessages = messages.filter(m => !m.parentId);

  return (
    <div className="flex flex-col h-full max-h-[600px]">
      {/* Header */}
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Project Chat
          </CardTitle>
          <div className="flex items-center gap-2">
            {anonymityMode && (
              <Button variant="outline" size="sm" onClick={onRequestReveal}>
                <EyeOff className="h-4 w-4 mr-2" />
                Request identity reveal
              </Button>
            )}
            <Badge variant={anonymityMode ? 'secondary' : 'default'}>
              {anonymityMode ? 'Anonymous mode' : 'Revealed'}
            </Badge>
          </div>
        </div>
      </CardHeader>

      {/* Messages */}
      <CardContent className="flex-1 overflow-y-auto space-y-4 pb-4">
        {topLevelMessages.map((message) => (
          <div key={message.id} className="space-y-2">
            {/* Main Message */}
            <div className={`flex gap-3 ${isOwnMessage(message) ? 'flex-row-reverse' : ''}`}>
              <Avatar className="w-8 h-8">
                <AvatarFallback>{getAvatarInitials(message)}</AvatarFallback>
              </Avatar>
              
              <div className={`flex-1 max-w-[80%] ${isOwnMessage(message) ? 'text-right' : ''}`}>
                {/* Message Header */}
                <div className={`flex items-center gap-2 mb-1 ${isOwnMessage(message) ? 'flex-row-reverse' : ''}`}>
                  <span className="text-sm font-medium">
                    {getDisplayName(message)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
                  </span>
                  {message.isEdited && (
                    <Badge variant="outline" className="text-xs">
                      Edited
                    </Badge>
                  )}
                  {message.isPinned && (
                    <Pin className="h-3 w-3 text-primary" />
                  )}
                  {message.visibility === 'expert_only' && (
                    <Badge variant="secondary" className="text-xs">
                      Expert only
                    </Badge>
                  )}
                </div>

                {/* Message Content */}
                <div className={`rounded-lg p-3 ${
                  isOwnMessage(message) 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted'
                }`}>
                  {editingId === message.id ? (
                    <div className="space-y-2">
                      <Textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="text-sm"
                        rows={3}
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleEdit(message.id)}>
                          Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  )}

                  {/* Attachments */}
                  {message.attachments && message.attachments.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {message.attachments.map((attachment) => (
                        <a
                          key={attachment.id}
                          href={attachment.url}
                          className="block text-xs underline opacity-90 hover:opacity-100"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          📎 {attachment.filename}
                        </a>
                      ))}
                    </div>
                  )}
                </div>

                {/* Message Actions */}
                <div className={`flex items-center gap-1 mt-1 ${isOwnMessage(message) ? 'justify-end' : ''}`}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onUpvoteMessage(message.id)}
                    className={`h-6 px-2 ${
                      message.upvotes?.includes(currentUserId) ? 'text-primary' : ''
                    }`}
                  >
                    <ThumbsUp className="h-3 w-3 mr-1" />
                    {message.upvotes?.length || 0}
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setReplyingTo(message.id)}
                    className="h-6 px-2"
                  >
                    Reply
                  </Button>

                  {canEdit(message) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => startEditing(message)}
                      className="h-6 px-2"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                  )}

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onPinMessage(message.id)}
                    className="h-6 px-2"
                  >
                    <Pin className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Replies */}
            {getMessageThread(message.id).map((reply) => (
              <div key={reply.id} className={`flex gap-3 ml-8 ${isOwnMessage(reply) ? 'flex-row-reverse' : ''}`}>
                <Avatar className="w-6 h-6">
                  <AvatarFallback className="text-xs">{getAvatarInitials(reply)}</AvatarFallback>
                </Avatar>
                
                <div className={`flex-1 max-w-[70%] ${isOwnMessage(reply) ? 'text-right' : ''}`}>
                  <div className={`flex items-center gap-2 mb-1 ${isOwnMessage(reply) ? 'flex-row-reverse' : ''}`}>
                    <span className="text-xs font-medium">
                      {getDisplayName(reply)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(reply.timestamp), { addSuffix: true })}
                    </span>
                  </div>
                  
                  <div className={`rounded-lg p-2 ${
                    isOwnMessage(reply) 
                      ? 'bg-primary/80 text-primary-foreground' 
                      : 'bg-muted/80'
                  }`}>
                    <p className="text-xs">{reply.content}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </CardContent>

      {/* Reply Indicator */}
      {replyingTo && (
        <div className="px-4 py-2 bg-muted/50 border-t">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Replying to {getDisplayName(messages.find(m => m.id === replyingTo)!)}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setReplyingTo(null)}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 border-t space-y-3">
        {/* Visibility Toggle for Experts */}
        {currentUserRole === 'expert' && (
          <div className="flex items-center gap-2">
            <Button
              variant={visibility === 'public' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setVisibility('public')}
            >
              <Eye className="h-3 w-3 mr-1" />
              Public
            </Button>
            <Button
              variant={visibility === 'expert_only' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setVisibility('expert_only')}
            >
              <Users className="h-3 w-3 mr-1" />
              Expert only
            </Button>
          </div>
        )}

        {/* Attachments */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {attachments.map((file, index) => (
              <Badge key={index} variant="secondary" className="pr-1">
                {file.name}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 ml-2"
                  onClick={() => removeAttachment(index)}
                >
                  ×
                </Button>
              </Badge>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="flex gap-2">
          <div className="flex-1">
            <Textarea
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              rows={2}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            <Button onClick={handleSend} disabled={!newMessage.trim() && attachments.length === 0}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => handleFileAttach(e.target.files)}
          multiple
          hidden
          accept="image/*,.pdf,.doc,.docx"
        />
      </div>
    </div>
  );
};