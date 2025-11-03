import { Helmet } from "react-helmet-async";

const CookiePolicy = () => {
  const lastUpdated = "31 October 2025";
  
  return (
    <>
      <Helmet>
        <title>Cookie & Tracking Policy | Teamsmiths</title>
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
              
              <h3 className="text-xl font-medium text-foreground mb-3 mt-6">Strictly Necessary Cookies</h3>
              <p className="mb-4">
                These cookies are essential for our website to function properly. They enable core functionality 
                such as security, authentication, and network management. You cannot opt out of these cookies.
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li><strong>sb-access-token, sb-refresh-token</strong>: Authentication tokens for your session (Supabase). Expires after 7 days.</li>
                <li><strong>sb-auth-token</strong>: Session management cookie. Expires when you close your browser.</li>
                <li><strong>__Secure-session</strong>: Security token to prevent CSRF attacks. Expires after 24 hours.</li>
                <li><strong>load_balancer</strong>: Routes your requests to the correct server for optimal performance. Expires after 1 hour.</li>
              </ul>

              <h3 className="text-xl font-medium text-foreground mb-3 mt-6">Preference Cookies</h3>
              <p className="mb-4">
                These cookies remember your choices and settings to provide you with a more personalized experience 
                on repeat visits. Disabling these may require you to re-enter information.
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li><strong>user_locale</strong>: Remembers your language preference. Expires after 1 year.</li>
                <li><strong>cookie_preferences</strong>: Stores your cookie consent choices. Expires after 1 year.</li>
                <li><strong>theme_preference</strong>: Remembers if you prefer light or dark mode. Expires after 1 year.</li>
              </ul>

              <h3 className="text-xl font-medium text-foreground mb-3 mt-6">Analytics Cookies (Optional)</h3>
              <p className="mb-4">
                These cookies help us understand how visitors interact with our website by collecting and reporting 
                information anonymously. We only use these with your explicit consent.
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li><strong>_ga, _ga_*</strong>: Google Analytics cookies that track page views and user behavior. Expires after 2 years. Used to improve website performance and user experience.</li>
                <li><strong>_gid</strong>: Google Analytics cookie for distinguishing users. Expires after 24 hours.</li>
                <li><strong>analytics_session</strong>: Our internal analytics session ID. Expires after 30 minutes of inactivity.</li>
              </ul>
              <p className="mb-4 text-sm">
                To learn more about Google Analytics and privacy, visit:{" "}
                <a href="https://policies.google.com/privacy" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                  Google Privacy Policy
                </a>
              </p>

              <h3 className="text-xl font-medium text-foreground mb-3 mt-6">Marketing Cookies (Optional)</h3>
              <p className="mb-4">
                We do not currently use third-party marketing or advertising cookies. If we decide to use marketing 
                cookies in the future, we will only do so with your explicit consent and provide clear opt-out mechanisms.
              </p>
              <p className="mb-4">
                Any future marketing cookies would be used to:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Show you relevant advertisements based on your interests</li>
                <li>Measure the effectiveness of our advertising campaigns</li>
                <li>Prevent you from seeing the same ads repeatedly</li>
              </ul>
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
