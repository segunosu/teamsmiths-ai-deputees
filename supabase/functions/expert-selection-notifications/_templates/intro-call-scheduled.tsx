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

interface IntroCallScheduledEmailProps {
  recipientName: string;
  projectTitle: string;
  meetingDate: string;
  meetingTime: string;
  meetingLink: string;
  isExpert: boolean;
}

export const IntroCallScheduledEmail = ({
  recipientName,
  projectTitle,
  meetingDate,
  meetingTime,
  meetingLink,
  isExpert,
}: IntroCallScheduledEmailProps) => (
  <Html>
    <Head />
    <Preview>Intro call scheduled for {projectTitle} - {meetingDate}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Img
            src="https://iyqsbjawaampgcavsgcz.supabase.co/storage/v1/object/public/project-files/teamsmiths-logo.png"
            alt="Teamsmiths"
            style={logo}
          />
        </Section>
        
        <Heading style={h1}>📅 Your intro call is scheduled!</Heading>
        
        <Text style={greeting}>Hi {recipientName},</Text>
        
        <Text style={text}>
          Your introduction call for <strong>{projectTitle}</strong> has been scheduled.
        </Text>
        
        <Section style={meetingBox}>
          <Heading style={h2}>Meeting Details</Heading>
          <Text style={meetingDetail}>
            <strong>📅 Date:</strong> {meetingDate}
          </Text>
          <Text style={meetingDetail}>
            <strong>🕐 Time:</strong> {meetingTime}
          </Text>
          <Text style={meetingDetail}>
            <strong>💻 Platform:</strong> Google Meet
          </Text>
        </Section>
        
        <Section style={actionSection}>
          <Button href={meetingLink} style={primaryButton}>
            Join Meeting
          </Button>
        </Section>
        
        <Section style={preparationSection}>
          <Heading style={h2}>
            {isExpert ? 'How to prepare:' : 'Meeting agenda:'}
          </Heading>
          {isExpert ? (
            <>
              <Text style={tipText}>
                • Review the project brief and requirements
              </Text>
              <Text style={tipText}>
                • Prepare questions about scope and timeline
              </Text>
              <Text style={tipText}>
                • Be ready to discuss your approach and methodology
              </Text>
            </>
          ) : (
            <>
              <Text style={tipText}>
                • Get to know your selected expert
              </Text>
              <Text style={tipText}>
                • Discuss project goals and expectations
              </Text>
              <Text style={tipText}>
                • Align on timeline and next steps
              </Text>
            </>
          )}
        </Section>
        
        <Hr style={hr} />
        
        <Text style={footer}>
          Meeting link: <Link href={meetingLink} style={link}>{meetingLink}</Link>
        </Text>
        
        <Text style={footer}>
          Can't make it? Contact us at 
          <Link href="https://calendly.com/osu/brief-chat" style={link}> our scheduling page</Link>.
        </Text>
        
        <Text style={signature}>
          Looking forward to a great collaboration!<br />
          The Teamsmiths Team
        </Text>
      </Container>
    </Body>
  </Html>
);

export default IntroCallScheduledEmail;

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
  fontSize: '18px',
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

const meetingBox = {
  backgroundColor: '#f1f5f9',
  border: '1px solid #cbd5e1',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 0',
};

const meetingDetail = {
  color: '#475569',
  fontSize: '15px',
  lineHeight: '1.6',
  margin: '0 0 8px',
};

const actionSection = {
  margin: '32px 0',
  textAlign: 'center' as const,
};

const primaryButton = {
  backgroundColor: '#2563eb',
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  padding: '14px 28px',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
};

const preparationSection = {
  margin: '32px 0',
};

const tipText = {
  color: '#374151',
  fontSize: '15px',
  lineHeight: '1.6',
  margin: '0 0 8px',
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
  wordBreak: 'break-all' as const,
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