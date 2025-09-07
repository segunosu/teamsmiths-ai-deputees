import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { Navigation } from "@/components/ui/navigation";
import { Footer } from "@/components/Footer";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import AdminMatchingSettings from "@/components/admin/AdminMatchingSettings";
import AdminOnly from "@/components/admin/AdminOnly";
import CertificationsPage from "./pages/admin/CertificationsPage";
import CaseStudiesPage from "./pages/admin/CaseStudiesPage";
import ToolSuggestionsPage from "./pages/admin/ToolSuggestionsPage";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Catalog from "./pages/Catalog";
import ProductDetail from "./pages/ProductDetail";
import DeputeeAIBriefBuilder from "./components/DeputeeAIBriefBuilder";
import BriefDetail from "./pages/BriefDetail";
import { BriefSubmitted } from "./pages/BriefSubmitted";
import DebugBrief from "./pages/DebugBrief";
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
import Outcomes from "./pages/Outcomes";
import Plans from "./pages/Plans";
import AINavigator from "./pages/AINavigator";
import ProofSprintCheckout from "./pages/ProofSprintCheckout";
import ProofSprintSuccess from "./pages/ProofSprintSuccess";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import SecurityPolicy from "./pages/SecurityPolicy";
import CookiePolicy from "./pages/CookiePolicy";
import DataProtection from "./pages/DataProtection";
import Compliance from "./pages/Compliance";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen flex flex-col">
            <Navigation />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/outcomes" element={<Outcomes />} />
                <Route path="/plans" element={<Plans />} />
                <Route path="/ai-navigator" element={<AINavigator />} />
                <Route path="/proof-sprints/checkout" element={<ProofSprintCheckout />} />
                <Route path="/proof-sprints/success" element={<ProofSprintSuccess />} />
                <Route path="/catalog" element={<Catalog />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/customize" element={<DeputeeAIBriefBuilder />} />
                <Route path="/customize/:id" element={<DeputeeAIBriefBuilder />} />
                <Route path="/brief-builder" element={<DeputeeAIBriefBuilder />} />
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
                <Route path="/contact" element={<Contact />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/terms-of-service" element={<TermsOfService />} />
                <Route path="/security-policy" element={<SecurityPolicy />} />
                <Route path="/cookie-policy" element={<CookiePolicy />} />
                <Route path="/data-protection" element={<DataProtection />} />
                <Route path="/compliance" element={<Compliance />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
