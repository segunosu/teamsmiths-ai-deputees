import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Send, MessageSquare, User, Bot } from 'lucide-react';
import { format } from 'date-fns';

interface ChatMessage {
  id: string;
  brief_id: string;
  sender_id: string;
  sender_role: 'client' | 'expert' | 'system';
  message: string;
  message_type: 'text' | 'file' | 'system';
  metadata?: any;
  flagged_for_review: boolean;
  created_at: string;
  sender_name?: string;
}

interface BriefChatProps {
  briefId: string;
  className?: string;
}

const BriefChat: React.FC<BriefChatProps> = ({ briefId, className = '' }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [userRole, setUserRole] = useState<'client' | 'expert' | null>(null);
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user && briefId) {
      checkUserRole();
      loadMessages();
      subscribeToMessages();
    }
  }, [user, briefId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const checkUserRole = async () => {
    try {
      const { data, error } = await supabase
        .from('brief_participants')
        .select('role')
        .eq('brief_id', briefId)
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;
      setUserRole(data.role as 'client' | 'expert');
    } catch (error) {
      console.error('Error checking user role:', error);
    }
  };

  const loadMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('brief_chat_messages')
        .select('*')
        .eq('brief_id', briefId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Get sender names separately
      const senderIds = [...new Set(data.map(msg => msg.sender_id))];
      const { data: senderProfiles } = await supabase
        .from('profiles')
        .select('user_id, full_name')
        .in('user_id', senderIds);

      const profileMap = new Map(senderProfiles?.map(p => [p.user_id, p.full_name]) || []);

      const messagesWithNames = data.map(msg => ({
        ...msg,
        sender_name: profileMap.get(msg.sender_id) || 'Unknown User',
        sender_role: msg.sender_role as 'client' | 'expert' | 'system',
        message_type: msg.message_type as 'text' | 'file' | 'system'
      }));

      setMessages(messagesWithNames);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast({
        title: "Error",
        description: "Failed to load chat messages",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const subscribeToMessages = () => {
    const subscription = supabase
      .channel('brief_chat_messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'brief_chat_messages',
          filter: `brief_id=eq.${briefId}`,
        },
        (payload) => {
          setMessages(prev => [...prev, {
            ...payload.new as ChatMessage,
            sender_name: 'New User' // Will be updated on next load
          }]);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !user || !userRole) return;

    setSending(true);
    
    // Simple AI moderation check
    const bannedWords = ['payment', 'paypal', 'venmo', 'bitcoin', 'crypto', 'wire transfer'];
    const containsBannedWords = bannedWords.some(word => 
      newMessage.toLowerCase().includes(word.toLowerCase())
    );

    try {
      const { error } = await supabase
        .from('brief_chat_messages')
        .insert({
          brief_id: briefId,
          sender_id: user.id,
          sender_role: userRole,
          message: newMessage.trim(),
          message_type: 'text',
          flagged_for_review: containsBannedWords
        });

      if (error) throw error;

      if (containsBannedWords) {
        toast({
          title: "Message Flagged",
          description: "Your message has been flagged for review due to potentially sensitive content.",
          variant: "destructive",
        });
      }

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getMessageIcon = (senderRole: string) => {
    switch (senderRole) {
      case 'system':
        return <Bot className="h-4 w-4" />;
      case 'expert':
        return <User className="h-4 w-4 text-blue-600" />;
      case 'client':
        return <User className="h-4 w-4 text-green-600" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  if (!user || !userRole) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Chat Unavailable</h3>
            <p className="text-muted-foreground">
              You need to be a participant in this brief to access chat.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Project Chat
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="flex flex-col h-96">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground text-sm">
                  No messages yet. Start the conversation!
                </p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.sender_id === user.id ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.sender_id !== user.id && (
                    <div className="flex-shrink-0">
                      {getMessageIcon(message.sender_role)}
                    </div>
                  )}
                  
                  <div
                    className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${
                      message.sender_id === user.id
                        ? 'bg-primary text-primary-foreground'
                        : message.sender_role === 'system'
                        ? 'bg-muted text-muted-foreground border'
                        : 'bg-muted'
                    }`}
                  >
                    {message.sender_id !== user.id && message.sender_role !== 'system' && (
                      <p className="text-xs font-medium mb-1 opacity-70">
                        {message.sender_name}
                      </p>
                    )}
                    <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                    <p className={`text-xs mt-1 opacity-60 ${
                      message.sender_id === user.id ? 'text-right' : 'text-left'
                    }`}>
                      {format(new Date(message.created_at), 'HH:mm')}
                    </p>
                    {message.flagged_for_review && (
                      <p className="text-xs text-yellow-600 mt-1">⚠ Flagged for review</p>
                    )}
                  </div>
                  
                  {message.sender_id === user.id && (
                    <div className="flex-shrink-0">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="border-t p-4">
            <div className="flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                disabled={sending}
                className="flex-1"
              />
              <Button
                onClick={sendMessage}
                disabled={!newMessage.trim() || sending}
                size="sm"
              >
                {sending ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Messages are monitored for quality assurance. Avoid sharing payment details here.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BriefChat;