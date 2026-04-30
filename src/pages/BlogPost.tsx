import React, { useEffect } from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CalendarDays, ArrowLeft, ArrowRight, Info } from 'lucide-react';
import { getArticleBySlug, articles } from '@/content/articles';

// Parse a single line of body text and return JSX nodes.
// Supports **bold** spans for emphasising numbers and engine names.
const renderInline = (text: string): React.ReactNode[] => {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="text-foreground font-semibold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
};

// Render the body string into structured paragraphs and section headings.
// Convention: a paragraph that starts with "## " is a section subheading.
const renderBody = (body: string): React.ReactNode => {
  const blocks = body.split(/\n\n+/).filter((b) => b.trim().length > 0);
  return blocks.map((block, idx) => {
    const trimmed = block.trim();
    if (trimmed.startsWith('## ')) {
      const headingText = trimmed.slice(3).trim();
      return (
        <h2
          key={idx}
          className="text-xl sm:text-2xl font-bold text-foreground mt-10 mb-4 leading-tight"
        >
          {renderInline(headingText)}
        </h2>
      );
    }
    return (
      <p
        key={idx}
        className="text-muted-foreground leading-relaxed mb-5 text-base sm:text-lg"
      >
        {renderInline(trimmed)}
      </p>
    );
  });
};

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const article = slug ? getArticleBySlug(slug) : undefined;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (!article) {
    return <Navigate to="/blog" replace />;
  }

  const currentIdx = articles.findIndex((a) => a.slug === article.slug);
  const prevArticle = currentIdx > 0 ? articles[currentIdx - 1] : null;
  const nextArticle = currentIdx < articles.length - 1 ? articles[currentIdx + 1] : null;

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{`${article.title} | Teamsmiths Case Study`}</title>
        <meta name="description" content={article.summary} />
      </Helmet>

      {/* Back link */}
      <div className="max-w-4xl mx-auto pt-8 px-4 sm:px-6 lg:px-8">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/blog" className="flex items-center text-muted-foreground hover:text-foreground">
            <ArrowLeft className="mr-2 h-4 w-4" />
            All case studies
          </Link>
        </Button>
      </div>

      {/* Article Hero */}
      <section className="py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <Badge variant="secondary">{article.category}</Badge>
            <Badge variant="outline" className="text-xs">
              {article.status}
            </Badge>
            <span className="flex items-center text-sm text-muted-foreground">
              <CalendarDays className="mr-1.5 h-3.5 w-3.5" />
              {new Date(article.date).toLocaleDateString('en-GB', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4 leading-[1.15]">
            {article.title}
          </h1>

          {article.subtitle && (
            <p className="text-xl text-muted-foreground font-medium leading-relaxed">
              {article.subtitle}
            </p>
          )}
        </div>
      </section>

      {/* Highlights — numbers POP */}
      {article.highlights && article.highlights.length > 0 && (
        <section className="px-4 sm:px-6 lg:px-8 mb-8">
          <div className="max-w-4xl mx-auto">
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-6">
                <p className="text-xs uppercase tracking-wider text-primary/80 font-semibold mb-4">
                  At a glance
                </p>
                <div
                  className={`grid gap-4 ${
                    article.highlights.length === 4
                      ? 'grid-cols-2 sm:grid-cols-4'
                      : 'grid-cols-2 sm:grid-cols-3'
                  }`}
                >
                  {article.highlights.map((h, i) => (
                    <div key={i} className="text-center sm:text-left">
                      <div className="text-2xl sm:text-3xl font-bold text-primary leading-tight">
                        {h.value}
                      </div>
                      <div className="text-xs sm:text-sm text-muted-foreground mt-1 leading-snug">
                        {h.label}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* Article Body */}
      <article className="px-4 sm:px-6 lg:px-8 pb-10">
        <div className="max-w-3xl mx-auto">
          {renderBody(article.body)}
        </div>
      </article>

      {/* Per-article disclaimer */}
      {article.disclaimer && (
        <section className="px-4 sm:px-6 lg:px-8 pb-10">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-start gap-3 text-xs text-muted-foreground/80 italic border-l-2 border-muted-foreground/20 pl-4 py-2">
              <Info className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
              <span>{article.disclaimer}</span>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
            Bring your problem. We'll design the engine.
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            90 minutes 1:1 with a senior business performance lead. £495 — fully credited to your first build if you proceed within 60 days.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link to="/outcome-sprints">
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

      {/* Prev/Next Navigation */}
      {(prevArticle || nextArticle) && (
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto grid sm:grid-cols-2 gap-4">
            {prevArticle ? (
              <Link to={`/blog/${prevArticle.slug}`} className="block">
                <Card className="h-full hover:shadow-md transition-all">
                  <CardContent className="p-5">
                    <div className="flex items-center text-xs text-muted-foreground mb-2">
                      <ArrowLeft className="mr-1.5 h-3 w-3" />
                      Previous
                    </div>
                    <div className="font-semibold text-foreground text-sm mb-1">
                      {prevArticle.title}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {prevArticle.category}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ) : (
              <div />
            )}
            {nextArticle ? (
              <Link to={`/blog/${nextArticle.slug}`} className="block">
                <Card className="h-full hover:shadow-md transition-all">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-end text-xs text-muted-foreground mb-2">
                      Next
                      <ArrowRight className="ml-1.5 h-3 w-3" />
                    </div>
                    <div className="font-semibold text-foreground text-sm mb-1 sm:text-right">
                      {nextArticle.title}
                    </div>
                    <div className="text-xs text-muted-foreground sm:text-right">
                      {nextArticle.category}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ) : (
              <div />
            )}
          </div>
        </section>
      )}
    </div>
  );
};

export default BlogPost;
