-- Create trigger to auto-queue nurture emails when scorecard is submitted
CREATE TRIGGER trigger_queue_scorecard_nurture_emails
  AFTER INSERT ON public.scorecard_responses
  FOR EACH ROW
  EXECUTE FUNCTION public.queue_scorecard_nurture_emails();