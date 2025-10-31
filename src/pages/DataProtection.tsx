import { Helmet } from "react-helmet-async";

const DataProtection = () => {
  const lastUpdated = "31 October 2025";
  
  return (
    <>
      <Helmet>
        <title>Data Protection & Your Rights | Teamsmiths AI Deputees™</title>
        <meta name="description" content="Understand your data protection rights under GDPR and how Teamsmiths processes and protects your personal information." />
        <link rel="canonical" href="https://teamsmiths.ai/data-protection" />
      </Helmet>
      
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-foreground mb-4">Data Protection & Your Rights</h1>
          <p className="text-sm text-muted-foreground mb-8">
            Last updated: {lastUpdated}
          </p>
          
          <div className="prose prose-lg max-w-none text-muted-foreground">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">Lawful Bases for Processing</h2>
              <p className="mb-4">
                We process your personal data under the following lawful bases as required by UK GDPR and EU GDPR:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li><strong>Legitimate Interests:</strong> B2B enquiry fulfilment, service delivery, and personalization</li>
                <li><strong>Contract:</strong> To perform our contractual obligations when you engage our services</li>
                <li><strong>Consent:</strong> For optional marketing communications and analytics (where applicable)</li>
                <li><strong>Legal Obligation:</strong> When required to comply with applicable laws and regulations</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">Your Rights Explained</h2>
              <p className="mb-4">Under UK and EU data protection law, you have the following rights:</p>
              
              <h3 className="text-xl font-medium text-foreground mb-3 mt-6">Right to Access</h3>
              <p className="mb-4">
                You can request copies of your personal data. We'll provide this information in a commonly 
                used electronic format.
              </p>

              <h3 className="text-xl font-medium text-foreground mb-3 mt-6">Right to Rectification</h3>
              <p className="mb-4">
                You can request correction of any inaccurate or incomplete personal data we hold about you.
              </p>

              <h3 className="text-xl font-medium text-foreground mb-3 mt-6">Right to Erasure</h3>
              <p className="mb-4">
                You can request deletion of your personal data in certain circumstances, such as when it's 
                no longer necessary for the purpose it was collected.
              </p>

              <h3 className="text-xl font-medium text-foreground mb-3 mt-6">Right to Restrict Processing</h3>
              <p className="mb-4">
                You can request that we limit how we process your personal data in certain situations.
              </p>

              <h3 className="text-xl font-medium text-foreground mb-3 mt-6">Right to Data Portability</h3>
              <p className="mb-4">
                You can request transfer of your data to another service provider in a structured, 
                machine-readable format.
              </p>

              <h3 className="text-xl font-medium text-foreground mb-3 mt-6">Right to Object</h3>
              <p className="mb-4">
                You can object to processing based on legitimate interests or for direct marketing purposes.
              </p>

              <h3 className="text-xl font-medium text-foreground mb-3 mt-6">Rights Related to Automated Decision-Making</h3>
              <p className="mb-4">
                You have the right not to be subject to decisions based solely on automated processing that 
                significantly affect you.
              </p>

              <p className="mt-6 font-medium">
                How to exercise your rights: Email{' '}
                <a href="mailto:privacy@teamsmiths.ai" className="text-primary hover:underline">privacy@teamsmiths.ai</a>. 
                We respond to all requests within 30 days.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">Data Processing Addendum (DPA) & Standard Contractual Clauses (SCCs)</h2>
              <p className="mb-4">
                For business clients requiring formal data processing agreements, we offer a comprehensive DPA that:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Incorporates Standard Contractual Clauses (SCCs) or UK International Data Transfer Addendum (IDTA)</li>
                <li>Details our subprocessors and their security measures</li>
                <li>Outlines technical and organisational measures we implement</li>
                <li>Specifies data retention and deletion procedures</li>
              </ul>
              <p>
                To request a DPA, please contact{' '}
                <a href="mailto:privacy@teamsmiths.ai" className="text-primary hover:underline">privacy@teamsmiths.ai</a>.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">Data Retention</h2>
              <p>
                We retain personal data only for as long as necessary to fulfill the purposes for which it 
                was collected, comply with legal obligations, resolve disputes, and enforce our agreements. 
                Specific retention periods vary by data type:
              </p>
              <ul className="list-disc pl-6 mb-4 mt-4">
                <li><strong>Form submissions:</strong> Duration of business relationship plus 1 year, or until erasure requested</li>
                <li><strong>Project data:</strong> Duration of project plus required retention period for contractual/legal purposes</li>
                <li><strong>Analytics:</strong> 26 months maximum (aggregated and anonymized)</li>
                <li><strong>Audit logs:</strong> As required by security and compliance policies</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">International Data Transfers</h2>
              <p className="mb-4">
                When we transfer personal data outside the UK/EEA, we ensure appropriate safeguards are in place:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Standard Contractual Clauses (SCCs) approved by the European Commission</li>
                <li>UK International Data Transfer Addendum (IDTA)</li>
                <li>Adequacy decisions where applicable</li>
                <li>Additional technical measures such as encryption</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">Supervisory Authority</h2>
              <p className="mb-4">
                If you're not satisfied with how we've handled your data protection query, you have the right 
                to lodge a complaint with your local supervisory authority:
              </p>
              <p className="mb-2">
                <strong>UK:</strong> Information Commissioner's Office (ICO)<br />
                Website: <a href="https://ico.org.uk" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">ico.org.uk</a><br />
                Phone: 0303 123 1113
              </p>
              <p className="mt-4">
                <strong>EU:</strong> Your local Data Protection Authority<br />
                Find your authority: <a href="https://edpb.europa.eu/about-edpb/about-edpb/members_en" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">EDPB Member List</a>
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">Contact Our Data Protection Officer</h2>
              <p>
                For any data protection queries or to exercise your rights, please contact:
              </p>
              <p className="mt-2 font-medium">
                Email: <a href="mailto:privacy@teamsmiths.ai" className="text-primary hover:underline">privacy@teamsmiths.ai</a>
              </p>
              <p className="mt-2 text-sm">
                We maintain detailed logs of all data subject requests including request ID, timestamp, 
                and outcome for compliance purposes.
              </p>
            </section>
          </div>
        </div>
      </div>
    </>
  );
};

export default DataProtection;
