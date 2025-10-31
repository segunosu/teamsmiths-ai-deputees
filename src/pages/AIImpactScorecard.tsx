import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { ScorecardQuiz } from '@/components/scorecard/ScorecardQuiz';
import { ScorecardResults } from '@/components/scorecard/ScorecardResults';

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

const AIImpactScorecard: React.FC = () => {
  const [scorecardData, setScorecardData] = useState<ScorecardData | null>(null);

  const handleQuizComplete = (data: ScorecardData) => {
    setScorecardData(data);
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
        {!scorecardData ? (
          <ScorecardQuiz onComplete={handleQuizComplete} />
        ) : (
          <ScorecardResults data={scorecardData} />
        )}
      </main>
    </>
  );
};

export default AIImpactScorecard;
