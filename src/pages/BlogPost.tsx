import React, { useEffect } from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CalendarDays, ArrowLeft, ArrowRight } from 'lucide-react';
import { getArticleBySlug, articles } from '@/content/articles';

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const article = slug ? getArticleBySlug(slug) : undefined;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (!article) {
    return <Navigate to="/blog" replace />;
  }

  // Render body as paragraphs separated by blank lines
  const paragraphs = article.body.split(/\n\n+/).filter((p) => p.trim().length > 0);

  // Find next/prev articles for navigation
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
      <section className="py-12 px-4 sm:px-6 lg:px-8">
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

      {/* Article Body */}
      <article className="px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-3xl mx-auto">
          <div className="prose prose-neutral max-w-none">
            {paragraphs.map((para, idx) => (
              <p
                key={idx}
                className="text-muted-foreground leading-relaxed mb-5 text-base sm:text-lg"
              >
                {para}
              </p>
            ))}
          </div>
        </div>
      </article>

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
