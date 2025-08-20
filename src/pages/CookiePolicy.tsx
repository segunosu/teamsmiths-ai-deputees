const CookiePolicy = () => {
  return (
    <div className="container mx-auto px-6 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-foreground mb-8">Cookie Policy</h1>
        
        <div className="prose prose-lg max-w-none text-muted-foreground">
          <p className="text-lg mb-6">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">What Are Cookies</h2>
            <p>
              Cookies are small text files that are stored on your device when you visit our website. 
              They help us provide you with a better experience and allow certain features to function properly.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Types of Cookies We Use</h2>
            
            <h3 className="text-xl font-medium text-foreground mb-2">Essential Cookies</h3>
            <p>These cookies are necessary for the website to function and cannot be disabled.</p>
            
            <h3 className="text-xl font-medium text-foreground mb-2">Analytics Cookies</h3>
            <p>We use these cookies to understand how visitors interact with our website.</p>
            
            <h3 className="text-xl font-medium text-foreground mb-2">Preference Cookies</h3>
            <p>These cookies remember your preferences and settings to enhance your experience.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Managing Cookies</h2>
            <p>
              You can control and manage cookies through your browser settings. However, 
              disabling certain cookies may impact the functionality of our website.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Contact Us</h2>
            <p>
              If you have questions about our use of cookies, please contact us at:
            </p>
            <p className="mt-2">
              Email: privacy@teamsmiths-ai-deputees.com
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default CookiePolicy;