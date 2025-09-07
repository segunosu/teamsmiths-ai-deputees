import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Calendar, CheckCircle, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AIDeputee from '@/components/AIDeputee';

const ProofSprintCheckout = () => {
  const [searchParams] = useSearchParams();  
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const sprintType = searchParams.get('sprint') || 'lite';
  
  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    contactEmail: '',
    kpiToMeasure: '',
    idealOutcomes: '',
    poNumber: ''
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const sprintDetails = {
    lite: {
      name: 'Proof Sprint — Lite',
      duration: '1 week',
      price: '£495',
      deliverable: '1 Deputee™ quick-win (proposal template + auto follow-up), KPI baseline'
    },
    focus: {
      name: 'Proof Sprint — Focus',
      duration: '2 weeks',
      price: '£1,950',
      deliverable: '2 Deputee™ workflows, KPI baseline, measurement plan'
    },
    impact: {
      name: 'Proof Sprint — Impact',
      duration: '4 weeks',
      price: '£4,950',
      deliverable: 'Full small pilot, weekly measurement, 30-day uplift projection'
    }
  };

  const currentSprint = sprintDetails[sprintType as keyof typeof sprintDetails];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.companyName || !formData.contactName || !formData.contactEmail || !formData.kpiToMeasure || !formData.idealOutcomes) {
        throw new Error('Please fill in all required fields');
      }

      // Here you would typically integrate with Stripe or your payment processor
      // For now, we'll simulate the purchase flow
      
      toast({
        title: 'Proof Sprint Purchased!',
        description: 'Check your email for next steps and scheduling link.',
      });

      // Redirect to success page
      navigate('/proof-sprints/success', { 
        state: { 
          sprint: currentSprint,
          formData 
        }
      });

    } catch (error: any) {
      toast({
        title: 'Purchase failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!currentSprint) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Invalid Sprint Type</h1>
          <Button asChild>
            <a href="/plans">Back to Plans</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-4">Purchase {currentSprint.name}</h1>
          <p className="text-muted-foreground">
            Complete your order and we'll send you a kickoff scheduling link.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{currentSprint.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    <Calendar className="h-4 w-4" />
                    {currentSprint.duration}
                  </div>
                </div>
                <Badge variant="secondary" className="text-lg px-3 py-1">
                  {currentSprint.price}
                </Badge>
              </div>
              
              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">What's Included:</h4>
                <p className="text-sm text-muted-foreground">{currentSprint.deliverable}</p>
              </div>
              
              <div className="border-t pt-4">
                <div className="flex items-start gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Signed scope agreement required before start</span>
                </div>
                <div className="flex items-start gap-2 text-sm mt-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>KPI baseline and measurement plan included</span>
                </div>
                <div className="flex items-start gap-2 text-sm mt-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span><AIDeputee /> powered delivery</span>
                </div>
              </div>

              <div className="bg-muted/30 p-4 rounded-lg">
                <p className="text-sm font-medium text-primary">
                  🎯 Conversion Offer: Convert to Navigator Core within 30 days and receive onboarding credit equal to half your first month's Core fee.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Checkout Form */}
          <Card>
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
              <CardDescription>
                We need these details to prepare your sprint scope and kickoff.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name *</Label>
                    <Input
                      id="companyName"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactName">Contact Name *</Label>
                    <Input
                      id="contactName"
                      name="contactName"
                      value={formData.contactName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Contact Email *</Label>
                  <Input
                    id="contactEmail"
                    name="contactEmail"
                    type="email"
                    value={formData.contactEmail}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="kpiToMeasure">KPI to be Measured *</Label>
                  <Input
                    id="kpiToMeasure"
                    name="kpiToMeasure"
                    placeholder="e.g., proposal conversion rate, response time, revenue per lead"
                    value={formData.kpiToMeasure}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="idealOutcomes">Ideal Outcomes *</Label>
                  <Textarea
                    id="idealOutcomes"
                    name="idealOutcomes"
                    placeholder="Describe what success looks like for this sprint..."
                    value={formData.idealOutcomes}
                    onChange={handleInputChange}
                    rows={3}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="poNumber">PO Number (Optional)</Label>
                  <Input
                    id="poNumber"
                    name="poNumber"
                    placeholder="For internal tracking"
                    value={formData.poNumber}
                    onChange={handleInputChange}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  size="lg"
                  disabled={loading}
                >
                  {loading ? 'Processing...' : `Purchase ${currentSprint.name} — ${currentSprint.price}`}
                  {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  By proceeding, you agree to our Terms of Service and that a signed scope agreement 
                  is required before work begins.
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProofSprintCheckout;