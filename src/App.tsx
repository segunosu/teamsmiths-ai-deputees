import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { HelmetProvider } from "react-helmet-async";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { Navigation } from "@/components/ui/navigation";
import { Footer } from "@/components/Footer";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ScrollManager } from "@/components/ScrollManager";
import { PWAInstallPrompt } from "@/components/ui/pwa-install-prompt";
import AdminMatchingSettings from "@/components/admin/AdminMatchingSettings";
import AdminOnly from "@/components/admin/AdminOnly";
import CertificationsPage from "./pages/admin/CertificationsPage";
import CaseStudiesPage from "./pages/admin/CaseStudiesPage";
import ToolSuggestionsPage from "./pages/admin/ToolSuggestionsPage";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Catalog from "./pages/Catalog";
import ProductDetail from "./pages/ProductDetail";
import BriefBuilder from "./pages/BriefBuilder";
import BriefDetail from "./pages/BriefDetail";
import { BriefSubmitted } from "./pages/BriefSubmitted";
import DebugBrief from "./pages/DebugBrief";
import AIImpactScorecard from "./pages/AIImpactScorecard";
import AIImpactMaturity from "./pages/AIImpactMaturity";
import QuoteDetail from "./pages/QuoteDetail";
import ForClients from "./pages/ForClients";
import ForFreelancers from "./pages/ForFreelancers";
import FreelancerAuth from "./pages/FreelancerAuth";
import FreelancerDashboard from "./pages/FreelancerDashboard";
import FreelancerOnboarding from "./pages/FreelancerOnboarding";
import ForAgencies from "./pages/ForAgencies";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCanceled from "./pages/PaymentCanceled";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import AdminReports from "./pages/AdminReports";
import ProjectDetail from "./pages/ProjectDetail";
import { default as ExpertInviteDashboard } from "./components/ExpertInviteDashboard";
import QADashboard from "./pages/QADashboard";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Pricing from "./pages/Pricing";
import BusinessOutcomes from "./pages/BusinessOutcomes";
import Audit from "./pages/Audit";
import WorkWithUs from "./pages/WorkWithUs";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import SecurityPolicy from "./pages/SecurityPolicy";
import CookiePolicy from "./pages/CookiePolicy";
import DataProtection from "./pages/DataProtection";
import Compliance from "./pages/Compliance";
import NotFound from "./pages/NotFound";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import BusinessImpact from "./pages/BusinessImpact";
import Start from "./pages/Start";
import MotivationAndAppreciation from "./pages/MotivationAndAppreciation";
import Results from "./pages/Results";
import Resources from "./pages/Resources";
import AIDiagnostic from "./pages/AIDiagnostic";
import AISolutions from "./pages/AISolutions";
import PlansAndPricing from "./pages/PlansAndPricing";
import AddOns from "./pages/AddOns";
import OutcomeSprints from "./pages/OutcomeSprints";
import DiscoverySprintCheckout from "./pages/DiscoverySprintCheckout";
import ExampleProductionRiskSystem from "./pages/ExampleProductionRiskSystem";
import ExampleProjectRiskSystem from "./pages/ExampleProjectRiskSystem";
// AI Alpha OS — Agile AI Alpha module
import AlphaDashboard from "./agile-ai-alpha/pages/AlphaDashboard";
import AlphaCompanies from "./agile-ai-alpha/pages/AlphaCompanies";
import AlphaCompanyDetail from "./agile-ai-alpha/pages/AlphaCompanyDetail";
import AlphaValueLedger from "./agile-ai-alpha/pages/AlphaValueLedger";
import AlphaSettings from "./agile-ai-alpha/pages/AlphaSettings";
import AlphaCommandCentre from "./agile-ai-alpha/pages/AlphaCommandCentre";
import AlphaClients from "./agile-ai-alpha/pages/AlphaClients";
import AlphaClientWorkspace from "./agile-ai-alpha/pages/AlphaClientWorkspace";
import AlphaEngagement from "./agile-ai-alpha/pages/AlphaEngagement";
import AlphaPortfolio from "./agile-ai-alpha/pages/AlphaPortfolio";
import AlphaGovernance from "./agile-ai-alpha/pages/AlphaGovernance";

