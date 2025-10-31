import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { ScorecardQuiz } from '@/components/scorecard/ScorecardQuiz';
import { ScorecardResults } from '@/components/scorecard/ScorecardResults';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';

interface ScorecardData {
  id: string;
  total_score: number;
  readiness_score: number;
  reach_score: number;
  prowess_score: number;
  protection_score: number;
  segment: 'Explorer' | 'Implementer' | 'Accelerator';
  name: string;
  email: string;
}

const AIImpactMaturity: React.FC = () => {
  const [scorecardData, setScorecardData] = useState<ScorecardData | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);

  const handleQuizComplete = (data: ScorecardData) => {
    setScorecardData(data);
  };

  const handleStartAssessment = () => {
    setShowQuiz(true);
  };

  return (
    <>
      <Helmet>
        <title>Free AI Impact Maturity Assessment | Discover Your Business AI Readiness | Teamsmiths</title>
        <meta 
          name="description" 
          content="Take our free 5-minute AI Impact Maturity assessment. Discover if you're an Explorer, Implementer, or Accelerator — and get personalized steps to drive measurable AI results." 
        />
        <meta name="keywords" content="AI maturity, AI impact assessment, AI for SMBs, AI business improvement, Teamsmiths scorecard" />
        <link rel="canonical" href={`${window.location.origin}/ai-impact-maturity`} />
      </Helmet>
      
      <main className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
        {!showQuiz && !scorecardData ? (
          // Hero Section
          <div className="container mx-auto px-4 py-16 md:py-24">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                Discover Your AI Impact Maturity Level
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground mb-8">
                Understand where you are on the AI impact journey — from Explorer to Accelerator — and get your personalised roadmap to measurable business results.
              </p>
              
              <div className="grid md:grid-cols-3 gap-6 mb-12 text-left">
                <div className="bg-card p-6 rounded-lg border">
                  <CheckCircle2 className="h-8 w-8 text-primary mb-3" />
                  <h3 className="font-semibold mb-2">Complete in 5 minutes</h3>
                  <p className="text-sm text-muted-foreground">Quick assessment of your AI capabilities across 4 key dimensions</p>
                </div>
                <div className="bg-card p-6 rounded-lg border">
                  <CheckCircle2 className="h-8 w-8 text-primary mb-3" />
                  <h3 className="font-semibold mb-2">Instant personalized insights</h3>
                  <p className="text-sm text-muted-foreground">Receive your maturity level and detailed breakdown immediately</p>
                </div>
                <div className="bg-card p-6 rounded-lg border">
                  <CheckCircle2 className="h-8 w-8 text-primary mb-3" />
                  <h3 className="font-semibold mb-2">Actionable next steps</h3>
                  <p className="text-sm text-muted-foreground">Get specific recommendations to advance to the next level</p>
                </div>
              </div>

              <Button 
                size="lg" 
                className="text-lg px-8 py-6 h-auto"
                onClick={handleStartAssessment}
              >
                Start Free Assessment
              </Button>

              <p className="text-sm text-muted-foreground mt-6">
                Powered by Teamsmiths AI Performance Framework
              </p>
            </div>
          </div>
        ) : showQuiz && !scorecardData ? (
          <ScorecardQuiz onComplete={handleQuizComplete} />
        ) : (
          <ScorecardResults data={scorecardData!} />
        )}
      </main>
    </>
  );
};

export default AIImpactMaturity;
