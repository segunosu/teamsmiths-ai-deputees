import { Helmet } from "react-helmet-async";

const Compliance = () => {
  const lastUpdated = "31 October 2025";
  
  return (
    <>
      <Helmet>
        <title>Compliance & Standards | Teamsmiths</title>
        <meta name="description" content="Learn about Teamsmiths' commitment to regulatory compliance, industry standards, and ethical business practices." />
        <link rel="canonical" href="https://teamsmiths.ai/compliance" />
      </Helmet>
      
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-foreground mb-4">Compliance & Standards</h1>
          <p className="text-sm text-muted-foreground mb-8">
            Last updated: {lastUpdated}
          </p>
          
          <div className="prose prose-lg max-w-none text-muted-foreground">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">Our Commitment to Compliance</h2>
              <p>
                Teamsmiths is committed to maintaining the highest standards of regulatory 
                compliance across all our operations and services. We understand that trust is built through 
                consistent adherence to legal, regulatory, and industry standards.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">Key Jurisdictions & Regulations</h2>
              <p className="mb-4">We operate in compliance with:</p>
              <ul className="list-disc pl-6 mb-4">
                <li><strong>UK GDPR & EU GDPR:</strong> Data protection and privacy regulations</li>
                <li><strong>CCPA/CPRA:</strong> California Consumer Privacy Act and California Privacy Rights Act awareness and compliance</li>
                <li><strong>UK Data Protection Act 2018:</strong> National implementation of data protection standards</li>
                <li><strong>PECR:</strong> Privacy and Electronic Communications Regulations</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">Standards We Follow</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-xl font-medium text-foreground mb-3">Data Protection</h3>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>GDPR (UK & EU)</li>
                    <li>CCPA/CPRA awareness</li>
                    <li>UK Data Protection Act 2018</li>
                    <li>Privacy by Design principles</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-xl font-medium text-foreground mb-3">Security Standards</h3>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>ISO 27001 principles (Information Security)</li>
                    <li>SOC 2 Type II readiness</li>
                    <li>NIST Cybersecurity Framework</li>
                    <li>OWASP Top 10 security practices</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-xl font-medium text-foreground mb-3">Quality Management</h3>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>ISO 9001 Quality principles</li>
                    <li>ITIL Service Management</li>
                    <li>Agile and DevOps best practices</li>
                    <li>Continuous improvement methodology</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-xl font-medium text-foreground mb-3">Business Ethics</h3>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Anti-corruption policies</li>
                    <li>Fair competition practices</li>
                    <li>Ethical AI principles</li>
                    <li>Responsible procurement</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">Technology Stack Compliance</h2>
              <p className="mb-4">Our technology infrastructure is built on compliant, enterprise-grade platforms:</p>
              <ul className="list-disc pl-6 mb-4">
                <li><strong>Supabase:</strong> GDPR-compliant PostgreSQL database with encryption at rest and in transit</li>
                <li><strong>Replit/Lovable:</strong> Secure application hosting with SOC 2 Type II certification</li>
                <li><strong>Resend:</strong> GDPR-compliant transactional email service</li>
                <li><strong>MeetingBaaS:</strong> Compliant meeting recording with data residency options</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">Industry-Specific Compliance</h2>
              <p className="mb-4">
                We understand that different industries have specific regulatory requirements. Our team works 
                closely with clients to ensure compliance with sector-specific regulations including:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li><strong>Financial Services:</strong> FCA principles, PCI DSS awareness, Basel III considerations</li>
                <li><strong>Healthcare:</strong> HIPAA awareness for US clients, NHS Data Security standards</li>
                <li><strong>Government:</strong> Government Security Classifications, Cyber Essentials readiness</li>
                <li><strong>Education:</strong> FERPA awareness, COPPA compliance for child data</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">Audit and Certification</h2>
              <p className="mb-4">
                We undergo regular internal audits and maintain current alignment with industry standards. 
                Our compliance program includes:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Annual compliance reviews and risk assessments</li>
                <li>Regular policy updates based on regulatory changes</li>
                <li>Continuous security monitoring and testing</li>
                <li>Third-party vendor security assessments</li>
                <li>Staff training on compliance requirements</li>
                <li>Documentation and evidence retention</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">Data Subject Requests</h2>
              <p className="mb-4">
                All data subject access requests (DSARs) and other data protection requests are:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Routed to our privacy inbox for immediate triage</li>
                <li>Logged with unique request ID and timestamp</li>
                <li>Processed within the required 30-day timeframe</li>
                <li>Documented with outcomes for audit trail</li>
                <li>Escalated to Data Protection Officer when necessary</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">Contact Information</h2>
              <p className="mb-4">
                For questions about our compliance programs or specific regulatory requirements, 
                please contact:
              </p>
              <p className="font-medium mb-2">
                General Compliance: <a href="mailto:compliance@teamsmiths.ai" className="text-primary hover:underline">compliance@teamsmiths.ai</a>
              </p>
              <p className="font-medium">
                Data Protection: <a href="mailto:privacy@teamsmiths.ai" className="text-primary hover:underline">privacy@teamsmiths.ai</a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </>
  );
};

export default Compliance;
