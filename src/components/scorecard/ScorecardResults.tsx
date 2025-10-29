import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, AlertCircle, ArrowRight, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ScorecardResultsProps {
  data: {
    total_score: number;
    readiness_score: number;
    reach_score: number;
    prowess_score: number;
    protection_score: number;
    segment: 'Explorer' | 'Implementer' | 'Accelerator';
    name: string;
    email: string;
  };
}

export const ScorecardResults: React.FC<ScorecardResultsProps> = ({ data }) => {
  const navigate = useNavigate();

  const getSegmentInfo = () => {
    switch (data.segment) {
      case 'Explorer':
        return {
          title: 'AI Explorer',
          description: 'You\'re at the beginning of your AI journey with significant opportunities ahead.',
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          cta: 'Free AI Workshop',
          ctaLink: '/contact?interest=workshop',
        };
      case 'Implementer':
        return {
          title: 'AI Implementer',
          description: 'You\'re making progress with AI and ready to accelerate impact.',
          color: 'text-amber-600',
          bgColor: 'bg-amber-50',
          cta: 'AI Growth Sprint',
          ctaLink: '/contact?interest=sprint',
        };
      case 'Accelerator':
        return {
          title: 'AI Accelerator',
          description: 'You\'re advanced in AI and ready to maximize business wins.',
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          cta: 'Book Business Win Project',
          ctaLink: '/contact?interest=business-win',
        };
    }
  };

  const segmentInfo = getSegmentInfo();

  const getInsights = () => {
    const scores = [
      { name: 'Readiness', score: data.readiness_score },
      { name: 'Reach', score: data.reach_score },
      { name: 'Prowess', score: data.prowess_score },
      { name: 'Protection', score: data.protection_score },
    ];

    const sorted = [...scores].sort((a, b) => b.score - a.score);
    const strength = sorted[0];
    const improvement = sorted[sorted.length - 1];

    return {
      strength: `Your ${strength.name} is a key strength (${strength.score.toFixed(0)}/100)`,
      improvement: `Focus on improving your ${improvement.name} (${improvement.score.toFixed(0)}/100)`,
      action: data.segment === 'Explorer' 
        ? 'Start with foundational AI training and quick wins'
        : data.segment === 'Implementer'
        ? 'Scale successful pilots and build AI capabilities'
        : 'Optimize AI operations and drive strategic innovation',
    };
  };

  const insights = getInsights();

  return (
    <div className="container max-w-5xl mx-auto px-4 py-8 md:py-16">
      <div className="text-center mb-8 md:mb-12">
        <div className={`inline-block px-6 py-2 rounded-full ${segmentInfo.bgColor} ${segmentInfo.color} font-semibold mb-4`}>
          {segmentInfo.title}
        </div>
        <h1 className="text-4xl md:text-6xl font-bold mb-4">
          Your Score: <span className="text-primary">{Math.round(data.total_score)}/100</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
          {segmentInfo.description}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-12">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Your 4RPR Breakdown</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Readiness</span>
                <span className="text-sm font-semibold text-primary">{Math.round(data.readiness_score)}</span>
              </div>
              <Progress value={data.readiness_score} />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Reach</span>
                <span className="text-sm font-semibold text-primary">{Math.round(data.reach_score)}</span>
              </div>
              <Progress value={data.reach_score} />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Prowess</span>
                <span className="text-sm font-semibold text-primary">{Math.round(data.prowess_score)}</span>
              </div>
              <Progress value={data.prowess_score} />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Protection</span>
                <span className="text-sm font-semibold text-primary">{Math.round(data.protection_score)}</span>
              </div>
              <Progress value={data.protection_score} />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Key Insights</h3>
          <div className="space-y-4">
            <div className="flex gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Strength</p>
                <p className="text-sm text-muted-foreground">{insights.strength}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Area to Improve</p>
                <p className="text-sm text-muted-foreground">{insights.improvement}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <ArrowRight className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Recommended Next Step</p>
                <p className="text-sm text-muted-foreground">{insights.action}</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-8 text-center bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <Mail className="h-12 w-12 text-primary mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-3">Check Your Email</h2>
        <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
          We've sent a detailed report to <strong>{data.email}</strong> with your complete scorecard analysis and personalized recommendations.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" onClick={() => navigate(segmentInfo.ctaLink)}>
            {segmentInfo.cta}
          </Button>
          <Button size="lg" variant="outline" onClick={() => navigate('/contact')}>
            Speak to an Expert
          </Button>
        </div>
      </Card>

      <div className="text-center mt-8">
        <Button variant="ghost" onClick={() => window.location.reload()}>
          Take the Assessment Again
        </Button>
      </div>
    </div>
  );
};
