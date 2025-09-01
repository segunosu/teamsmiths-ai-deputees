import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
  Button,
  Section,
  Hr,
  Img,
} from 'npm:@react-email/components@0.0.22';
import * as React from 'npm:react@18.3.1';

interface ExpertSelectedEmailProps {
  expertName: string;
  projectTitle: string;
  clientName: string;
  dashboardUrl: string;
}

export const ExpertSelectedEmail = ({
  expertName,
  projectTitle,
  clientName,
  dashboardUrl,
}: ExpertSelectedEmailProps) => (
  <Html>
    <Head />
    <Preview>Congratulations! You've been selected for {projectTitle}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Img
            src="https://iyqsbjawaampgcavsgcz.supabase.co/storage/v1/object/public/project-files/teamsmiths-logo.png"
            alt="Teamsmiths"
            style={logo}
          />
        </Section>
        
        <Heading style={h1}>🎉 Congratulations – You've been selected!</Heading>
        
        <Text style={greeting}>Hi {expertName},</Text>
        
        <Text style={text}>
          Fantastic news! <strong>{clientName}</strong> has chosen you for <strong>{projectTitle}</strong>.
        </Text>
        
        <Section style={highlightBox}>
          <Text style={highlightText}>
            ✨ Your expertise and experience made you the perfect match for this project.
          </Text>
        </Section>
        
        <Section style={nextStepsSection}>
          <Heading style={h2}>What happens next?</Heading>
          <Text style={stepText}>
            <strong>1. Chat with your client</strong><br />
            Start discussing project details and timeline
          </Text>
          <Text style={stepText}>
            <strong>2. Schedule an intro call</strong><br />
            Get to know each other and align on expectations  
          </Text>
          <Text style={stepText}>
            <strong>3. Project kickoff</strong><br />
            Begin delivering amazing outcomes
          </Text>
        </Section>
        
        <Section style={actionSection}>
          <Button href={dashboardUrl} style={primaryButton}>
            Go to Project Dashboard
          </Button>
        </Section>
        
        <Hr style={hr} />
        
        <Text style={footer}>
          Need help getting started? 
          <Link href="https://calendly.com/osu/brief-chat" style={link}> Schedule a call</Link> with our team.
        </Text>
        
        <Text style={signature}>
          Congratulations again!<br />
          The Teamsmiths Team
        </Text>
      </Container>
    </Body>
  </Html>
);

export default ExpertSelectedEmail;

// Styles
const main = {
  backgroundColor: '#ffffff',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  maxWidth: '600px',
  margin: '0 auto',
  padding: '20px',
};

const header = {
  textAlign: 'center' as const,
  marginBottom: '32px',
};

const logo = {
  height: '48px',
  width: 'auto',
};

const h1 = {
  color: '#1a1a1a',
  fontSize: '28px',
  fontWeight: '700',
  lineHeight: '1.3',
  margin: '0 0 24px',
  textAlign: 'center' as const,
};

const h2 = {
  color: '#1a1a1a',
  fontSize: '20px',
  fontWeight: '600',
  lineHeight: '1.4',
  margin: '0 0 16px',
};

const greeting = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '0 0 16px',
};

const text = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '0 0 16px',
};

const highlightBox = {
  backgroundColor: '#ecfdf5',
  border: '1px solid #d1fae5',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
  textAlign: 'center' as const,
};

const highlightText = {
  color: '#065f46',
  fontSize: '16px',
  fontWeight: '500',
  margin: '0',
};

const nextStepsSection = {
  margin: '32px 0',
};

const stepText = {
  color: '#374151',
  fontSize: '15px',
  lineHeight: '1.6',
  margin: '0 0 16px',
  paddingLeft: '8px',
};

const actionSection = {
  margin: '32px 0',
  textAlign: 'center' as const,
};

const primaryButton = {
  backgroundColor: '#16a34a',
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  padding: '14px 28px',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
};

const hr = {
  borderColor: '#e2e8f0',
  margin: '32px 0',
};

const footer = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '1.5',
  margin: '0 0 16px',
};

const signature = {
  color: '#374151',
  fontSize: '16px',
  margin: '24px 0 0',
};

const link = {
  color: '#2563eb',
  textDecoration: 'underline',
};