import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CalendarDays, ArrowRight } from 'lucide-react';
import { articles } from '@/content/articles';

const Blog = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Featured: most recent (first in the list, which is The Player's Mind)
  const sorted = [...articles].sort((a, b) => (a.date < b.date ? 1 : -1));
  const featured = sorted[0];
  const rest = sorted.slice(1);

  return (
    <div className="min-h-screen">
      <Helmet>
        <title>Case Studies & Insights | Teamsmiths — Engines we've built and what they delivered</title>
        <meta
          name="description"
          content="Long-form case studies of every engine we've built or designed — Manufacturing Order Risk, Construction Revenue Risk, The Player's Mind, Songita, Calarossa Pool Pass, Council Tax Deputee, Meeting Intelligence."
        />
      </Helmet>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-background via-accent/5 to-primary/10 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <Badge variant="secondary" className="mb-4">Case studies & insights</Badge>
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-6 leading-[1.15]">
            Engines we've built. What they delivered.
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            What the buyer's problem was, how the engine solved it, and what it changed.
          </p>
        </div>
      </section>

      {/* Featured Post */}
      {featured && (
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <p className="text-xs uppercase tracking-wider text-muted-foreground/80 mb-4 text-center">
              Latest
            </p>
            <Link to={`/blog/${featured.slug}`} className="block">
              <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/40">
                <CardContent className="p-8 sm:p-10">
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <Badge>{featured.category}</Badge>
                    <Badge variant="outline" className="text-xs">
                      {featured.status}
                    </Badge>
                    <span className="flex items-center text-sm text-muted-foreground">
                      <CalendarDays className="mr-1.5 h-3.5 w-3.5" />
                      {new Date(featured.date).toLocaleDateString('en-GB', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-3">
                    {featured.title}
                  </h2>
                  {featured.subtitle && (
                    <p className="text-lg text-muted-foreground font-medium mb-4">
                      {featured.subtitle}
                    </p>
                  )}
                  <p className="text-muted-foreground mb-6 leading-relaxed">{featured.summary}</p>
                  <div className="flex items-center text-primary font-medium text-sm">
                    Read the full case study
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </section>
      )}

      {/* All Posts Grid */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-8 text-center">
            All case studies
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rest.map((article) => (
              <Link key={article.slug} to={`/blog/${article.slug}`} className="block">
                <Card className="h-full hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary/40 hover:border-l-primary">
                  <CardContent className="p-6">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <Badge variant="secondary" className="text-xs">
                        {article.category}
                      </Badge>
                      <span className="flex items-center text-xs text-muted-foreground">
                        <CalendarDays className="mr-1 h-3 w-3" />
                        {new Date(article.date).toLocaleDateString('en-GB', {
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-foreground mb-2 leading-tight">
                      {article.title}
                    </h3>
                    {article.subtitle && (
                      <p className="text-sm text-muted-foreground/90 font-medium mb-3 italic">
                        {article.subtitle}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                      {article.summary}
                    </p>
                    <Badge variant="outline" className="text-[10px] mb-3">
                      {article.status}
                    </Badge>
                    <div className="flex items-center text-primary text-sm font-medium">
                      Read case study
                      <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary/10 to-secondary/10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
            What would you build?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Pick a problem. We'll start designing the engine in a 90-minute Discovery Sprint and deliver the blueprint within days.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link to="/discovery-sprint">
                Book a Discovery Sprint — £495
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <a href="https://calendly.com/osu/brief-chat" target="_blank" rel="noopener noreferrer">
                Book a free 15-min chat
              </a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Blog;
