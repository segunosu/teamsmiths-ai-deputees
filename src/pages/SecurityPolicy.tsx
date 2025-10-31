import { Helmet } from "react-helmet-async";

const SecurityPolicy = () => {
  const lastUpdated = "31 October 2025";
  
  return (
    <>
      <Helmet>
        <title>Security Policy | Teamsmiths AI Deputees™</title>
        <meta name="description" content="Learn about Teamsmiths' professional-grade security measures, data protection, and incident response procedures." />
        <link rel="canonical" href="https://teamsmiths.ai/security" />
      </Helmet>
      
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-foreground mb-4">Security Policy</h1>
          <p className="text-sm text-muted-foreground mb-8">
            Last updated: {lastUpdated}
          </p>
          
          <div className="prose prose-lg max-w-none text-muted-foreground">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">Overview</h2>
              <p>
                Teamsmiths AI Deputees™ operates with security by design: principle of least privilege, 
                comprehensive audit logging, and strict separation of environments. Your data is protected 
                with professional-grade safeguards designed to maintain the highest standards of security and privacy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">Data Protection</h2>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li><strong>Encryption in transit:</strong> All data transmitted uses TLS 1.2+ security protocols</li>
                <li><strong>Encryption at rest:</strong> Database encryption per Supabase PostgreSQL defaults</li>
                <li><strong>Access controls:</strong> SSO/strong credentials; secrets stored in secure environment variables with key rotation procedures</li>
                <li><strong>Backups:</strong> Automated daily backups with point-in-time recovery capabilities</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">Application Security</h2>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li><strong>Code review:</strong> Regular security reviews and testing</li>
                <li><strong>Dependency scanning:</strong> Automated vulnerability detection and patching</li>
                <li><strong>Webhook security:</strong> Signature verification for all incoming webhooks</li>
                <li><strong>Row-level security:</strong> Complete data isolation with automated enforcement</li>
                <li><strong>Role-based permissions:</strong> Admin/user separation with database-level policies</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">Vulnerability Management</h2>
              <p>Our vulnerability management process includes:</p>
              <ul className="list-disc pl-6 mb-4">
                <li>Triage within 1 business day of discovery</li>
                <li>Remediation SLAs based on severity classification</li>
                <li>Regular security testing and audits</li>
                <li>Proactive monitoring for emerging threats</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">Incident Response</h2>
              <p>In the event of a security incident, we have established procedures to:</p>
              <ul className="list-disc pl-6 mb-4">
                <li>Provide 24/7 monitoring and rapid threat detection</li>
                <li>Quickly identify and contain security threats</li>
                <li>Assess and mitigate impact to systems and data</li>
                <li>Notify affected customers without undue delay if personal-data breach is confirmed</li>
                <li>Conduct post-mortem reviews within 10 business days</li>
                <li>Implement corrective measures to prevent recurrence</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">Subprocessors</h2>
              <p className="mb-4">
                We work with trusted service providers who maintain high security standards:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li><strong>Supabase:</strong> Database, storage, and serverless functions (PostgreSQL with encryption)</li>
                <li><strong>Replit/Lovable:</strong> Application hosting and development platform</li>
                <li><strong>Resend:</strong> Transactional email delivery</li>
                <li><strong>MeetingBaaS:</strong> Meeting recording and transcription services (where enabled)</li>
                <li><strong>Analytics & CDN providers:</strong> Performance monitoring and content delivery</li>
              </ul>
              <p>
                All subprocessors are contractually obligated to maintain appropriate security measures 
                and comply with applicable data protection regulations.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">Reporting Security Issues</h2>
              <p>
                If you discover a security vulnerability, please report it to our security team immediately:
              </p>
              <p className="mt-2 font-medium">
                Email: <a href="mailto:security@teamsmiths.ai" className="text-primary hover:underline">security@teamsmiths.ai</a>
              </p>
              <p className="mt-2">
                We appreciate responsible disclosure and will work with you to address any issues promptly. 
                We typically respond to security reports within 1 business day.
              </p>
            </section>
          </div>
        </div>
      </div>
    </>
  );
};

export default SecurityPolicy;
