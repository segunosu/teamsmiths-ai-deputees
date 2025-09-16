import React from 'react';
import { Helmet } from 'react-helmet-async';
import DeputeeAIBriefBuilder from '@/components/DeputeeAIBriefBuilder';

const BriefBuilder: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>AI Brief Builder | Teamsmiths</title>
        <meta name="description" content="Deputee AI-powered brief builder to customise outcome packs and capture your goals." />
        <link rel="canonical" href={window.location.origin + '/brief-builder'} />
      </Helmet>
      <main>
        <h1 className="sr-only">AI Brief Builder</h1>
        <div id="form">
          <DeputeeAIBriefBuilder />
        </div>
      </main>
    </>
  );
};

export default BriefBuilder;
