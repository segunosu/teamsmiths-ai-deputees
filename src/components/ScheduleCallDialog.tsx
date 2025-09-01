import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Video, Calendar } from 'lucide-react';

interface ScheduleCallDialogProps {
  briefId: string;
  expertUserId: string;
  expertName: string;
  trigger?: React.ReactNode;
}

const ScheduleCallDialog: React.FC<ScheduleCallDialogProps> = ({ 
  briefId, 
  expertUserId, 
  expertName,
  trigger 
}) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(`Intro Call with ${expertName}`);
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [recordingConsent, setRecordingConsent] = useState(false);
  const [scheduling, setScheduling] = useState(false);
  const { toast } = useToast();

  const scheduleCall = async () => {
    if (!date || !startTime || !endTime) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setScheduling(true);

    try {
      const startDateTime = new Date(`${date}T${startTime}`).toISOString();
      const endDateTime = new Date(`${date}T${endTime}`).toISOString();

      const { data, error } = await supabase.functions.invoke('schedule-intro-call', {
        body: {
          briefId,
          expertUserId,
          title,
          startTime: startDateTime,
          endTime: endDateTime,
          attendees: [expertUserId], // Will be expanded to include current user in function
          recordingConsent
        }
      });

      if (error) throw error;

      toast({
        title: "Call Scheduled!",
        description: `Your intro call with ${expertName} has been scheduled.`,
      });

      setOpen(false);
      
      // Reset form
      setTitle(`Intro Call with ${expertName}`);
      setDate('');
      setStartTime('');
      setEndTime('');
      setRecordingConsent(false);

    } catch (error) {
      console.error('Error scheduling call:', error);
      toast({
        title: "Error",
        description: "Failed to schedule call. Please try again.",
        variant: "destructive",
      });
    } finally {
      setScheduling(false);
    }
  };

  // Set default date to tomorrow
  React.useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setDate(tomorrow.toISOString().split('T')[0]);
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="gap-2">
            <Video className="h-4 w-4" />
            Schedule Call
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Schedule Intro Call
          </DialogTitle>
          <DialogDescription>
            Schedule a Google Meet call with {expertName} to discuss your project.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Title
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="col-span-3"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="date" className="text-right">
              Date
            </Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="col-span-3"
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="start-time" className="text-right">
              Start Time
            </Label>
            <Input
              id="start-time"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="col-span-3"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="end-time" className="text-right">
              End Time
            </Label>
            <Input
              id="end-time"
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="col-span-3"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="recording"
              checked={recordingConsent}
              onCheckedChange={setRecordingConsent}
            />
            <Label htmlFor="recording" className="text-sm">
              Allow meeting recording (optional)
            </Label>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={scheduleCall} disabled={scheduling}>
            {scheduling ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Scheduling...
              </>
            ) : (
              <>
                <Video className="h-4 w-4 mr-2" />
                Schedule Call
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ScheduleCallDialog;