import { Link } from 'react-router-dom';
import { Separator } from '@/components/ui/separator';

export const Footer = () => {
  return (
    <footer className="bg-background border-t border-border">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Company</h3>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-muted-foreground hover:text-foreground transition-colors">About Us</Link></li>
              <li><Link to="/careers" className="text-muted-foreground hover:text-foreground transition-colors">Careers</Link></li>
              <li><Link to="/contact" className="text-muted-foreground hover:text-foreground transition-colors">Contact</Link></li>
              <li><Link to="/blog" className="text-muted-foreground hover:text-foreground transition-colors">Blog</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Services</h3>
            <ul className="space-y-2">
              <li><Link to="/for-clients" className="text-muted-foreground hover:text-foreground transition-colors">For Clients</Link></li>
              <li><Link to="/for-freelancers" className="text-muted-foreground hover:text-foreground transition-colors">For Freelancers</Link></li>
              <li><Link to="/for-agencies" className="text-muted-foreground hover:text-foreground transition-colors">For Agencies</Link></li>
              <li><Link to="/catalog" className="text-muted-foreground hover:text-foreground transition-colors">Browse Packs</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Support</h3>
            <ul className="space-y-2">
              <li><Link to="/help" className="text-muted-foreground hover:text-foreground transition-colors">Help Center</Link></li>
              <li><Link to="/faq" className="text-muted-foreground hover:text-foreground transition-colors">FAQ</Link></li>
              <li><Link to="/support" className="text-muted-foreground hover:text-foreground transition-colors">Contact Support</Link></li>
              <li><Link to="/documentation" className="text-muted-foreground hover:text-foreground transition-colors">Documentation</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><Link to="/privacy-policy" className="text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms-of-service" className="text-muted-foreground hover:text-foreground transition-colors">Terms of Service</Link></li>
              <li><Link to="/security-policy" className="text-muted-foreground hover:text-foreground transition-colors">Security Policy</Link></li>
              <li><Link to="/cookie-policy" className="text-muted-foreground hover:text-foreground transition-colors">Cookie Policy</Link></li>
              <li><Link to="/data-protection" className="text-muted-foreground hover:text-foreground transition-colors">Data Protection</Link></li>
              <li><Link to="/compliance" className="text-muted-foreground hover:text-foreground transition-colors">Compliance</Link></li>
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Partners Section */}
        <div className="mb-8">
          <h3 className="font-semibold text-foreground mb-6 text-center">Our Partners</h3>
          <div className="flex flex-col md:flex-row justify-center items-center gap-8">
            <div className="text-center">
              <div className="text-sm text-muted-foreground mb-2">Member of</div>
              <div className="font-medium text-foreground">Surrey Chambers of Commerce</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground mb-2">Supported by</div>
              <div className="font-medium text-foreground">Microsoft Founders Hub</div>
            </div>
          </div>
        </div>

        <Separator className="mb-8" />

        <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
          <div className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} Teamsmiths AI Deputees. All rights reserved.
          </div>
          
          {/* Social Media Icons */}
          <div className="flex items-center space-x-4">
            <a 
              href="https://www.youtube.com/@teamsmiths" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="YouTube"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </a>
            <a 
              href="https://www.linkedin.com/company/teamsmiths/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="LinkedIn"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </a>
            <a 
              href="https://x.com/theteamsmiths" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="X (Twitter)"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/>
              </svg>
            </a>
          </div>

          <div className="flex space-x-6 text-sm">
            <Link to="/accessibility" className="text-muted-foreground hover:text-foreground transition-colors">
              Accessibility
            </Link>
            <Link to="/sitemap" className="text-muted-foreground hover:text-foreground transition-colors">
              Sitemap
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};