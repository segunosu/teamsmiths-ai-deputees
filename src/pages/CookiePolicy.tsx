import { Helmet } from "react-helmet-async";

const CookiePolicy = () => {
  const lastUpdated = "31 October 2025";
  
  return (
    <>
      <Helmet>
        <title>Cookie & Tracking Policy | Teamsmiths AI Deputees™</title>
        <meta name="description" content="Learn about how Teamsmiths uses cookies and tracking technologies to improve your experience." />
        <link rel="canonical" href="https://teamsmiths.ai/cookies" />
      </Helmet>
      
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-foreground mb-4">Cookie & Tracking Policy</h1>
          <p className="text-sm text-muted-foreground mb-8">
            Last updated: {lastUpdated}
          </p>
          
          <div className="prose prose-lg max-w-none text-muted-foreground">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">What We Use</h2>
              
              <h3 className="text-xl font-medium text-foreground mb-3 mt-6">Strictly Necessary</h3>
              <p className="mb-4">
                Essential cookies for authentication/session management, load balancing, and security. 
                These are always enabled and cannot be disabled as they are required for the site to function.
              </p>

              <h3 className="text-xl font-medium text-foreground mb-3 mt-6">Preferences</h3>
              <p className="mb-4">
                Optional cookies that remember your form progress and locale settings to enhance your experience 
                across visits.
              </p>

              <h3 className="text-xl font-medium text-foreground mb-3 mt-6">Analytics (Optional)</h3>
              <p className="mb-4">
                Aggregated, anonymized site usage data to help us understand how visitors interact with our 
                website and improve user experience. These are only used with your consent.
              </p>

              <h3 className="text-xl font-medium text-foreground mb-3 mt-6">Marketing (Optional)</h3>
              <p className="mb-4">
                If in use, marketing cookies are only deployed with your explicit consent and can be 
                disabled at any time.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">Your Choices</h2>
              <p className="mb-4">
                When you first visit our site, you'll see a cookie banner with granular controls allowing you to:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Accept all cookies</li>
                <li>Reject non-essential cookies</li>
                <li>Manage preferences individually by category</li>
              </ul>
              <p>
                You can change your cookie preferences at any time via the floating cookie icon on our site 
                or through your browser settings.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">Local Storage for Pre-fill</h2>
              <p>
                To improve your experience, we use browser local storage to remember your last-entered business 
                details (name, email, company) and automatically pre-fill forms on your next visit. This data:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Remains private to your device only</li>
                <li>Is never transmitted to our servers until you explicitly submit a form</li>
                <li>Can be cleared at any time from your browser settings</li>
                <li>Follows privacy-by-design principles</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">Browser Controls</h2>
              <p>
                Most browsers allow you to control cookies through their settings. You can typically:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>View which cookies are stored and delete them individually or all at once</li>
                <li>Block third-party cookies</li>
                <li>Block all cookies (note: this may impact site functionality)</li>
                <li>Delete cookies when you close your browser</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">Contact Us</h2>
              <p>
                If you have questions about our use of cookies and tracking technologies, please contact us at:
              </p>
              <p className="mt-2 font-medium">
                Email: <a href="mailto:privacy@teamsmiths.ai" className="text-primary hover:underline">privacy@teamsmiths.ai</a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </>
  );
};

export default CookiePolicy;
