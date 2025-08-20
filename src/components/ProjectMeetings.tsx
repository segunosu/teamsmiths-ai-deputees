import React, { useState, useEffect } from "react";
import { Plus, Calendar, ExternalLink, Clock, User, Copy, Video, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";

interface Meeting {
  id: string;
  title: string;
  provider: string;
  join_url: string;
  external_event_id?: string;
  starts_at?: string;
  ends_at?: string;
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

const ProjectMeetings = ({ projectId }: ProjectMeetingsProps) => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newMeetingTitle, setNewMeetingTitle] = useState("");
  const [newMeetingUrl, setNewMeetingUrl] = useState("");
  const [selectedProvider, setSelectedProvider] = useState<'google_meet' | 'jitsi' | 'manual'>('google_meet');
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [includeFireflies, setIncludeFireflies] = useState(false);
  const [isGoogleAuthorized, setIsGoogleAuthorized] = useState(false);
  const [googleAccessToken, setGoogleAccessToken] = useState<string | null>(null);
  const [firefliesSettings, setFirefliesSettings] = useState({
    enabled: false,
    botEmail: '',
    defaultOn: false
  });

  useEffect(() => {
    fetchMeetings();
    fetchFirefliesSettings();
    initializeGoogleAuth();
  }, [projectId]);

  const fetchFirefliesSettings = async () => {
    try {
      const { data: settings, error } = await supabase
        .from('admin_settings')
        .select('setting_key, setting_value')
        .in('setting_key', ['fireflies_enabled', 'fireflies_bot_email', 'fireflies_default_on']);

      if (error) {
        console.error('Error fetching Fireflies settings:', error);
        return;
      }

      const settingsMap = settings.reduce((acc, setting) => {
        acc[setting.setting_key] = setting.setting_value;
        return acc;
      }, {} as Record<string, any>);

      setFirefliesSettings({
        enabled: settingsMap.fireflies_enabled || false,
        botEmail: settingsMap.fireflies_bot_email || '',
        defaultOn: settingsMap.fireflies_default_on || false
      });

      setIncludeFireflies(settingsMap.fireflies_default_on || false);
    } catch (error) {
      console.error('Error fetching Fireflies settings:', error);
    }
  };

  const initializeGoogleAuth = () => {
    // Initialize Google OAuth (this would be expanded with actual Google OAuth flow)
    // For now, we'll simulate it
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get('access_token');
    
    if (accessToken) {
      setGoogleAccessToken(accessToken);
      setIsGoogleAuthorized(true);
    }
  };

  const fetchMeetings = async () => {
    try {
      const { data, error } = await supabase
        .from("meetings")
        .select(`
          *,
          profiles:organizer_user_id (
            full_name,
            email
          )
        `)
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setMeetings(data || []);
    } catch (error) {
      console.error("Error fetching meetings:", error);
      toast.error("Failed to load meetings");
    } finally {
      setLoading(false);
    }
  };

  const createMeeting = async () => {
    if (!newMeetingTitle.trim()) {
      toast.error("Please enter a meeting title");
      return;
    }

    if (selectedProvider === 'manual' && !newMeetingUrl.trim()) {
      toast.error("Please enter a meeting URL");
      return;
    }

    if (selectedProvider === 'google_meet' && (!startTime || !endTime)) {
      toast.error("Please select start and end times for Google Meet");
      return;
    }

    try {
      let result;

      if (selectedProvider === 'google_meet') {
        if (!isGoogleAuthorized || !googleAccessToken) {
          // For demo purposes, we'll create a Google Meet URL placeholder
          // In production, this would integrate with Google OAuth
          toast.info("Google OAuth integration would be implemented here in production");
          
          // Create a placeholder meeting for now
          const { data: meeting, error } = await supabase
            .from("meetings")
            .insert([
              {
                project_id: projectId,
                title: newMeetingTitle,
                join_url: `https://meet.google.com/placeholder-${Date.now()}`,
                provider: "google_meet",
                starts_at: startTime,
                ends_at: endTime,
                recording_consent: includeFireflies
              },
            ])
            .select()
            .single();

          if (error) throw error;
          result = { success: true, meeting };
        } else {
          const response = await supabase.functions.invoke('create-google-meet', {
            body: {
              projectId,
              title: newMeetingTitle,
              startTime,
              endTime,
              accessToken: googleAccessToken,
              includeFireflies
            }
          });

          if (response.error) throw response.error;
          result = response.data;
        }
      } else if (selectedProvider === 'jitsi') {
        const response = await supabase.functions.invoke('create-jitsi-meet', {
          body: {
            projectId,
            title: newMeetingTitle,
            includeFireflies
          }
        });

        if (response.error) throw response.error;
        result = response.data;
      } else {
        // Manual meeting
        const { data: meeting, error } = await supabase
          .from("meetings")
          .insert([
            {
              project_id: projectId,
              title: newMeetingTitle,
              join_url: newMeetingUrl,
              provider: "manual",
              recording_consent: includeFireflies
            },
          ])
          .select()
          .single();

        if (error) throw error;

        // Post a message to the project chat
        let chatMessage = `📅 Meeting created: "${newMeetingTitle}"\n🔗 Join: ${newMeetingUrl}`;
        if (includeFireflies && firefliesSettings.botEmail) {
          chatMessage += `\n\n📝 To record with Fireflies:\n1. Create a calendar invite with this meeting link\n2. Add ${firefliesSettings.botEmail} as an attendee`;
        }

        await supabase
          .from("project_chat_messages")
          .insert([
            {
              project_id: projectId,
              message: chatMessage,
              message_type: "system",
            },
          ]);

        result = { success: true, meeting };
      }

      if (result.success) {
        toast.success("Meeting created successfully!");
        
        // Reset form and close dialog
        setNewMeetingTitle("");
        setNewMeetingUrl("");
        setStartTime("");
        setEndTime("");
        setIsCreateDialogOpen(false);
        
        // Refresh meetings list
        fetchMeetings();
      }
    } catch (error) {
      console.error("Error creating meeting:", error);
      toast.error("Failed to create meeting");
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy text: ", err);
      toast.error("Failed to copy to clipboard");
    }
  };

  const shareProjectLink = async () => {
    // Get the most recent upcoming meeting
    const upcomingMeetings = meetings
      .filter(m => new Date(m.starts_at || new Date()) > new Date())
      .sort((a, b) => new Date(a.starts_at || 0).getTime() - new Date(b.starts_at || 0).getTime());

    if (upcomingMeetings.length > 0) {
      await copyToClipboard(upcomingMeetings[0].join_url);
    } else {
      // No upcoming meetings, prompt to create one
      toast.info("No upcoming meetings found. Create a meeting first!");
      setIsCreateDialogOpen(true);
    }
  };

  const getProviderBadge = (provider: string) => {
    switch (provider) {
      case "google_meet":
        return <Badge variant="secondary">Google Meet</Badge>;
      case "jitsi":
        return <Badge variant="secondary">Jitsi</Badge>;
      case "zoom":
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
            <Spinner />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Project Meetings</h3>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={shareProjectLink}
              >
                <Copy className="h-4 w-4 mr-2" />
                Share Link
              </Button>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Meeting
                        <ChevronDown className="h-4 w-4 ml-2" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem 
                        onClick={() => {
                          setSelectedProvider('google_meet');
                          setIsCreateDialogOpen(true);
                        }}
                      >
                        <Video className="h-4 w-4 mr-2" />
                        Create Google Meet (default)
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => {
                          setSelectedProvider('jitsi');
                          setIsCreateDialogOpen(true);
                        }}
                      >
                        <Video className="h-4 w-4 mr-2" />
                        Create Jitsi instant meeting (fallback)
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => {
                          setSelectedProvider('manual');
                          setIsCreateDialogOpen(true);
                        }}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Paste link (manual)
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>
                      Create {selectedProvider === 'google_meet' ? 'Google Meet' : 
                             selectedProvider === 'jitsi' ? 'Jitsi Meeting' : 'Manual Meeting'}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title">Meeting Title</Label>
                      <Input
                        id="title"
                        value={newMeetingTitle}
                        onChange={(e) => setNewMeetingTitle(e.target.value)}
                        placeholder="Enter meeting title"
                      />
                    </div>

                    {selectedProvider === 'manual' && (
                      <div>
                        <Label htmlFor="url">Meeting URL</Label>
                        <Input
                          id="url"
                          value={newMeetingUrl}
                          onChange={(e) => setNewMeetingUrl(e.target.value)}
                          placeholder="https://meet.example.com/room"
                        />
                      </div>
                    )}

                    {selectedProvider === 'google_meet' && (
                      <>
                        <div>
                          <Label htmlFor="startTime">Start Time</Label>
                          <Input
                            id="startTime"
                            type="datetime-local"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="endTime">End Time</Label>
                          <Input
                            id="endTime"
                            type="datetime-local"
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                          />
                        </div>
                      </>
                    )}

                    {selectedProvider === 'jitsi' && (
                      <div className="bg-yellow-50 p-3 rounded-lg text-sm">
                        <p className="font-medium">⚠️ Jitsi Notice:</p>
                        <p>Jitsi is provided by 8×8; public instance has no SLA.</p>
                        <p>For E2EE, use Chromium browsers and enable in meeting settings.</p>
                        <p className="mt-2">
                          <a href="https://jitsi.org/e2ee/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                            Learn more about E2EE
                          </a>
                        </p>
                      </div>
                    )}

                    {firefliesSettings.enabled && (
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="fireflies"
                          checked={includeFireflies}
                          onCheckedChange={setIncludeFireflies}
                        />
                        <Label htmlFor="fireflies">Invite Fireflies for recording</Label>
                      </div>
                    )}

                    {includeFireflies && (
                      <div className="bg-blue-50 p-3 rounded-lg text-sm">
                        <p className="font-medium">📝 Recording Consent:</p>
                        <p>By enabling Fireflies, you consent to meeting recording. All participants will be notified.</p>
                      </div>
                    )}

                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => setIsCreateDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button onClick={createMeeting}>
                        {selectedProvider === 'google_meet' ? 'Create Google Meet' :
                         selectedProvider === 'jitsi' ? 'Create Jitsi Meeting' : 'Create Meeting'}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {meetings.length === 0 ? (
            <div className="text-center py-8">
              <Video className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h4 className="text-lg font-medium mb-2">No meetings yet</h4>
              <p className="text-muted-foreground mb-4">
                Create your first meeting to collaborate with your team
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Meeting
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {meetings.map((meeting) => (
                <Card key={meeting.id} className="border-l-4 border-l-primary">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium">{meeting.title}</h4>
                          {getProviderBadge(meeting.provider)}
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <User className="h-4 w-4" />
                          <span>Organizer: {meeting.profiles?.full_name || meeting.organizer_user_id}</span>
                        </div>
                        {meeting.starts_at && (
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>{format(new Date(meeting.starts_at), "PPp")}</span>
                          </div>
                        )}
                        {meeting.recording_consent && (
                          <Badge variant="secondary" className="text-xs">
                            🎥 Recording enabled
                          </Badge>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(meeting.join_url)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button size="sm" asChild>
                          <a
                            href={meeting.join_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Join
                          </a>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectMeetings;