const Compliance = () => {
  return (
    <div className="container mx-auto px-6 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-foreground mb-8">Compliance</h1>
        
        <div className="prose prose-lg max-w-none text-muted-foreground">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Regulatory Compliance</h2>
            <p>
              Teamsmiths AI Deputees™ is committed to maintaining the highest standards of 
              regulatory compliance across all our operations and services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Standards We Follow</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-xl font-medium text-foreground mb-2">Data Protection</h3>
                <ul className="list-disc pl-6">
                  <li>GDPR (General Data Protection Regulation)</li>
                  <li>CCPA (California Consumer Privacy Act)</li>
                  <li>UK Data Protection Act 2018</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-xl font-medium text-foreground mb-2">Security Standards</h3>
                <ul className="list-disc pl-6">
                  <li>ISO 27001 Information Security</li>
                  <li>SOC 2 Type II</li>
                  <li>NIST Cybersecurity Framework</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-xl font-medium text-foreground mb-2">Quality Management</h3>
                <ul className="list-disc pl-6">
                  <li>ISO 9001 Quality Management</li>
                  <li>ITIL Service Management</li>
                  <li>Agile and DevOps best practices</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-xl font-medium text-foreground mb-2">Business Ethics</h3>
                <ul className="list-disc pl-6">
                  <li>Anti-corruption policies</li>
                  <li>Fair competition practices</li>
                  <li>Ethical AI principles</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Industry-Specific Compliance</h2>
            <p>
              We understand that different industries have specific regulatory requirements. 
              Our team works closely with clients to ensure compliance with sector-specific 
              regulations such as:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Financial Services: FCA, PCI DSS, Basel III</li>
              <li>Healthcare: HIPAA, FDA regulations</li>
              <li>Government: FedRAMP, FISMA</li>
              <li>Education: FERPA, COPPA</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Audit and Certification</h2>
            <p>
              We undergo regular third-party audits and maintain current certifications 
              to demonstrate our commitment to compliance. Our compliance program includes:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Annual compliance reviews</li>
              <li>Regular policy updates and improvements</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Compliance Questions</h2>
            <p>
              For questions about our compliance programs or specific regulatory requirements, 
              please contact our compliance team:
            </p>
            <p className="mt-2">
              Email: compliance@teamsmiths.ai
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Compliance;