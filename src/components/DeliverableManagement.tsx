import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Upload, Download, Eye, CheckCircle, XCircle, Clock, FileText, Plus } from 'lucide-react';

interface ProjectDeliverable {
  id: string;
  title: string;
  description: string;
  due_date: string;
  status: string;
  submitted_at: string | null;
  approved_at: string | null;
  rejection_reason: string | null;
  project_id: string;
  milestone_id: string | null;
  deliverable_files: DeliverableFile[];
}

interface DeliverableFile {
  id: string;
  file_name: string;
  file_size: number;
  file_type: string;
  storage_path: string;
  version_number: number;
  uploaded_at: string;
  uploaded_by: string;
  notes: string | null;
}

interface DeliverableManagementProps {
  projectId: string;
  userRole: 'client' | 'freelancer' | 'admin';
}

const DeliverableManagement: React.FC<DeliverableManagementProps> = ({ projectId, userRole }) => {
  const { user } = useAuth();
  const [deliverables, setDeliverables] = useState<ProjectDeliverable[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingFiles, setUploadingFiles] = useState<Record<string, boolean>>({});
  const [newDeliverable, setNewDeliverable] = useState({
    title: '',
    description: '',
    due_date: ''
  });
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  useEffect(() => {
    loadDeliverables();
  }, [projectId]);

  const loadDeliverables = async () => {
    try {
      const { data, error } = await supabase
        .from('project_deliverables')
        .select(`
          *,
          deliverable_files (*)
        `)
        .eq('project_id', projectId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      setDeliverables(data || []);
    } catch (error) {
      console.error('Error loading deliverables:', error);
      toast.error('Failed to load deliverables');
    } finally {
      setLoading(false);
    }
  };

  const createDeliverable = async () => {
    if (!newDeliverable.title.trim()) {
      toast.error('Please enter a deliverable title');
      return;
    }

    try {
      const { error } = await supabase
        .from('project_deliverables')
        .insert({
          project_id: projectId,
          title: newDeliverable.title,
          description: newDeliverable.description,
          due_date: newDeliverable.due_date || null
        });

      if (error) throw error;

      toast.success('Deliverable created successfully');
      setNewDeliverable({ title: '', description: '', due_date: '' });
      setShowCreateDialog(false);
      await loadDeliverables();
    } catch (error) {
      console.error('Error creating deliverable:', error);
      toast.error('Failed to create deliverable');
    }
  };

  const uploadFile = async (deliverableId: string, file: File) => {
    setUploadingFiles(prev => ({ ...prev, [deliverableId]: true }));

    try {
      // Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${deliverableId}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('project-files')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Create file record
      const { error: dbError } = await supabase
        .from('deliverable_files')
        .insert({
          deliverable_id: deliverableId,
          file_name: file.name,
          file_size: file.size,
          file_type: file.type,
          storage_path: fileName,
          uploaded_by: user?.id,
          version_number: 1 // TODO: Calculate next version number
        });

      if (dbError) throw dbError;

      // Update deliverable status to submitted if it was pending
      const deliverable = deliverables.find(d => d.id === deliverableId);
      if (deliverable?.status === 'pending' || deliverable?.status === 'in_progress') {
        await supabase
          .from('project_deliverables')
          .update({
            status: 'submitted',
            submitted_at: new Date().toISOString()
          })
          .eq('id', deliverableId);

        // Create notification for client
        const { data: projectData } = await supabase
          .from('projects')
          .select('project_participants(user_id, role)')
          .eq('id', projectId);

        const clientParticipants = projectData?.[0]?.project_participants?.filter(p => p.role === 'client') || [];
        
        for (const participant of clientParticipants) {
          await supabase.rpc('create_notification', {
            p_user_id: participant.user_id,
            p_type: 'deliverable_submitted',
            p_title: 'New Deliverable Submitted',
            p_message: `A new deliverable "${deliverable.title}" has been submitted for review.`,
            p_related_id: deliverableId
          });
        }
      }

      toast.success('File uploaded successfully');
      await loadDeliverables();
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload file');
    } finally {
      setUploadingFiles(prev => ({ ...prev, [deliverableId]: false }));
    }
  };

  const approveDeliverable = async (deliverableId: string) => {
    try {
      const { error } = await supabase
        .from('project_deliverables')
        .update({
          status: 'approved',
          approved_at: new Date().toISOString(),
          approved_by: user?.id
        })
        .eq('id', deliverableId);

      if (error) throw error;

      // Create notification for freelancer
      const { data: projectData } = await supabase
        .from('projects')
        .select('project_participants(user_id, role)')
        .eq('id', projectId);

      const freelancerParticipants = projectData?.[0]?.project_participants?.filter(p => p.role === 'freelancer') || [];
      
      for (const participant of freelancerParticipants) {
        await supabase.rpc('create_notification', {
          p_user_id: participant.user_id,
          p_type: 'deliverable_approved',
          p_title: 'Deliverable Approved',
          p_message: `Your deliverable has been approved by the client.`,
          p_related_id: deliverableId
        });
      }

      toast.success('Deliverable approved');
      await loadDeliverables();
    } catch (error) {
      console.error('Error approving deliverable:', error);
      toast.error('Failed to approve deliverable');
    }
  };

  const requestRevision = async (deliverableId: string, reason: string) => {
    try {
      const { error } = await supabase
        .from('project_deliverables')
        .update({
          status: 'revision_requested',
          rejection_reason: reason
        })
        .eq('id', deliverableId);

      if (error) throw error;

      // Create notification for freelancer
      const { data: projectData } = await supabase
        .from('projects')
        .select('project_participants(user_id, role)')
        .eq('id', projectId);

      const freelancerParticipants = projectData?.[0]?.project_participants?.filter(p => p.role === 'freelancer') || [];
      
      for (const participant of freelancerParticipants) {
        await supabase.rpc('create_notification', {
          p_user_id: participant.user_id,
          p_type: 'deliverable_rejected',
          p_title: 'Revision Requested',
          p_message: `Revision requested for your deliverable: ${reason}`,
          p_related_id: deliverableId
        });
      }

      toast.success('Revision requested');
      await loadDeliverables();
    } catch (error) {
      console.error('Error requesting revision:', error);
      toast.error('Failed to request revision');
    }
  };

  const downloadFile = async (file: DeliverableFile) => {
    try {
      const { data, error } = await supabase.storage
        .from('project-files')
        .download(file.storage_path);

      if (error) throw error;

      // Create download link
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.file_name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error('Failed to download file');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-success text-success-foreground';
      case 'submitted':
        return 'bg-warning text-warning-foreground';
      case 'revision_requested':
        return 'bg-destructive text-destructive-foreground';
      case 'in_progress':
        return 'bg-primary text-primary-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4" />;
      case 'submitted':
        return <Clock className="h-4 w-4" />;
      case 'revision_requested':
        return <XCircle className="h-4 w-4" />;
      case 'in_progress':
        return <Upload className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const calculateProgress = () => {
    if (deliverables.length === 0) return 0;
    const approvedCount = deliverables.filter(d => d.status === 'approved').length;
    return Math.round((approvedCount / deliverables.length) * 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Deliverables</h2>
          <p className="text-muted-foreground">Manage project deliverables and submissions</p>
        </div>
        {(userRole === 'freelancer' || userRole === 'admin') && (
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Deliverable
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Deliverable</DialogTitle>
                <DialogDescription>
                  Add a new deliverable to this project
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={newDeliverable.title}
                    onChange={(e) => setNewDeliverable(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter deliverable title"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newDeliverable.description}
                    onChange={(e) => setNewDeliverable(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe the deliverable"
                  />
                </div>
                <div>
                  <Label htmlFor="due_date">Due Date (Optional)</Label>
                  <Input
                    id="due_date"
                    type="date"
                    value={newDeliverable.due_date}
                    onChange={(e) => setNewDeliverable(prev => ({ ...prev, due_date: e.target.value }))}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={createDeliverable}>Create</Button>
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Project Progress</CardTitle>
          <CardDescription>
            {deliverables.filter(d => d.status === 'approved').length} of {deliverables.length} deliverables approved
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={calculateProgress()} className="w-full" />
        </CardContent>
      </Card>

      {/* Deliverables List */}
      <div className="space-y-4">
        {deliverables.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">No deliverables yet</p>
            </CardContent>
          </Card>
        ) : (
          deliverables.map((deliverable) => (
            <Card key={deliverable.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{deliverable.title}</CardTitle>
                    {deliverable.description && (
                      <CardDescription className="mt-1">
                        {deliverable.description}
                      </CardDescription>
                    )}
                  </div>
                  <Badge className={getStatusColor(deliverable.status)}>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(deliverable.status)}
                      {deliverable.status.replace('_', ' ')}
                    </div>
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Due Date */}
                {deliverable.due_date && (
                  <div className="text-sm text-muted-foreground">
                    Due: {new Date(deliverable.due_date).toLocaleDateString()}
                  </div>
                )}

                {/* Revision Reason */}
                {deliverable.rejection_reason && (
                  <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <p className="text-sm font-medium text-destructive">Revision Required:</p>
                    <p className="text-sm text-destructive-foreground mt-1">
                      {deliverable.rejection_reason}
                    </p>
                  </div>
                )}

                {/* Files */}
                {deliverable.deliverable_files.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Files ({deliverable.deliverable_files.length})</h4>
                    <div className="space-y-2">
                      {deliverable.deliverable_files.map((file) => (
                        <div key={file.id} className="flex items-center justify-between p-2 border rounded">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            <div>
                              <p className="text-sm font-medium">{file.file_name}</p>
                              <p className="text-xs text-muted-foreground">
                                v{file.version_number} • {(file.file_size / 1024).toFixed(1)} KB • 
                                {new Date(file.uploaded_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => downloadFile(file)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-2 border-t">
                  {/* Upload for freelancers */}
                  {(userRole === 'freelancer' || userRole === 'admin') && 
                   ['pending', 'in_progress', 'revision_requested'].includes(deliverable.status) && (
                    <div>
                      <Input
                        type="file"
                        id={`file-${deliverable.id}`}
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) uploadFile(deliverable.id, file);
                        }}
                      />
                      <Label
                        htmlFor={`file-${deliverable.id}`}
                        className="cursor-pointer"
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={uploadingFiles[deliverable.id]}
                          asChild
                        >
                          <span>
                            <Upload className="h-4 w-4 mr-2" />
                            {uploadingFiles[deliverable.id] ? 'Uploading...' : 'Upload File'}
                          </span>
                        </Button>
                      </Label>
                    </div>
                  )}

                  {/* Approval actions for clients */}
                  {userRole === 'client' && deliverable.status === 'submitted' && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => approveDeliverable(deliverable.id)}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const reason = prompt('Please enter revision requirements:');
                          if (reason) requestRevision(deliverable.id, reason);
                        }}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Request Revision
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default DeliverableManagement;