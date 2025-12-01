import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Heart, Users, TrendingUp, Sparkles, Calendar, Trophy, ArrowRight, Play } from 'lucide-react';
import { BusinesspackVideoModal } from '@/components/BusinesspackVideoModal';
import businesspackCover from '@/assets/businesspack-cover.png';

const VIDEOS = [
  {
    id: "v7",
    label: "Video 1",
    description: "Latest team appreciation example",
    src: "https://ukygyrtckglslreavnmb.supabase.co/storage/v1/object/public/B2B%20TEAM%20APPRECIATION/V7B2B%20TEAM%20EXAMPLE1_COMPRESSED.mp4",
  },
  {
    id: "v6",
    label: "Video 2",
    description: "Earlier BusinessPack example",
    src: "https://ukygyrtckglslreavnmb.supabase.co/storage/v1/object/public/B2B%20TEAM%20APPRECIATION/V6B2B%20TEAM%20EXAMPLE1_COMPRESSED.mp4",
  },
];

const MotivationAndAppreciation = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Helmet>
        <title>Motivation & Appreciation Layer | Teamsmiths</title>
        <meta name="description" content="Hand-built recognition program that turns your team's real stories into memorable songs and videos—designed to support morale, retention, and performance." />
        <meta name="keywords" content="team motivation, employee appreciation, team recognition, morale, retention, Songita BusinessPack" />
        <link rel="canonical" href={window.location.origin + '/motivation-and-appreciation'} />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Section 1: Hero / Intro */}
        <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-primary/5 to-background">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6">
              Motivation & Appreciation Layer for Your Team
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground mb-6 max-w-3xl mx-auto">
              A hand-built recognition program that turns your team's real stories and milestones into memorable songs and videos—designed to support morale, retention, and performance.
            </p>
            <p className="text-sm sm:text-base text-muted-foreground mb-8">
              Delivered as part of the Teamsmiths Uplift System, using our proprietary Songita BusinessPack method.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link to="/brief-builder">
                  Talk About Motivation For My Team
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/solutions">
                  See How Teamsmiths Works
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Section 2: Why motivation & appreciation */}
        <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground text-center mb-12">
              Why Add a Motivation & Appreciation Layer?
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="shadow-md hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <div className="mb-4 p-4 bg-primary/10 rounded-xl w-fit">
                    <Heart className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl mb-2">Lift morale and connection</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    Recognise real moments that matter with personalised songs and videos your team will actually want to share.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="shadow-md hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <div className="mb-4 p-4 bg-primary/10 rounded-xl w-fit">
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl mb-2">Improve retention and engagement</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    Support your core KPIs by making people feel seen, valued, and part of the story—not just a resource.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="shadow-md hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <div className="mb-4 p-4 bg-primary/10 rounded-xl w-fit">
                    <TrendingUp className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl mb-2">Amplify your business wins</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    Turn new systems, wins, and milestones into celebrations that reinforce the behaviours you want more of.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Section 3: What the layer includes */}
        <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground text-center mb-12">
              What's Included In The Motivation & Appreciation Layer
            </h2>
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <Sparkles className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                    <span className="text-base text-foreground">
                      <strong>Discovery session</strong> to understand your team, values, and key stories.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Calendar className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                    <span className="text-base text-foreground">
                      <strong>Planning of 3–6 meaningful recognition moments</strong> across your chosen period.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Heart className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                    <span className="text-base text-foreground">
                      <strong>Hand-built songs and/or video messages</strong> tailored to those people and events.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <TrendingUp className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                    <span className="text-base text-foreground">
                      <strong>Guidance on how and when to share them</strong> for maximum impact.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Trophy className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                    <span className="text-base text-foreground">
                      <strong>Optional metrics:</strong> simple feedback and impact check-in after each recognition.
                    </span>
                  </li>
                </ul>
                <p className="text-sm text-muted-foreground border-l-4 border-primary pl-4 py-2">
                  We deliver this using our Songita BusinessPack method, fully integrated into your Teamsmiths plan.
                </p>
              </div>
              <div className="relative rounded-2xl overflow-hidden shadow-xl group cursor-pointer max-w-md mx-auto lg:mx-0" onClick={() => setIsModalOpen(true)}>
                <img 
                  src={businesspackCover} 
                  alt="BusinessPack team celebration example" 
                  className="w-full h-auto object-cover"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 flex items-center justify-center transition-colors duration-300">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center mx-auto mb-4 transform group-hover:scale-110 transition-transform duration-300 animate-gentle-pulse">
                      <Play className="w-8 h-8 text-primary ml-1" />
                    </div>
                    <p className="text-white font-semibold text-lg">Watch Example Videos</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Example scenarios */}
        <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground text-center mb-12">
              How Teams Use This Layer
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="border-2 hover:border-primary/50 transition-all duration-300">
                <CardHeader>
                  <div className="mb-3 p-3 bg-primary/10 rounded-xl w-fit">
                    <Trophy className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">Celebrating a big delivery or quarter</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Personalised video-song for the team that shipped a major project.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-primary/50 transition-all duration-300">
                <CardHeader>
                  <div className="mb-3 p-3 bg-primary/10 rounded-xl w-fit">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">Welcoming new joiners</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Recognition that weaves their story into the team narrative.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-primary/50 transition-all duration-300">
                <CardHeader>
                  <div className="mb-3 p-3 bg-primary/10 rounded-xl w-fit">
                    <Heart className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">Recognising unsung heroes</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Spotlight for behind-the-scenes contributors.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
            <p className="text-sm text-muted-foreground text-center mt-8 max-w-2xl mx-auto">
              We design the specific moments with you as part of your outcome-focused plan.
            </p>
          </div>
        </section>

        {/* Section 5: How it fits into Teamsmiths */}
        <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground text-center mb-12">
              Where It Fits In Your Uplift System
            </h2>
            <div className="space-y-4">
              <Card className="border-2">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Core Process & Outcomes</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    Revenue, operations, and cost improvements.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Coaching & Growth (optional)</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    Help key people adopt new systems and habits.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="border-2 border-primary bg-primary/5">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Heart className="h-5 w-5 text-primary" />
                    Motivation & Appreciation Layer (optional)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    Songita-style recognition moments that support morale and retention.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
            <p className="text-base text-muted-foreground mt-8 max-w-3xl mx-auto">
              You can book this BusinessPack as a standalone recognition project (perfect for year‑end, milestones, and special teams) or include it as a motivation layer inside a wider Teamsmiths engagement.
            </p>
          </div>
        </section>

        {/* Section 6: Pricing & next steps */}
        <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground text-center mb-8">
              How Pricing Works
            </h2>
            <p className="text-lg text-muted-foreground text-center mb-6 max-w-2xl mx-auto">
              BusinessPack can be delivered as:
            </p>
            <div className="max-w-2xl mx-auto mb-10 space-y-3 text-center">
              <p className="text-base text-muted-foreground">
                <strong>A standalone fixed‑price recognition project</strong>, or
              </p>
              <p className="text-base text-muted-foreground">
                <strong>An optional 'Motivation & Appreciation' layer</strong> inside your broader Teamsmiths project.
              </p>
            </div>
            <p className="text-base text-muted-foreground text-center mb-10 max-w-2xl mx-auto">
              There's no subscription. We agree the recognition plan, deliverables, and timing up front.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
              <Button asChild size="lg">
                <Link to="/brief-builder?origin=businesspack">
                  Book a BusinessPack for My Team
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/brief-builder">
                  Talk About Motivation & Results
                </Link>
              </Button>
            </div>
            <p className="text-center">
              <Link to="/pricing" className="text-sm text-primary hover:underline">
                Or see plan & pricing options
              </Link>
            </p>
          </div>
        </section>
      </div>

      <BusinesspackVideoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        videos={VIDEOS}
        defaultVideoId="v7"
        coverImage={businesspackCover}
      />
    </>
  );
};

export default MotivationAndAppreciation;
