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
            <h2 className="text-2xl font-semibold text-foreground mb-4">Form Data and Preferences</h2>
            <p className="mb-4">
              When you complete a form on our website, we may store limited information such as your 
              name, email address, and company name to improve your experience.
            </p>
            <p className="mb-4">
              <strong>By default</strong>, this data is stored locally in your browser only and is 
              never transmitted to our servers until you explicitly submit a form.
            </p>
            <p className="mb-4">
              <strong>With your consent</strong>, we may securely store your contact details in our 
              systems to pre-fill future forms and maintain continuity between visits.
            </p>
            <p className="mb-4">
              You may withdraw your consent or request deletion of your data at any time by contacting 
              us at <a href="mailto:privacy@teamsmiths.ai" className="text-primary hover:underline">privacy@teamsmiths.ai</a>.
            </p>
            <p className="mb-4">
              We do not use this information for marketing or profiling without your explicit consent.
            </p>
            <p>
              This approach is fully aligned with the UK GDPR, EU GDPR, and similar global privacy regulations.
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