import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, CheckCircle, Lock } from 'lucide-react';
import { useAnalytics } from '@/hooks/useAnalytics';

/**
 * Discovery Sprint checkout: clean, single-product page.
 * £495 paid intake. Captures fit info, then hands off to the Stripe checkout
 * Edge Function (existing /api/create-proof-sprint-checkout endpoint).
 *
 * If the backend endpoint is not available, the form falls back to a polite
 * "we'll be in touch" path so we never silently fail on the buyer.
 */
const DiscoverySprintCheckout = () => {
  const { trackEvent } = useAnalytics();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    company: '',
    contact: '',
    email: '',
    role: '',
    biggestProblem: '',
    preferredDates: '',
    acceptedTerms: false,
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.acceptedTerms) {
      alert('Please accept the terms to continue.');
      return;
    }

    setLoading(true);

    try {
      trackEvent('discovery_sprint_checkout_submit' as any, { price: 495 } as any);

      const response = await fetch('/api/create-proof-sprint-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sprint_id: 'discovery-sprint',
          ...formData,
        }),
      });

      if (response.ok) {
        const { url } = await response.json();
        if (url) {
          window.location.href = url;
          return;
        }
      }
      // Graceful fallback if Stripe handoff isn't ready
      setSubmitted(true);
    } catch (error) {
      console.error('Checkout error:', error);
      // Graceful fallback so the buyer never sees a broken page
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <>
        <Helmet>
          <title>Discovery Sprint: Application received | Teamsmiths</title>
        </Helmet>
        <div className="min-h-screen py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center">
            <CheckCircle className="h-12 w-12 text-success mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-foreground mb-4">
              Got it. We'll be in touch within one working day.
            </h1>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              Segun will email you to confirm your Discovery Sprint and arrange
              payment of £495. The full £495 is credited to your first build if
              you proceed within 60 days.
            </p>
            <Button asChild>
              <Link to="/">Back to home</Link>
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Book your Discovery Sprint (£495) | Teamsmiths</title>
        <meta
          name="description"
          content="Book your 90-minute Discovery Sprint with Segun Osu. £495, fully credited to your first build within 60 days. Blueprint within days: engine design, AI Diagnostic Report, 90-day plan."
        />
      </Helmet>
      <div className="min-h-screen py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-6">
            <Button asChild variant="ghost" size="sm">
              <Link to="/discovery-sprint">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Link>
            </Button>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left: what you get */}
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="text-2xl">Discovery Sprint</CardTitle>
                <CardDescription className="text-lg">
                  90 minutes 1:1 with Segun Osu (ex-FTSE turnaround lead at Haleon, GSK, Gartner).
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary mb-6">£495</div>
                <p className="text-sm text-muted-foreground mb-6">
                  Fully credited to your first build if you proceed within 60 days.
                </p>
                <h4 className="font-semibold mb-3 text-foreground">What you walk away with:</h4>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                    <span>Top 3 opportunities ranked by £-impact</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                    <span>A working design for the first engine we'd build</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                    <span>A 90-day plan you can act on Monday</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                    <span>30 days of async follow-up Q&amp;A</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                    <span>A branded AI Diagnostic Report (PDF) within 5 working days</span>
                  </li>
                </ul>
                <p className="text-xs text-muted-foreground/80 italic mt-6 leading-relaxed">
                  No groups. No fluff. Built for SMB owners and senior leaders who want clarity, not a sales pitch.
                </p>
              </CardContent>
            </Card>

            {/* Right: fit form */}
            <Card>
              <CardHeader>
                <CardTitle>Tell us a bit about your business</CardTitle>
                <CardDescription>
                  Two minutes. We use this to make the 90 minutes count.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <Label htmlFor="company">Company name *</Label>
                    <Input
                      id="company"
                      value={formData.company}
                      onChange={(e) => handleInputChange('company', e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="contact">Your name *</Label>
                    <Input
                      id="contact"
                      value={formData.contact}
                      onChange={(e) => handleInputChange('contact', e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Work email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="role">Your role *</Label>
                    <Input
                      id="role"
                      placeholder="e.g. Managing Director, Operations Director"
                      value={formData.role}
                      onChange={(e) => handleInputChange('role', e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="biggestProblem">
                      What's the one painful KPI you'd most like to move? *
                    </Label>
                    <Textarea
                      id="biggestProblem"
                      placeholder="e.g. order delivery slippage, win rate on quotes, days-sales-outstanding…"
                      value={formData.biggestProblem}
                      onChange={(e) => handleInputChange('biggestProblem', e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="preferredDates">Three preferred dates/times for the Sprint</Label>
                    <Textarea
                      id="preferredDates"
                      placeholder="e.g. Tue 10am, Wed 2pm, Fri 9am"
                      value={formData.preferredDates}
                      onChange={(e) => handleInputChange('preferredDates', e.target.value)}
                    />
                  </div>

                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="terms"
                      checked={formData.acceptedTerms}
                      onCheckedChange={(checked) => handleInputChange('acceptedTerms', !!checked)}
                    />
                    <Label htmlFor="terms" className="text-sm leading-relaxed">
                      I accept the{' '}
                      <Link to="/terms" className="text-primary hover:underline">
                        Terms
                      </Link>{' '}
                      and{' '}
                      <Link to="/privacy" className="text-primary hover:underline">
                        Privacy Policy
                      </Link>
                      , and understand £495 is fully credited to my first build within 60 days. *
                    </Label>
                  </div>

                  <div className="border-t pt-5">
                    <Button type="submit" className="w-full" size="lg" disabled={loading}>
                      {loading ? 'Processing…' : 'Continue to payment (£495)'}
                      <Lock className="ml-2 h-4 w-4" />
                    </Button>
                    <p className="text-xs text-muted-foreground/80 mt-3 text-center">
                      Secure payment via Stripe. You'll receive a Calendly invite right after.
                    </p>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default DiscoverySprintCheckout;
