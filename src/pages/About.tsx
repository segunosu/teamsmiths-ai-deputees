const About = () => {
  return (
    <div className="container mx-auto px-6 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-foreground mb-8">About Teamsmiths AI Deputees</h1>
        
        <div className="prose prose-lg max-w-none text-muted-foreground">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Our Mission</h2>
            <p>
              At Teamsmiths AI Deputees, we believe in the power of AI to transform businesses 
              and drive tangible results. Our mission is to help organizations harness the 
              potential of artificial intelligence to optimize operations, reduce waste, and 
              accelerate growth.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">What We Do</h2>
            <p>
              We provide AI-powered business solutions that deliver measurable outcomes. 
              Our services include:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>AI strategy and implementation</li>
              <li>Business process optimization</li>
              <li>Data analytics and insights</li>
              <li>Automated workflow solutions</li>
              <li>Performance measurement and improvement</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Our Approach</h2>
            <p>
              We focus on practical, results-driven solutions rather than theoretical concepts. 
              Every AI implementation is designed to deliver specific business value, whether 
              that's increasing revenue, reducing costs, or improving operational efficiency.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Why Choose Us</h2>
            <ul className="list-disc pl-6 mb-4">
              <li>Proven track record of successful AI implementations</li>
              <li>Focus on measurable business outcomes</li>
              <li>Expert team with deep industry knowledge</li>
              <li>Scalable solutions that grow with your business</li>
              <li>Comprehensive support and training</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Get in Touch</h2>
            <p>
              Ready to transform your business with AI? Contact us to learn more about 
              how we can help you achieve your goals.
            </p>
            <p className="mt-2">
              Email: hello@teamsmiths-ai-deputees.com
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default About;