// Lazy load components
const Governance = React.lazy(() => import('./pages/Governance'));
const Plans = React.lazy(() => import('./pages/Plans'));
const ProofSprintCheckout = React.lazy(() => import('./pages/ProofSprintCheckout'));
const ProofSprintSuccess = React.lazy(() => import('./pages/ProofSprintSuccess'));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <HelmetProvider>
          <BrowserRouter>
            <div className="min-h-screen flex flex-col">
              <ScrollManager />
              <PWAInstallPrompt />
              <Navigation />
              <main id="main-content" className="flex-1" tabIndex={-1}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/start" element={<Start />} />
                  <Route path="/governance" element={
                    <React.Suspense fallback={<div>Loading...</div>}>
                      <ErrorBoundary>
                        <Governance />
                      </ErrorBoundary>
                    </React.Suspense>
                  } />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/plans" element={
                    <React.Suspense fallback={<div>Loading...</div>}>
                      <ErrorBoundary>
                        <Plans />
                      </ErrorBoundary>
                    </React.Suspense>
                  } />
                  
                  {/* Solutions is the main page - redirect pricing/plans to it */}
                  <Route path="/solutions" element={<AISolutions />} />
                  <Route path="/ai-solutions" element={<Navigate to="/solutions" replace />} />
                  <Route path="/plans-and-pricing" element={<Navigate to="/solutions" replace />} />
                  <Route path="/pricing" element={<Navigate to="/solutions" replace />} />
                  <Route path="/plan" element={<Navigate to="/solutions" replace />} />
                  
                  {/* Legacy redirects */}
                  <Route path="/navigator" element={<Navigate to="/solutions" replace />} />
                  <Route path="/navigator-packs" element={<Navigate to="/solutions" replace />} />
                  <Route path="/ai-navigator" element={<Navigate to="/solutions" replace />} />
                  <Route path="/proof-sprints" element={<Navigate to="/solutions" replace />} />
                  <Route path="/outcome-packs" element={<Navigate to="/solutions" replace />} />
                  <Route path="/business-outcomes" element={<Navigate to="/solutions" replace />} />
                  <Route path="/business-impact" element={<Navigate to="/solutions" replace />} />
                  
                  <Route path="/proof-sprint-success" element={
                    <React.Suspense fallback={<div>Loading...</div>}>
                      <ErrorBoundary>
                        <ProofSprintSuccess />
                      </ErrorBoundary>
                    </React.Suspense>
                  } />
                  
                  <Route path="/audit" element={<Audit />} />
                  <Route path="/add-ons" element={<AddOns />} />
                  <Route path="/work-with-us" element={<WorkWithUs />} />
                  <Route path="/ai-impact-maturity" element={<ErrorBoundary><AIImpactMaturity /></ErrorBoundary>} />
                  <Route path="/ai-impact-scorecard" element={<Navigate to="/ai-impact-maturity" replace />} />
                  <Route path="/catalog" element={<Catalog />} />
                  <Route path="/product/:id" element={<ProductDetail />} />
                  <Route path="/brief" element={<Navigate to="/brief-builder" replace />} />
                  <Route path="/brief-builder" element={<BriefBuilder />} />
                  <Route path="/brief-submitted" element={<BriefSubmitted />} />
                  <Route path="/debug/brief" element={<DebugBrief />} />
                  <Route path="/dashboard/briefs/:id" element={
                    <ErrorBoundary>
                      <BriefDetail />
                    </ErrorBoundary>
                  } />
                  <Route path="/quote/:id" element={<QuoteDetail />} />
                  <Route path="/dashboard" element={
                    <ErrorBoundary>
                      <Dashboard />
                    </ErrorBoundary>
                  } />
                  <Route path="/expert-invites" element={
                    <ErrorBoundary>
                      <ExpertInviteDashboard />
                    </ErrorBoundary>
                  } />
                  <Route path="/project/:id" element={<ProjectDetail />} />
                  <Route path="/for-clients" element={<ForClients />} />
                  <Route path="/for-freelancers" element={<ForFreelancers />} />
                  <Route path="/freelancer-auth" element={<FreelancerAuth />} />
                  <Route path="/freelancer-onboarding" element={<FreelancerOnboarding />} />
                  <Route path="/freelancer-dashboard" element={<FreelancerDashboard />} />
                  <Route path="/for-agencies" element={<ForAgencies />} />
                  <Route path="/payment-success" element={<PaymentSuccess />} />
                  <Route path="/payment-canceled" element={<PaymentCanceled />} />
                  <Route path="/admin" element={
                    <AdminOnly>
                      <AdminDashboard />
                    </AdminOnly>
                  } />
                  <Route path="/admin/matching/settings" element={
                    <AdminOnly>
                      <AdminMatchingSettings />
                    </AdminOnly>
                  } />
                  <Route path="/admin/certifications" element={<CertificationsPage />} />
                  <Route path="/admin/case-studies" element={<CaseStudiesPage />} />
                  <Route path="/admin/tools/suggestions" element={<ToolSuggestionsPage />} />
                  <Route path="/admin/reports" element={<AdminReports />} />
                  <Route path="/admin/qa" element={<QADashboard />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/blog" element={<Blog />} />
                  <Route path="/blog/:slug" element={<BlogPost />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/plan-confirmation" element={
                    <React.Suspense fallback={<div>Loading...</div>}>
                      <ErrorBoundary>
                        {React.createElement(React.lazy(() => import('./pages/PlanConfirmation')))}
                      </ErrorBoundary>
                    </React.Suspense>
                  } />
                  <Route path="/privacy" element={<PrivacyPolicy />} />
                  <Route path="/legal/privacy" element={<PrivacyPolicy />} />
                  <Route path="/terms" element={<TermsOfService />} />
                  <Route path="/legal/terms" element={<TermsOfService />} />
                  <Route path="/security" element={<SecurityPolicy />} />
                  <Route path="/security-policy" element={<SecurityPolicy />} />
                  <Route path="/cookies" element={<CookiePolicy />} />
                  <Route path="/cookie-policy" element={<CookiePolicy />} />
                  <Route path="/data-protection" element={<DataProtection />} />
                  <Route path="/compliance" element={<Compliance />} />
                  <Route path="/motivation-and-appreciation" element={<MotivationAndAppreciation />} />
                  <Route path="/results" element={<Results />} />
                  <Route path="/resources" element={<Navigate to="/blog" replace />} />
                  <Route path="/ai-diagnostic" element={<AIDiagnostic />} />
                  <Route path="/discovery-sprint" element={<OutcomeSprints />} />
                  <Route path="/discovery-sprint/checkout" element={<DiscoverySprintCheckout />} />
                  <Route path="/outcome-sprints" element={<Navigate to="/discovery-sprint" replace />} />
                  <Route path="/examples/order-risk-engine" element={<ExampleProductionRiskSystem />} />
                  <Route path="/examples/revenue-risk-engine" element={<ExampleProjectRiskSystem />} />

                  {/* AI Alpha OS — Agile AI Alpha (owner/admin only) */}
                  <Route path="/agile-ai-alpha" element={<AdminOnly><AlphaDashboard /></AdminOnly>} />
                  <Route path="/agile-ai-alpha/companies" element={<AdminOnly><AlphaCompanies /></AdminOnly>} />
                  <Route path="/agile-ai-alpha/companies/:id" element={<AdminOnly><AlphaCompanyDetail /></AdminOnly>} />
                  <Route path="/agile-ai-alpha/command-centre" element={<AdminOnly><AlphaCommandCentre /></AdminOnly>} />
                  <Route path="/agile-ai-alpha/clients" element={<AdminOnly><AlphaClients /></AdminOnly>} />
                  <Route path="/agile-ai-alpha/clients/:id" element={<AdminOnly><AlphaClientWorkspace /></AdminOnly>} />
                  <Route path="/agile-ai-alpha/engagements/:id" element={<AdminOnly><AlphaEngagement /></AdminOnly>} />
                  <Route path="/agile-ai-alpha/governance" element={<AdminOnly><AlphaGovernance /></AdminOnly>} />
                  <Route path="/agile-ai-alpha/portfolio" element={<AdminOnly><AlphaPortfolio /></AdminOnly>} />
                  <Route path="/agile-ai-alpha/value-ledger" element={<AdminOnly><AlphaValueLedger /></AdminOnly>} />
                  <Route path="/agile-ai-alpha/settings" element={<AdminOnly><AlphaSettings /></AdminOnly>} />

                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </BrowserRouter>
        </HelmetProvider>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
