const DataProtection = () => {
  return (
    <div className="container mx-auto px-6 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-foreground mb-8">Data Protection</h1>
        
        <div className="prose prose-lg max-w-none text-muted-foreground">
          <p className="text-lg mb-6">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Our Commitment to Data Protection</h2>
            <p>
              We are committed to protecting your personal data and respecting your privacy rights. 
              This page outlines our data protection practices and your rights under applicable 
              data protection laws, including GDPR.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Your Data Protection Rights</h2>
            <p>Under data protection law, you have rights including:</p>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Right to access</strong> - You can request copies of your personal data</li>
              <li><strong>Right to rectification</strong> - You can request correction of inaccurate data</li>
              <li><strong>Right to erasure</strong> - You can request deletion of your personal data</li>
              <li><strong>Right to restrict processing</strong> - You can request that we limit processing</li>
              <li><strong>Right to data portability</strong> - You can request transfer of your data</li>
              <li><strong>Right to object</strong> - You can object to certain types of processing</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Data Processing Legal Basis</h2>
            <p>We process your personal data under the following legal bases:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Performance of a contract</li>
              <li>Legitimate interests</li>
              <li>Legal obligation</li>
              <li>Consent (where applicable)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Data Retention</h2>
            <p>
              We retain personal data only for as long as necessary to fulfill the purposes 
              for which it was collected, comply with legal obligations, resolve disputes, 
              and enforce our agreements.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">International Transfers</h2>
            <p>
              When we transfer personal data outside the EEA, we ensure appropriate safeguards 
              are in place, such as adequacy decisions or standard contractual clauses.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Contact Our Data Protection Officer</h2>
            <p>
              To exercise your rights or for any data protection queries, contact our DPO:
            </p>
            <p className="mt-2">
              Email: dpo@teamsmiths.ai
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default DataProtection;