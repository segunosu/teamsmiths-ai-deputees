import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  BookOpen,
  Brain,
  FileText,
  Lightbulb,
  TrendingUp,
} from "lucide-react";
import { useAnalytics } from "@/hooks/useAnalytics";
import { Helmet } from "react-helmet-async";

const Resources = () => {
  const { trackEvent } = useAnalytics();

  useEffect(() => {
    window.scrollTo(0, 0);
    trackEvent("resources_page_view" as any, { page: "resources" } as any);
  }, [trackEvent]);

  const blogPosts = [
    {
      id: 1,
      title: "Top 5 AI Workflows Every SME Should Automate First",
      excerpt: "Discover the highest-impact AI automations that deliver ROI within weeks, not months.",
      category: "Strategy",
      readTime: "5 min read",
    },
    {
      id: 2,
      title: "How to Measure AI ROI: A Practical Guide for Business Leaders",
      excerpt: "Learn how to track and demonstrate the business value of your AI investments.",
      category: "Measurement",
      readTime: "7 min read",
    },
    {
      id: 3,
      title: "CRM Automation: From Manual Follow-ups to AI-Powered Deal Closing",
      excerpt: "See how AI can transform your sales pipeline with intelligent lead nurturing.",
      category: "Sales AI",
      readTime: "6 min read",
    },
    {
      id: 4,
      title: "The SME Guide to Getting Started with AI",
      excerpt: "A step-by-step approach to AI adoption that doesn't require a massive budget or technical team.",
      category: "Getting Started",
      readTime: "8 min read",
    },
  ];

  return (
    <>
      <Helmet>
        <title>AI Resources & Insights | Teamsmiths</title>
        <meta
          name="description"
          content="AI insights, guides and tools for UK SMEs. Learn how to implement AI workflows, measure ROI, and scale automation across your business."
        />
        <meta
          name="keywords"
          content="AI resources, business AI guide, AI ROI, SME automation, AI insights"
        />
      </Helmet>

      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="py-12 sm:py-16 lg:py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <Badge className="mb-4">Resources</Badge>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-4 sm:mb-6 leading-[1.15]">
              AI Insights & Tools
            </h1>
            <p className="text-base sm:text-xl lg:text-2xl text-muted-foreground font-medium mb-8 sm:mb-10 max-w-4xl mx-auto leading-relaxed px-2">
              Practical guides, case studies, and tools to help you implement AI successfully
            </p>
          </div>
        </section>

        {/* AI Diagnostic Tool */}
        <section className="py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <Card className="bg-primary text-primary-foreground p-6 sm:p-10">
              <div className="flex flex-col lg:flex-row items-center gap-8">
                <div className="flex-1 text-center lg:text-left">
                  <div className="flex items-center justify-center lg:justify-start gap-2 mb-4">
                    <Brain className="h-8 w-8" />
                    <Badge variant="secondary">Free Tool</Badge>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold mb-4">AI Diagnostic & Roadmap</h2>
                  <p className="text-primary-foreground/80 mb-6 max-w-2xl">
                    Take our free AI readiness assessment to get a personalised roadmap for AI adoption. 
                    Understand where AI can deliver the biggest impact for your business in 7-10 minutes.
                  </p>
                  <Button asChild size="lg" variant="secondary" className="text-lg px-8">
                    <Link to="/ai-diagnostic">
                      Start Free Assessment
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                </div>
                <div className="flex-shrink-0">
                  <div className="bg-primary-foreground/10 rounded-2xl p-8">
                    <TrendingUp className="h-24 w-24 text-primary-foreground" />
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* Blog Section */}
        <section className="py-12 sm:py-16 lg:py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-2">
                  AI Insights Blog
                </h2>
                <p className="text-muted-foreground">
                  Practical guides and insights for implementing AI in your business
                </p>
              </div>
              <Button variant="outline" asChild className="hidden sm:flex">
                <Link to="/blog">
                  View all articles
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {blogPosts.map((post) => (
                <Card key={post.id} className="hover:shadow-lg transition-all duration-300">
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary">{post.category}</Badge>
                      <span className="text-sm text-muted-foreground">{post.readTime}</span>
                    </div>
                    <CardTitle className="text-xl">{post.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base mb-4">{post.excerpt}</CardDescription>
                    <Button variant="link" className="p-0 h-auto" asChild>
                      <Link to="/blog">
                        Read article
                        <ArrowRight className="ml-1 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center mt-8 sm:hidden">
              <Button variant="outline" asChild>
                <Link to="/blog">
                  View all articles
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Additional Resources */}
        <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-8 text-center">
              More Resources
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="text-center p-6 hover:shadow-lg transition-all duration-300">
                <BookOpen className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle className="text-lg mb-2">AI Case Studies</CardTitle>
                <CardDescription className="mb-4">
                  See real results from businesses using our AI workflows
                </CardDescription>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/results">View case studies</Link>
                </Button>
              </Card>

              <Card className="text-center p-6 hover:shadow-lg transition-all duration-300">
                <Lightbulb className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle className="text-lg mb-2">AI Solutions</CardTitle>
                <CardDescription className="mb-4">
                  Explore our productised AI workflow packages
                </CardDescription>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/solutions">See solutions</Link>
                </Button>
              </Card>

              <Card className="text-center p-6 hover:shadow-lg transition-all duration-300">
                <FileText className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle className="text-lg mb-2">Pricing</CardTitle>
                <CardDescription className="mb-4">
                  Transparent pricing for all our AI services
                </CardDescription>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/pricing">View pricing</Link>
                </Button>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 sm:py-16 lg:py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl sm:text-4xl font-bold text-foreground mb-6">
              Ready to start your AI journey?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Book a free AI diagnostic call and get personalised recommendations for your business.
            </p>
            <Button asChild size="lg" className="text-lg px-8 py-6 h-auto">
              <a href="https://calendly.com/osu/brief-chat" target="_blank" rel="noopener noreferrer">
                Book your free AI diagnostic
                <ArrowRight className="ml-2 h-5 w-5" />
              </a>
            </Button>
          </div>
        </section>
      </div>
    </>
  );
};

export default Resources;
