import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, XCircle, Clock, ExternalLink, User } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface CertificationWithProfile {
  id: string;
  cert_code: string;
  status: 'declared' | 'verified' | 'pending';
  evidence_url: string | null;
  issued_at: string | null;
  user_id: string;
  created_at: string;
  academy_certifications?: {
    title: string;
    tool_slug: string | null;
  } | null;
  profiles?: {
    full_name: string;
    email: string;
  } | null;
}

export default function CertificationManager() {
  const [certifications, setCertifications] = useState<CertificationWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [notifyByEmail, setNotifyByEmail] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchCertifications();
  }, []);

  const fetchCertifications = async () => {
    try {
      const { data, error } = await supabase
        .from('freelancer_certifications')
        .select(`
          *,
          academy_certifications(title, tool_slug),
          profiles:user_id(full_name, email)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCertifications((data || []) as unknown as CertificationWithProfile[]);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to fetch certifications',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (cert: CertificationWithProfile) => {
    try {
      const { error } = await supabase
        .from('freelancer_certifications')
        .update({
          status: 'verified',
          issued_at: new Date().toISOString()
        })
        .eq('id', cert.id);

      if (error) throw error;

      // Log admin action
      await supabase.functions.invoke('audit-admin-action', {
        body: {
          entity: 'freelancer_certifications',
          action: 'verify',
          entity_id: cert.id,
          meta: { status: 'verified' }
        }
      });

      // Create in-app notification
      await supabase.rpc('create_notification', {
        p_user_id: cert.user_id,
        p_type: 'certification_update',
        p_title: 'Certification verified',
        p_message: `Your certification ${cert.academy_certifications?.title || cert.cert_code} has been verified by Teamsmiths.`,
        p_related_id: cert.id
      });

      // Optional email
      if (notifyByEmail && cert.profiles?.email) {
        await supabase.functions.invoke('send-notification-email', {
          body: {
            to: cert.profiles.email,
            type: 'certification_verified',
            data: {
              title: 'Certification Verified',
              message: '',
              freelancerName: cert.profiles.full_name || 'there',
              certificationTitle: cert.academy_certifications?.title || cert.cert_code
            }
          }
        });
      }

      toast({
        title: 'Success',
        description: 'Certification verified successfully. This will boost the freelancer\'s matching score.',
      });

      fetchCertifications();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to verify certification',
        variant: 'destructive',
      });
    }
  };

  const handleReject = async (cert: CertificationWithProfile) => {
    try {
      const { error } = await supabase
        .from('freelancer_certifications')
        .update({
          status: 'declared'
        })
        .eq('id', cert.id);

      if (error) throw error;

      // Log admin action
      await supabase.functions.invoke('audit-admin-action', {
        body: {
          entity: 'freelancer_certifications',
          action: 'reject',
          entity_id: cert.id,
          meta: { status: 'declared' }
        }
      });

      // Create in-app notification
      await supabase.rpc('create_notification', {
        p_user_id: cert.user_id,
        p_type: 'certification_update',
        p_title: 'Certification update',
        p_message: `Update on your certification ${cert.academy_certifications?.title || cert.cert_code}. We couldn\'t verify it at this time.`,
        p_related_id: cert.id
      });

      if (notifyByEmail && cert.profiles?.email) {
        await supabase.functions.invoke('send-notification-email', {
          body: {
            to: cert.profiles.email,
            type: 'certification_rejected',
            data: {
              title: 'Certification Update',
              message: '',
              freelancerName: cert.profiles.full_name || 'there',
              certificationTitle: cert.academy_certifications?.title || cert.cert_code
            }
          }
        });
      }

      toast({
        title: 'Success',
        description: 'Certification rejected. Freelancer will remain with declared status.',
      });

      fetchCertifications();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to reject certification',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Verified</Badge>;
      case 'pending':
        return <Badge className="bg-orange-100 text-orange-800 border-orange-200">Pending</Badge>;
      case 'declared':
      default:
        return <Badge variant="outline">Declared</Badge>;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Certifications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">Loading certifications...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle>Certification Verification</CardTitle>
            <CardDescription>
              Review and verify freelancer certifications to boost their credibility and matching scores
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="notify-email" checked={notifyByEmail} onCheckedChange={(v) => setNotifyByEmail(Boolean(v))} />
            <Label htmlFor="notify-email" className="text-sm">Notify freelancer by email</Label>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {certifications.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No certifications to review
          </div>
        ) : (
          <div className="space-y-4">
            {certifications.map((cert) => (
              <div key={cert.id} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          {cert.profiles?.full_name || 'Unknown User'}
                        </span>
                      </div>
                      {getStatusBadge(cert.status)}
                    </div>
                    
                    <h4 className="font-semibold mb-1">
                      {cert.academy_certifications?.title || cert.cert_code}
                    </h4>
                    
                    {cert.academy_certifications?.tool_slug && (
                      <p className="text-sm text-muted-foreground mb-2">
                        Tool: {cert.academy_certifications.tool_slug}
                      </p>
                    )}
                    
                    <p className="text-xs text-muted-foreground">
                      Submitted: {new Date(cert.created_at).toLocaleDateString()}
                      {cert.issued_at && (
                        <> • Verified: {new Date(cert.issued_at).toLocaleDateString()}</>
                      )}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {cert.evidence_url && (
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                      >
                        <a 
                          href={cert.evidence_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-1"
                        >
                          <ExternalLink className="h-3 w-3" />
                          Evidence
                        </a>
                      </Button>
                    )}
                    
                    {cert.status !== 'verified' && (
                      <TooltipProvider>
                        <div className="flex gap-1">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleReject(cert)}
                                className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                              >
                                <XCircle className="h-3 w-3" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Freelancer will remain Declared. Consider leaving feedback.</p>
                            </TooltipContent>
                          </Tooltip>
                          
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="sm"
                                onClick={() => handleVerify(cert)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="h-3 w-3" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>This badge will appear as Verified and boost the freelancer's matching score.</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </TooltipProvider>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}