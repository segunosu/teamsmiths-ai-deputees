import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { MessageSquare, Send, VideoIcon, Link } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface Message {
  id: string;
  message: string;
  user_id: string;
  created_at: string;
  profiles?: {
    full_name: string;
    email: string;
  };
}

interface ProjectChatProps {
  projectId: string;
}

const ProjectChat: React.FC<ProjectChatProps> = ({ projectId }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showCreateMeetingDialog, setShowCreateMeetingDialog] = useState(false);
  const [meetingFormData, setMeetingFormData] = useState({
    title: '',
    join_url: '',
    starts_at: '',
    ends_at: '',
    recording_consent: false,
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMessages();
    subscribeToMessages();
    return () => {
      supabase.removeAllChannels();
    };
  }, [projectId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('project_messages')
        .select(`
          *,
          profiles:user_id (
            full_name,
            email
          )
        `)
        .eq('project_id', projectId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const subscribeToMessages = () => {
    const channel = supabase
      .channel(`project-messages-${projectId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'project_messages',
          filter: `project_id=eq.${projectId}`,
        },
        async (payload) => {
          // Fetch the complete message with profile data
          const { data } = await supabase
            .from('project_messages')
            .select(`
              *,
              profiles:user_id (
                full_name,
                email
              )
            `)
            .eq('id', payload.new.id)
            .single();

          if (data) {
            setMessages(prev => [...prev, data]);
          }
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const { error } = await supabase
        .from('project_messages')
        .insert({
          project_id: projectId,
          user_id: user?.id,
          message: newMessage.trim(),
        });

      if (error) throw error;
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const createMeeting = async () => {
    if (!meetingFormData.title.trim() || !meetingFormData.join_url.trim()) {
      toast.error('Please fill in the required fields');
      return;
    }

    try {
      // Create meeting record
      const { data: meeting, error: meetingError } = await supabase
        .from('meetings')
        .insert({
          project_id: projectId,
          title: meetingFormData.title,
          provider: 'manual',
          join_url: meetingFormData.join_url,
          starts_at: meetingFormData.starts_at || null,
          ends_at: meetingFormData.ends_at || null,
          recording_consent: meetingFormData.recording_consent,
          organizer_user_id: user?.id,
        })
        .select()
        .single();

      if (meetingError) throw meetingError;

      // Post message to chat
      const { error: messageError } = await supabase
        .from('project_messages')
        .insert({
          project_id: projectId,
          user_id: user?.id,
          message: `📅 Meeting created: "${meetingFormData.title}"\n🔗 Join: ${meetingFormData.join_url}${
            meetingFormData.starts_at ? `\n⏰ Starts: ${new Date(meetingFormData.starts_at).toLocaleString()}` : ''
          }${
            meetingFormData.recording_consent ? '\n🎥 Recording consent obtained' : ''
          }`,
        });

      if (messageError) console.error('Error posting chat message:', messageError);

      toast.success('Meeting created successfully');
      setShowCreateMeetingDialog(false);
      setMeetingFormData({
        title: '',
        join_url: '',
        starts_at: '',
        ends_at: '',
        recording_consent: false,
      });
    } catch (error) {
      console.error('Error creating meeting:', error);
      toast.error('Failed to create meeting');
    }
  };

  const copyProjectLink = () => {
    const projectUrl = `${window.location.origin}/project/${projectId}`;
    navigator.clipboard.writeText(projectUrl);
    toast.success('Project link copied to clipboard');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <MessageSquare className="h-5 w-5" />
            Project Chat
          </CardTitle>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowCreateMeetingDialog(true)}
            >
              <VideoIcon className="h-4 w-4 mr-2" />
              Create Meeting
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={copyProjectLink}
            >
              <Link className="h-4 w-4 mr-2" />
              Share Link
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.user_id === user?.id ? 'flex-row-reverse' : ''
                }`}
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">
                    {getInitials(message.profiles?.full_name || 'U')}
                  </AvatarFallback>
                </Avatar>
                <div
                  className={`flex-1 max-w-[70%] ${
                    message.user_id === user?.id ? 'text-right' : ''
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium">
                      {message.profiles?.full_name || 'Unknown User'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(message.created_at), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                  <div
                    className={`rounded-lg px-3 py-2 ${
                      message.user_id === user?.id
                        ? 'bg-primary text-primary-foreground ml-auto'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">
                      {message.message}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="border-t p-4">
          <div className="flex gap-2">
            <Textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message... (Enter to send, Shift+Enter for new line)"
              className="min-h-[40px] max-h-[120px] resize-none"
              disabled={sending}
            />
            <Button
              onClick={sendMessage}
              disabled={!newMessage.trim() || sending}
              size="sm"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>

      {/* Meeting Creation Dialog */}
      <Dialog open={showCreateMeetingDialog} onOpenChange={setShowCreateMeetingDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create Meeting</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="meeting-title">Meeting Title *</Label>
              <Input
                id="meeting-title"
                value={meetingFormData.title}
                onChange={(e) => setMeetingFormData({ ...meetingFormData, title: e.target.value })}
                placeholder="e.g., Project Kickoff"
              />
            </div>

            <div>
              <Label htmlFor="meeting-url">Meeting Link *</Label>
              <Input
                id="meeting-url"
                value={meetingFormData.join_url}
                onChange={(e) => setMeetingFormData({ ...meetingFormData, join_url: e.target.value })}
                placeholder="https://meet.google.com/..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="meeting-start">Start Time (Optional)</Label>
                <Input
                  id="meeting-start"
                  type="datetime-local"
                  value={meetingFormData.starts_at}
                  onChange={(e) => setMeetingFormData({ ...meetingFormData, starts_at: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="meeting-end">End Time (Optional)</Label>
                <Input
                  id="meeting-end"
                  type="datetime-local"
                  value={meetingFormData.ends_at}
                  onChange={(e) => setMeetingFormData({ ...meetingFormData, ends_at: e.target.value })}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="meeting-recording"
                checked={meetingFormData.recording_consent}
                onCheckedChange={(checked) => setMeetingFormData({ ...meetingFormData, recording_consent: checked })}
              />
              <Label htmlFor="meeting-recording">Recording consent obtained</Label>
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={createMeeting} className="flex-1">
                Create Meeting
              </Button>
              <Button variant="outline" onClick={() => setShowCreateMeetingDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default ProjectChat;