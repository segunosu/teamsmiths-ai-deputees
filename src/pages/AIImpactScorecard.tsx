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
        <title>AI Impact Scorecard | Discover Your AI Readiness | Teamsmiths</title>
        <meta 
          name="description" 
          content="Take our free AI Impact Scorecard to assess your organization's AI readiness, reach, prowess, and protection. Get personalized insights and recommendations." 
        />
        <link rel="canonical" href={`${window.location.origin}/ai-impact-scorecard`} />
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
