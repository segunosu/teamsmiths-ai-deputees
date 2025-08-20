const Contact = () => {
  return (
    <div className="container mx-auto px-6 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-foreground mb-8">Contact Us</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-2xl font-semibold text-foreground mb-6">Get in Touch</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">General Inquiries</h3>
                <p className="text-muted-foreground">hello@teamsmiths.ai</p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">Sales</h3>
                <p className="text-muted-foreground">sales@teamsmiths.ai</p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">Support</h3>
                <p className="text-muted-foreground">support@teamsmiths.ai</p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">Partnership Opportunities</h3>
                <p className="text-muted-foreground">partnerships@teamsmiths.ai</p>
              </div>
            </div>
          </div>
          
          <div>
            <h2 className="text-2xl font-semibold text-foreground mb-6">Office Hours</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">Business Hours</h3>
                <p className="text-muted-foreground">Monday - Friday: 9:00 AM - 6:00 PM GMT</p>
                <p className="text-muted-foreground">Saturday - Sunday: Closed</p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">Response Time</h3>
                <p className="text-muted-foreground">We typically respond to inquiries within 24 hours during business days.</p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">Emergency Support</h3>
                <p className="text-muted-foreground">For urgent issues with existing projects, please contact your dedicated project manager directly.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;