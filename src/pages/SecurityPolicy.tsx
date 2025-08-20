const SecurityPolicy = () => {
  return (
    <div className="container mx-auto px-6 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-foreground mb-8">Security Policy</h1>
        
        <div className="prose prose-lg max-w-none text-muted-foreground">
          <p className="text-lg mb-6">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Our Commitment to Security</h2>
            <p>
              At Teamsmiths AI Deputees, we take data security seriously. We implement 
              industry-standard security measures to protect your information and maintain 
              the integrity of our services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Data Protection Measures</h2>
            <ul className="list-disc pl-6 mb-4">
              <li>End-to-end encryption for data in transit and at rest</li>
              <li>Multi-factor authentication for account access</li>
              <li>Regular security audits and penetration testing</li>
              <li>Secure cloud infrastructure with enterprise-grade security</li>
              <li>Employee background checks and security training</li>
              <li>Regular backup and disaster recovery procedures</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Compliance Standards</h2>
            <p>We adhere to major compliance frameworks including:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>GDPR (General Data Protection Regulation)</li>
              <li>SOC 2 Type II</li>
              <li>ISO 27001 standards</li>
              <li>Industry-specific compliance requirements</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Incident Response</h2>
            <p>
              In the event of a security incident, we have established procedures to:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Quickly identify and contain threats</li>
              <li>Assess and mitigate impact</li>
              <li>Notify affected parties within required timeframes</li>
              <li>Implement corrective measures</li>
              <li>Conduct post-incident reviews</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Reporting Security Issues</h2>
            <p>
              If you discover a security vulnerability, please report it to our security team:
            </p>
            <p className="mt-2">
              Email: security@teamsmiths-ai-deputees.com
            </p>
            <p className="mt-2">
              We appreciate responsible disclosure and will work with you to address any issues promptly.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default SecurityPolicy;