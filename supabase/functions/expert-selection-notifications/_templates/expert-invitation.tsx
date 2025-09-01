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

interface ExpertInvitationEmailProps {
  expertName: string;
  projectTitle: string;
  projectSummary: string;
  budgetRange: string;
  matchScore: number;
  acceptUrl: string;
  declineUrl: string;
}

export const ExpertInvitationEmail = ({
  expertName,
  projectTitle,
  projectSummary,
  budgetRange,
  matchScore,
  acceptUrl,
  declineUrl,
}: ExpertInvitationEmailProps) => (
  <Html>
    <Head />
    <Preview>You've been invited to {projectTitle} - {Math.round(matchScore * 100)}% match</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Img
            src="https://iyqsbjawaampgcavsgcz.supabase.co/storage/v1/object/public/project-files/teamsmiths-logo.png"
            alt="Teamsmiths"
            style={logo}
          />
        </Section>
        
        <Heading style={h1}>You've been invited to a new project! 🎯</Heading>
        
        <Text style={greeting}>Hi {expertName},</Text>
        
        <Text style={text}>
          Great news! You've been matched to <strong>{projectTitle}</strong> with a <strong>{Math.round(matchScore * 100)}% compatibility score</strong>.
        </Text>
        
        <Section style={projectBox}>
          <Heading style={h2}>{projectTitle}</Heading>
          <Text style={projectSummary}>{projectSummary}</Text>
          <Text style={budgetText}>
            <strong>Budget Range:</strong> {budgetRange}
          </Text>
        </Section>
        
        <Section style={actionSection}>
          <Text style={text}>Ready to make an impact?</Text>
          <Section style={buttonContainer}>
            <Button href={acceptUrl} style={acceptButton}>
              Accept Invitation
            </Button>
            <Button href={declineUrl} style={declineButton}>
              Decline
            </Button>
          </Section>
        </Section>
        
        <Hr style={hr} />
        
        <Text style={footer}>
          This invitation will expire in 48 hours. If you have any questions, 
          <Link href="https://calendly.com/osu/brief-chat" style={link}> schedule a brief chat</Link> with our team.
        </Text>
        
        <Text style={signature}>
          Best regards,<br />
          The Teamsmiths Team
        </Text>
      </Container>
    </Body>
  </Html>
);

export default ExpertInvitationEmail;

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
  margin: '0 0 12px',
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

const projectBox = {
  backgroundColor: '#f8fafc',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 0',
};

const projectSummary = {
  color: '#64748b',
  fontSize: '14px',
  lineHeight: '1.5',
  margin: '0 0 16px',
};

const budgetText = {
  color: '#059669',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0',
};

const actionSection = {
  margin: '32px 0',
  textAlign: 'center' as const,
};

const buttonContainer = {
  display: 'flex',
  gap: '12px',
  justifyContent: 'center',
  margin: '20px 0',
};

const acceptButton = {
  backgroundColor: '#16a34a',
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  padding: '12px 24px',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
};

const declineButton = {
  backgroundColor: 'transparent',
  border: '1px solid #d1d5db',
  borderRadius: '6px',
  color: '#374151',
  fontSize: '16px',
  fontWeight: '600',
  padding: '12px 24px',
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