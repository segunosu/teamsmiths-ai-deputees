import { Link } from 'react-router-dom';
import { Separator } from '@/components/ui/separator';

export const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Company */}
          <div>
            <h3 className="font-semibold mb-4 text-primary-foreground">Company</h3>
            <ul className="space-y-3">
              <li><Link to="/about" onClick={() => window.scrollTo(0, 0)} className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">About</Link></li>
              <li><Link to="/blog" onClick={() => window.scrollTo(0, 0)} className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">Blog</Link></li>
              <li><Link to="/brief-builder" onClick={() => window.scrollTo(0, 0)} className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">Brief</Link></li>
              <li><Link to="/contact" onClick={() => window.scrollTo(0, 0)} className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold mb-4 text-primary-foreground">Services</h3>
            <ul className="space-y-3">
              <li><Link to="/plan" onClick={() => window.scrollTo(0, 0)} className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">Plan</Link></li>
              <li><Link to="/solutions" onClick={() => window.scrollTo(0, 0)} className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">Business Uplift</Link></li>
              <li><Link to="/about" onClick={() => window.scrollTo(0, 0)} className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">About</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold mb-4 text-primary-foreground">Support</h3>
            <ul className="space-y-3">
              <li><Link to="/help" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">Help Center</Link></li>
              <li><Link to="/faq" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">FAQ</Link></li>
              <li><Link to="/support" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">Contact Support</Link></li>
              <li><Link to="/documentation" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">Documentation</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold mb-4 text-primary-foreground">Legal</h3>
            <ul className="space-y-3">
              <li><Link to="/legal/privacy" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">Privacy Policy</Link></li>
              <li><Link to="/legal/terms" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">Terms of Service</Link></li>
              <li><Link to="/security-policy" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">Security Policy</Link></li>
              <li><Link to="/cookie-policy" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">Cookie Policy</Link></li>
              <li><Link to="/data-protection" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">Data Protection</Link></li>
              <li><Link to="/compliance" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">Compliance</Link></li>
            </ul>
          </div>
        </div>

        {/* Logo Section */}
        <div className="flex justify-center items-center gap-16 mb-12 py-8 border-t border-primary-foreground/20">
          <div className="hover-scale">
            <img 
              src="/lovable-uploads/40ee8d8f-7bd2-4504-a87b-8c0974a9e7a0.png" 
              alt="Surrey Chambers of Commerce" 
              className="h-16 opacity-80 hover:opacity-100 transition-opacity filter brightness-0 invert"
            />
          </div>
          <div className="hover-scale">
            <img 
              src="/lovable-uploads/fb74cdcc-cb23-4eed-b8b0-2b3c4533467e.png" 
              alt="Microsoft Founders Hub" 
              className="h-16 opacity-80 hover:opacity-100 transition-opacity filter brightness-0 invert"
            />
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
            <div className="text-primary-foreground/70 text-sm">
              © {new Date().getFullYear()} Teamsmiths AI Deputees™. All rights reserved.
            </div>
            
            {/* Social Media Icons */}
            <div className="flex items-center space-x-6">
              <a 
                href="https://www.youtube.com/@teamsmiths" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary-foreground/70 hover:text-primary-foreground hover:scale-110 transition-all"
                aria-label="YouTube"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
              <a 
                href="https://www.linkedin.com/company/teamsmiths/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary-foreground/70 hover:text-primary-foreground hover:scale-110 transition-all"
                aria-label="LinkedIn"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
              <a 
                href="https://x.com/theteamsmiths" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary-foreground/70 hover:text-primary-foreground hover:scale-110 transition-all"
                aria-label="X (Twitter)"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/>
                </svg>
              </a>
            </div>

            <div className="flex space-x-6 text-sm">
              <Link to="/accessibility" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                Accessibility
              </Link>
              <Link to="/sitemap" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                Sitemap
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};