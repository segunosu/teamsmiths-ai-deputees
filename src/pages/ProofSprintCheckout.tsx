import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { AIDeputee } from '@/components/AIDeputee';
import { useAnalytics } from '@/hooks/useAnalytics';

const ProofSprintCheckout = () => {
  const [searchParams] = useSearchParams();
  const { trackEvent } = useAnalytics();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    company: '',
    contact: '',
    email: '',
    poNumber: '',
    kpiToMeasure: '',
    preferredDates: '',
    acceptedTerms: false
  });

  const sprintId = searchParams.get('sprint') || 'lite-sprint';
  
  const sprints = {
    'lite-sprint': {
      name: 'Proof Sprint — Lite',
      duration: '1 week',
      price: '£495',
      deliverable: '1 Deputee™ quick win (proposal template + auto follow-up)',
      features: ['KPI baseline', 'Single workflow automation', 'Basic measurement']
    },
    'focus-sprint': {
      name: 'Proof Sprint — Focus', 
      duration: '2 weeks',
      price: '£1,950',
      deliverable: '2 Deputee™ workflows + KPI baseline',
      features: ['KPI baseline', 'Dual workflow automation', 'Measurement plan', 'Weekly check-in']
    },
    'impact-sprint': {
      name: 'Proof Sprint — Impact',
      duration: '4 weeks',
      price: '£4,950', 
      deliverable: 'Full pilot + measurement plan + 30-day uplift projection',
      features: ['Complete KPI setup', 'Multi-workflow automation', 'Advanced measurement', 'Weekly reviews', 'Uplift projection']
    }
  };

  const currentSprint = sprints[sprintId];

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.acceptedTerms) {
      alert('Please accept the terms and conditions');
      return;
    }

    setLoading(true);
    
    try {
      trackEvent('proof_purchase', { 
        sprint_id: sprintId, 
        price: parseInt(currentSprint.price.replace('£', '').replace(',', ''))
      });

      // Create Stripe checkout session
      const response = await fetch('/api/create-proof-sprint-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sprint_id: sprintId,
          ...formData
        })
      });

      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!currentSprint) {
    return (
      <div className="min-h-screen py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Sprint Not Found</h1>
          <Button asChild>
            <Link to="/ai-navigator">Back to AI Navigator</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Button asChild variant="ghost" className="mb-4">
            <Link to="/ai-navigator">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to AI Navigator
            </Link>
          </Button>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Sprint Details */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-2xl">{currentSprint.name}</CardTitle>
              <CardDescription className="text-lg">
                {currentSprint.duration} • {currentSprint.price}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <h4 className="font-semibold mb-2">Deliverable:</h4>
                <p className="text-muted-foreground">{currentSprint.deliverable}</p>
              </div>
              
              <div className="mb-6">
                <h4 className="font-semibold mb-3">Includes:</h4>
                <ul className="space-y-2">
                  {currentSprint.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-muted/50 rounded-lg p-4">
                <h4 className="font-semibold mb-2"><AIDeputee /> Assurance</h4>
                <p className="text-sm text-muted-foreground">
                  All Proof Sprints include continuous monitoring and human QA oversight.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Checkout Form */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Book Your Proof Sprint</CardTitle>
              <CardDescription>
                Complete the form below to proceed with payment and scheduling.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="company">Company Name *</Label>
                    <Input
                      id="company"
                      value={formData.company}
                      onChange={(e) => handleInputChange('company', e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="contact">Contact Name *</Label>
                    <Input
                      id="contact"
                      value={formData.contact}
                      onChange={(e) => handleInputChange('contact', e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="poNumber">PO Number (Optional)</Label>
                    <Input
                      id="poNumber"
                      value={formData.poNumber}
                      onChange={(e) => handleInputChange('poNumber', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="kpiToMeasure">KPI to Measure *</Label>
                    <Select onValueChange={(value) => handleInputChange('kpiToMeasure', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select KPI to track" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lead-conversion">Lead Conversion Rate</SelectItem>
                        <SelectItem value="proposal-response">Proposal Response Time</SelectItem>
                        <SelectItem value="sales-cycle">Sales Cycle Length</SelectItem>
                        <SelectItem value="revenue-growth">Revenue Growth</SelectItem>
                        <SelectItem value="customer-retention">Customer Retention</SelectItem>
                        <SelectItem value="other">Other (specify in dates)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="preferredDates">Preferred Kickoff Dates *</Label>
                    <Textarea
                      id="preferredDates"
                      placeholder="Please provide 3 preferred dates/time ranges for kickoff"
                      value={formData.preferredDates}
                      onChange={(e) => handleInputChange('preferredDates', e.target.value)}
                      required
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="terms"
                      checked={formData.acceptedTerms}
                      onCheckedChange={(checked) => handleInputChange('acceptedTerms', checked)}
                    />
                    <Label htmlFor="terms" className="text-sm">
                      I accept the{' '}
                      <Link to="/terms-of-service" className="text-primary hover:underline">
                        Terms & Conditions
                      </Link>{' '}
                      and understand the refund policy *
                    </Label>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-semibold">Total:</span>
                    <span className="text-2xl font-bold text-primary">{currentSprint.price}</span>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full" 
                    size="lg"
                    disabled={loading}
                  >
                    {loading ? 'Processing...' : `Pay ${currentSprint.price} & Schedule Kickoff`}
                  </Button>
                  
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    After payment, you'll receive a Calendly invite for kickoff scheduling.
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProofSprintCheckout;