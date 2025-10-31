import { Helmet } from "react-helmet-async";

const TermsOfService = () => {
  const lastUpdated = "31 October 2025";
  
  return (
    <>
      <Helmet>
        <title>Terms of Service | Teamsmiths AI Deputees™</title>
        <meta name="description" content="Read the Terms of Service for Teamsmiths AI Deputees™ platform and services." />
        <link rel="canonical" href="https://teamsmiths.ai/terms" />
      </Helmet>
      
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-foreground mb-4">Terms of Service</h1>
          <p className="text-sm text-muted-foreground mb-8">
            Last updated: {lastUpdated}
          </p>
          
          <div className="prose prose-lg max-w-none text-muted-foreground">

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Agreement to Terms</h2>
            <p>
              By accessing and using Teamsmiths AI Deputees™ services, you accept and agree to 
              be bound by the terms and provision of this agreement.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Service Description</h2>
            <p>
              Teamsmiths AI Deputees™ provides AI-powered business solutions and consulting services 
              to help organizations optimize their operations and achieve better business outcomes.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">User Responsibilities</h2>
            <p>As a user of our services, you agree to:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Provide accurate and complete information</li>
              <li>Maintain the confidentiality of your account</li>
              <li>Use the services lawfully and ethically</li>
              <li>Respect intellectual property rights</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Payment Terms</h2>
            <p>
              Payment terms for our services are specified in individual service agreements. 
              All fees are non-refundable unless otherwise stated.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Limitation of Liability</h2>
            <p>
              In no event shall Teamsmiths AI Deputees™ be liable for any indirect, incidental, 
              special, consequential, or punitive damages.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Contact Information</h2>
            <p>
              For questions about these Terms of Service, please contact us at:
            </p>
            <p className="mt-2">
              Email: legal@teamsmiths.ai
            </p>
          </section>
          </div>
        </div>
      </div>
    </>
  );
};

export default TermsOfService;