const PrivacyPolicy = () => {
  return (
    <div className="container mx-auto px-6 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-foreground mb-8">Privacy Policy</h1>
        
        <div className="prose prose-lg max-w-none text-muted-foreground">
          <p className="text-lg mb-6">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Introduction</h2>
            <p>
              Teamsmiths AI Deputees™ ("we," "our," or "us") is committed to protecting your privacy. 
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information 
              when you visit our website or use our services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Information We Collect</h2>
            <h3 className="text-xl font-medium text-foreground mb-2">Personal Information</h3>
            <p>We may collect personal information such as:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Name and contact information</li>
              <li>Account credentials</li>
              <li>Payment information</li>
              <li>Professional information</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Form Submissions & Data Processing</h2>
            
            <h3 className="text-xl font-medium text-foreground mb-3 mt-6">Data You Provide</h3>
            <p className="mb-4">
              When you complete a form on any Teamsmiths or Deputee website, we collect only the business 
              information you choose to share — typically your name, company, role, email address, and answers 
              relevant to the service or assessment you've requested.
            </p>

            <h3 className="text-xl font-medium text-foreground mb-3 mt-6">How We Use It</h3>
            <p className="mb-2">Your details are used to:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Deliver the resource, report, or AI analysis you requested (e.g. AI Impact Score)</li>
              <li>Personalize your experience and show relevant content or follow-up options</li>
              <li>Maintain service records, analytics, and security logs for legitimate business purposes</li>
            </ul>
            <p className="mb-4">
              We do not sell or rent personal data, and we never use information from these forms for 
              unrelated marketing without a clear, separate opt-in.
            </p>

            <h3 className="text-xl font-medium text-foreground mb-3 mt-6">Legal Basis</h3>
            <p className="mb-4">
              We process this data under <strong>legitimate interest</strong> — to respond to your enquiry, 
              deliver requested results, and maintain the quality and security of our services. This lawful 
              basis applies to all B2B and professional contacts who reasonably expect communication after 
              submitting a business form.
            </p>

            <h3 className="text-xl font-medium text-foreground mb-3 mt-6">Data Storage</h3>
            <p className="mb-4">
              Data is securely stored using encrypted, GDPR-compliant services (Supabase and associated cloud 
              infrastructure). Local browser storage may be used to pre-fill forms for your convenience; this 
              data remains private to your device and can be cleared anytime from your browser settings.
            </p>

            <h3 className="text-xl font-medium text-foreground mb-3 mt-6">Retention</h3>
            <p className="mb-4">
              We retain form data only as long as necessary to fulfil the stated purpose or maintain ongoing 
              business contact, after which it is securely deleted or anonymised.
            </p>

            <h3 className="text-xl font-medium text-foreground mb-3 mt-6">Your Rights</h3>
            <p className="mb-4">
              You can request access, correction, or deletion of your data, or object to processing, by 
              contacting us at{' '}
              <a href="mailto:privacy@teamsmiths.ai" className="text-primary hover:underline">
                privacy@teamsmiths.ai
              </a>.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Provide and maintain our services</li>
              <li>Process transactions</li>
              <li>Communicate with you</li>
              <li>Improve our services</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Data Security</h2>
            <p>
              We implement appropriate technical and organizational security measures to protect 
              your personal information against unauthorized access, alteration, disclosure, or destruction.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at:
            </p>
            <p className="mt-2">
              Email: privacy@teamsmiths.ai
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;