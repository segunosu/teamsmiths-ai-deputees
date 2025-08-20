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
            <h2 className="text-2xl font-semibold text-foreground mb-4">Production-Ready Security</h2>
            <p className="text-lg mb-6">
              Your data is protected with professional-grade safeguards designed to maintain 
              the highest standards of security and privacy.
            </p>
            
            <div className="bg-muted/30 p-6 rounded-lg mb-6">
              <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center">
                <span className="mr-3">🛡️</span>
                Professional Data Protection
              </h3>
              <p className="text-base text-muted-foreground">
                Enterprise-class security implementation without the enterprise complexity
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Security Implementation</h2>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li><strong>Encrypted data transmission</strong> with SSL/TLS security protocols</li>
              <li><strong>Row-level access controls</strong> ensuring complete data isolation</li>
              <li><strong>Role-based permissions</strong> with admin/user separation</li>
              <li><strong>Secure authentication</strong> with session management and configurable multi-factor options</li>
              <li><strong>Automated security enforcement</strong> preventing unauthorized data access</li>
              <li><strong>Database-level security policies</strong> with real-time access validation</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Privacy & Compliance</h2>
            <p>We implement privacy-first security measures including:</p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li><strong>GDPR-ready data policies</strong> with proper access controls and user consent management</li>
              <li><strong>Data ownership controls</strong> ensuring users can only access their own information</li>
              <li><strong>Secure data processing</strong> with encrypted storage and transmission</li>
              <li><strong>Transparent data practices</strong> with clear privacy policies</li>
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