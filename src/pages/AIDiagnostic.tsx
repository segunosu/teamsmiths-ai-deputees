import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Brain,
  CheckCircle,
  Clock,
  Shield,
  Lock,
} from "lucide-react";
import { useAnalytics } from "@/hooks/useAnalytics";
import { Helmet } from "react-helmet-async";

const AIDiagnostic = () => {
  const { trackEvent } = useAnalytics();

  useEffect(() => {
    window.scrollTo(0, 0);
    trackEvent("ai_diagnostic_page_view" as any, { page: "ai-diagnostic" } as any);
  }, [trackEvent]);

  const assessmentBenefits = [
    "Identify your highest-impact AI opportunities",
    "Get a personalised AI adoption roadmap",
    "Understand your current AI readiness level",
    "Receive specific workflow recommendations",
    "Learn estimated ROI for each opportunity",
  ];

  return (
    <>
      <Helmet>
        <title>AI Diagnostic & Roadmap | Teamsmiths</title>
        <meta
          name="description"
          content="Take our free AI readiness assessment to get a personalised roadmap for AI adoption. Understand where AI can deliver the biggest impact for your business."
        />
        <meta
          name="keywords"
          content="AI assessment, AI readiness, business AI roadmap, AI diagnostic, SME AI"
        />
      </Helmet>

      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="py-12 sm:py-16 lg:py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <Badge className="mb-4">Free Assessment</Badge>
                <h1 className="text-3xl sm:text-5xl font-bold text-foreground mb-6 leading-[1.15]">
                  AI Diagnostic & Roadmap
                </h1>
                <p className="text-xl text-muted-foreground mb-8">
                  Discover where AI can deliver the biggest impact for your business. 
                  Our free assessment analyses your processes and generates a personalised AI adoption roadmap.
                </p>
                
                <div className="flex items-center gap-4 mb-8 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>7-10 minutes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    <span>Data protected</span>
                  </div>
                </div>

                <Button asChild size="lg" className="text-lg px-8 py-6 h-auto">
                  <Link to="/ai-impact-maturity">
                    Start Free Assessment
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>

              <div>
                <Card className="p-6 sm:p-8">
                  <CardHeader className="p-0 mb-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 bg-primary/10 rounded-xl">
                        <Brain className="h-8 w-8 text-primary" />
                      </div>
                      <CardTitle className="text-xl">What you'll discover</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <ul className="space-y-4">
                      {assessmentBenefits.map((benefit, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-12 sm:py-16 lg:py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4">
                How the Assessment Works
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Complete the assessment in three simple steps
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-5xl font-bold text-primary mb-4">1</div>
                <h3 className="text-xl font-semibold mb-2">Answer Questions</h3>
                <p className="text-muted-foreground">
                  Tell us about your business processes, challenges, and goals
                </p>
              </div>
              <div className="text-center">
                <div className="text-5xl font-bold text-primary mb-4">2</div>
                <h3 className="text-xl font-semibold mb-2">Get Your Score</h3>
                <p className="text-muted-foreground">
                  Receive your AI readiness score and opportunity analysis
                </p>
              </div>
              <div className="text-center">
                <div className="text-5xl font-bold text-primary mb-4">3</div>
                <h3 className="text-xl font-semibold mb-2">Book a Call</h3>
                <p className="text-muted-foreground">
                  Discuss your roadmap with an AI specialist
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Data Protection Note */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <Card className="p-6 border-2">
              <div className="flex items-start gap-4">
                <Shield className="h-8 w-8 text-primary flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold mb-2">Your Data is Protected</h3>
                  <p className="text-muted-foreground">
                    We take data protection seriously. Your assessment responses are encrypted and 
                    stored securely. We never share your information with third parties without your 
                    explicit consent. See our <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link> for details.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 sm:py-16 lg:py-24 px-4 sm:px-6 lg:px-8 bg-primary text-primary-foreground">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl sm:text-4xl font-bold mb-6">
              Ready to discover your AI opportunities?
            </h2>
            <p className="text-lg text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
              The assessment takes just 7-10 minutes and gives you actionable insights you can use immediately.
            </p>
            <Button asChild size="lg" variant="secondary" className="text-lg px-8 py-6 h-auto">
              <Link to="/ai-impact-maturity">
                Start Free Assessment
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </section>
      </div>
    </>
  );
};

export default AIDiagnostic;
