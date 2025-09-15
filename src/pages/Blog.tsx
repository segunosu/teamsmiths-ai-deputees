import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CalendarDays, Clock, ArrowRight } from 'lucide-react';

const Blog = () => {
  const posts = [
    {
      id: 1,
      title: 'The Future of AI-Powered Business Consulting',
      excerpt: 'How Deputee™ AI is transforming the way businesses approach strategic consulting and operational improvement.',
      date: '2024-01-15',
      readTime: '5 min read',
      category: 'AI & Technology',
      featured: true
    },
    {
      id: 2,
      title: 'Case Study: 300% Sales Increase in 8 Weeks',
      excerpt: 'Deep dive into how we helped a SaaS startup triple their sales using our Deputee™ AI methodology.',
      date: '2024-01-10',
      readTime: '8 min read',
      category: 'Case Studies',
      featured: false
    },
    {
      id: 3,
      title: 'Building Scalable Business Processes with AI',
      excerpt: 'A comprehensive guide to implementing AI-driven processes that grow with your business.',
      date: '2024-01-05',
      readTime: '6 min read',
      category: 'Business Strategy',
      featured: false
    }
  ];

  return (
    <div className="min-h-screen">
      <Helmet>
        <title>Blog - Teamsmiths</title>
        <meta name="description" content="Insights, case studies, and updates from the Teamsmiths team on AI-powered business consulting and strategic growth." />
      </Helmet>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-background via-accent/5 to-primary/10 py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-accent via-primary to-accent bg-clip-text text-transparent mb-8 leading-tight">
            Insights & Updates
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Stay updated with the latest insights on AI-powered business consulting, case studies, and strategic growth methodologies.
          </p>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <Card key={post.id} className={`shadow-lg hover:shadow-xl transition-all duration-300 ${post.featured ? 'md:col-span-2 lg:col-span-2' : ''}`}>
                <CardHeader>
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="secondary">{post.category}</Badge>
                    {post.featured && <Badge variant="default">Featured</Badge>}
                  </div>
                  <CardTitle className={`${post.featured ? 'text-2xl' : 'text-xl'} mb-3`}>
                    {post.title}
                  </CardTitle>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <CalendarDays className="h-4 w-4" />
                      <span>{new Date(post.date).toLocaleDateString('en-GB', { 
                        day: 'numeric', 
                        month: 'long', 
                        year: 'numeric' 
                      })}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{post.readTime}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    {post.excerpt}
                  </p>
                  <Button variant="outline" className="group">
                    Read More
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
            Stay in the Loop
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Get the latest insights on AI-powered business growth delivered to your inbox.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <input 
              type="email" 
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <Button className="px-8">Subscribe</Button>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            No spam, unsubscribe at any time.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Blog;