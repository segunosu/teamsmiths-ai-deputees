import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar, Clock, Users, Video, Shield, Info } from 'lucide-react';

interface MeetingSchedulerProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  attendees: Array<{ id: string; name: string; role: string }>;
  onSchedule: (payload: {
    title: string;
    startTime: string;
    endTime: string;
    attendees: string[];
    recordingConsent?: boolean;
  }) => Promise<{ meetingId: string; meetLink: string }>;
}

export const MeetingScheduler: React.FC<MeetingSchedulerProps> = ({
  isOpen,
  onClose,
  projectId,
  attendees,
  onSchedule
}) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [selectedAttendees, setSelectedAttendees] = useState<string[]>(
    attendees.map(a => a.id)
  );
  const [enableRecording, setEnableRecording] = useState(false);
  const [showConsentDialog, setShowConsentDialog] = useState(false);
  const [consentGiven, setConsentGiven] = useState<Record<string, boolean>>({});
  const [isScheduling, setIsScheduling] = useState(false);

  const handleSchedule = async () => {
    if (!title.trim() || !date || !startTime || !endTime) {
      return;
    }

    if (enableRecording && !allConsentsGiven()) {
      setShowConsentDialog(true);
      return;
    }

    setIsScheduling(true);
    try {
      const startDateTime = `${date}T${startTime}`;
      const endDateTime = `${date}T${endTime}`;
      
      await onSchedule({
        title,
        startTime: startDateTime,
        endTime: endDateTime,
        attendees: selectedAttendees,
        recordingConsent: enableRecording
      });
      
      // Reset form
      setTitle('');
      setDate('');
      setStartTime('');
      setEndTime('');
      setEnableRecording(false);
      setConsentGiven({});
      
      onClose();
    } catch (error) {
      console.error('Failed to schedule meeting:', error);
    } finally {
      setIsScheduling(false);
    }
  };

  const toggleAttendee = (attendeeId: string) => {
    setSelectedAttendees(prev => 
      prev.includes(attendeeId) 
        ? prev.filter(id => id !== attendeeId)
        : [...prev, attendeeId]
    );
  };

  const allConsentsGiven = () => {
    return selectedAttendees.every(id => consentGiven[id] === true);
  };

  const handleConsentChange = (attendeeId: string, consent: boolean) => {
    setConsentGiven(prev => ({
      ...prev,
      [attendeeId]: consent
    }));
  };

  const getMinDateTime = () => {
    const now = new Date();
    now.setHours(now.getHours() + 1); // Minimum 1 hour from now
    return now.toISOString().slice(0, 16);
  };

  return (
    <>
      <Dialog open={isOpen && !showConsentDialog} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Schedule Project Meeting
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Meeting Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="meeting-title">Meeting Title</Label>
                <Input
                  id="meeting-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Project Kickoff, Design Review"
                />
              </div>

              <div>
                <Label htmlFor="meeting-date">Date</Label>
                <Input
                  id="meeting-date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="start-time">Start Time</Label>
                  <Input
                    id="start-time"
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="end-time">End Time</Label>
                  <Input
                    id="end-time"
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Attendees */}
            <div>
              <Label className="text-base font-medium">Attendees</Label>
              <div className="space-y-2 mt-2">
                {attendees.map((attendee) => (
                  <div
                    key={attendee.id}
                    className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedAttendees.includes(attendee.id)
                        ? 'border-primary bg-primary/5'
                        : 'border-border'
                    }`}
                    onClick={() => toggleAttendee(attendee.id)}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedAttendees.includes(attendee.id)}
                        onChange={() => toggleAttendee(attendee.id)}
                        className="rounded"
                      />
                      <div>
                        <p className="font-medium">{attendee.name}</p>
                        <Badge variant="secondary" className="text-xs">
                          {attendee.role}
                        </Badge>
                      </div>
                    </div>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </div>
                ))}
              </div>
            </div>

            {/* Recording & Transcription */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base font-medium">Record & Transcribe Meeting</Label>
                  <p className="text-sm text-muted-foreground">
                    Meeting will be recorded and transcribed for project notes
                  </p>
                </div>
                <Switch
                  checked={enableRecording}
                  onCheckedChange={setEnableRecording}
                />
              </div>

              {enableRecording && (
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <p className="font-medium">Recording Consent Required</p>
                      <p className="text-sm">
                        All participants must consent to recording before the meeting can be scheduled.
                        Consent can be revoked at any time during the meeting.
                      </p>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {/* Meeting Provider Info */}
            <Alert>
              <Video className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  <p className="font-medium">Google Meet Integration</p>
                  <p className="text-sm">
                    A Google Meet link will be generated and shared with all attendees.
                    Calendar invites will be sent automatically.
                  </p>
                </div>
              </AlertDescription>
            </Alert>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSchedule}
              disabled={
                isScheduling || 
                !title.trim() || 
                !date || 
                !startTime || 
                !endTime ||
                selectedAttendees.length === 0
              }
            >
              <Calendar className="h-4 w-4 mr-2" />
              {isScheduling ? 'Scheduling...' : 'Schedule Meeting'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Recording Consent Dialog */}
      <Dialog open={showConsentDialog} onOpenChange={setShowConsentDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Recording Consent Required
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Please obtain consent from all attendees before scheduling a recorded meeting:
            </p>

            <div className="space-y-3">
              {attendees
                .filter(a => selectedAttendees.includes(a.id))
                .map((attendee) => (
                  <div key={attendee.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{attendee.name}</p>
                      <Badge variant="secondary" className="text-xs">
                        {attendee.role}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant={consentGiven[attendee.id] === true ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleConsentChange(attendee.id, true)}
                      >
                        Consent
                      </Button>
                      <Button
                        variant={consentGiven[attendee.id] === false ? 'destructive' : 'outline'}
                        size="sm"
                        onClick={() => handleConsentChange(attendee.id, false)}
                      >
                        Decline
                      </Button>
                    </div>
                  </div>
                ))}
            </div>

            {!allConsentsGiven() && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  All attendees must provide consent to enable recording.
                </AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConsentDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                setShowConsentDialog(false);
                handleSchedule();
              }}
              disabled={!allConsentsGiven()}
            >
              Continue with Schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};