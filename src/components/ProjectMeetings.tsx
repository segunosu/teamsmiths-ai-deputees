import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { VideoIcon, Calendar, ExternalLink, Plus, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface Meeting {
  id: string;
  title: string;
  provider: string;
  join_url: string;
  starts_at: string | null;
  ends_at: string | null;
  recording_consent: boolean;
  created_at: string;
  organizer_user_id: string;
  profiles?: {
    full_name: string;
    email: string;
  };
}

interface ProjectMeetingsProps {
  projectId: string;
}

const ProjectMeetings: React.FC<ProjectMeetingsProps> = ({ projectId }) => {
  const { user } = useAuth();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    join_url: '',
    starts_at: '',
    ends_at: '',
    recording_consent: false,
    invite_fireflies: false,
  });

  useEffect(() => {
    fetchMeetings();
  }, [projectId]);

  const fetchMeetings = async () => {
    try {
      const { data, error } = await supabase
        .from('meetings')
        .select(`
          *,
          profiles:organizer_user_id (
            full_name,
            email
          )
        `)
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMeetings(data || []);
    } catch (error) {
      console.error('Error fetching meetings:', error);
      toast.error('Failed to load meetings');
    } finally {
      setLoading(false);
    }
  };

  const createManualMeeting = async () => {
    if (!formData.title.trim() || !formData.join_url.trim()) {
      toast.error('Please fill in the required fields');
      return;
    }

    try {
      // Create meeting record
      const { data: meeting, error: meetingError } = await supabase
        .from('meetings')
        .insert({
          project_id: projectId,
          title: formData.title,
          provider: 'manual',
          join_url: formData.join_url,
          starts_at: formData.starts_at || null,
          ends_at: formData.ends_at || null,
          recording_consent: formData.recording_consent,
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
          message: `📅 Meeting created: "${formData.title}"\n🔗 Join: ${formData.join_url}${
            formData.starts_at ? `\n⏰ Starts: ${new Date(formData.starts_at).toLocaleString()}` : ''
          }${
            formData.recording_consent ? '\n🎥 Recording consent obtained' : ''
          }`,
        });

      if (messageError) console.error('Error posting chat message:', messageError);

      // Show Fireflies consent if enabled
      if (formData.recording_consent && formData.invite_fireflies) {
        const { error: consentError } = await supabase
          .from('project_messages')
          .insert({
            project_id: projectId,
            user_id: user?.id,
            message: '🤖 Recording requires consent. Participants are notified.',
          });

        if (consentError) console.error('Error posting consent message:', consentError);
      }

      toast.success('Meeting created successfully');
      setShowCreateDialog(false);
      setFormData({
        title: '',
        join_url: '',
        starts_at: '',
        ends_at: '',
        recording_consent: false,
        invite_fireflies: false,
      });
      fetchMeetings();
    } catch (error) {
      console.error('Error creating meeting:', error);
      toast.error('Failed to create meeting');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Link copied to clipboard');
  };

  const getProviderBadge = (provider: string) => {
    switch (provider) {
      case 'google_meet':
        return <Badge variant="secondary">Google Meet</Badge>;
      case 'zoom':
        return <Badge variant="secondary">Zoom</Badge>;
      default:
        return <Badge variant="outline">Manual</Badge>;
    }
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Meetings</h2>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Meeting
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create Meeting</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Meeting Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Project Kickoff"
                />
              </div>

              <div>
                <Label htmlFor="join_url">Meeting Link *</Label>
                <Input
                  id="join_url"
                  value={formData.join_url}
                  onChange={(e) => setFormData({ ...formData, join_url: e.target.value })}
                  placeholder="https://meet.google.com/..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="starts_at">Start Time (Optional)</Label>
                  <Input
                    id="starts_at"
                    type="datetime-local"
                    value={formData.starts_at}
                    onChange={(e) => setFormData({ ...formData, starts_at: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="ends_at">End Time (Optional)</Label>
                  <Input
                    id="ends_at"
                    type="datetime-local"
                    value={formData.ends_at}
                    onChange={(e) => setFormData({ ...formData, ends_at: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="recording_consent"
                  checked={formData.recording_consent}
                  onCheckedChange={(checked) => setFormData({ ...formData, recording_consent: checked })}
                />
                <Label htmlFor="recording_consent">Recording consent obtained</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="invite_fireflies"
                  checked={formData.invite_fireflies}
                  onCheckedChange={(checked) => setFormData({ ...formData, invite_fireflies: checked })}
                />
                <Label htmlFor="invite_fireflies">Invite Fireflies for recording</Label>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={createManualMeeting} className="flex-1">
                  Create Meeting
                </Button>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {meetings.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <VideoIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No meetings yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first meeting to get started
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Meeting
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {meetings.map((meeting) => (
            <Card key={meeting.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{meeting.title}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      {getProviderBadge(meeting.provider)}
                      <span className="text-sm text-muted-foreground">
                        by {meeting.profiles?.full_name || 'Unknown'}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(meeting.created_at), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(meeting.join_url)}
                    >
                      Copy Link
                    </Button>
                    <Button size="sm" asChild>
                      <a href={meeting.join_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Join
                      </a>
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {meeting.starts_at && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {new Date(meeting.starts_at).toLocaleString()} 
                        {meeting.ends_at && ` - ${new Date(meeting.ends_at).toLocaleString()}`}
                      </span>
                    </div>
                  )}
                  {meeting.recording_consent && (
                    <div className="flex items-center gap-2 text-sm text-amber-600">
                      <VideoIcon className="h-4 w-4" />
                      <span>Recording consent obtained</span>
                    </div>
                  )}
                </div>
                <div className="mt-4 pt-4 border-t">
                  <Button variant="outline" size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Transcript
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectMeetings;