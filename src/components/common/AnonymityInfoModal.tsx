import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Shield, Eye, EyeOff, CheckCircle } from 'lucide-react';

interface AnonymityInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AnonymityInfoModal: React.FC<AnonymityInfoModalProps> = ({
  isOpen,
  onClose
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            How anonymity works
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <EyeOff className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-sm">Your identity stays private</p>
              <p className="text-sm text-muted-foreground">
                Experts see only your project requirements and anonymized role badge (e.g., "Tech Startup Founder").
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <EyeOff className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-sm">Expert identities are hidden</p>
              <p className="text-sm text-muted-foreground">
                You see role badges and skills but not names or photos until you both agree to reveal.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <Eye className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-sm">Reveal when ready</p>
              <p className="text-sm text-muted-foreground">
                Choose to reveal your identity at any time, or it happens automatically when you accept a proposal.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-sm">Quality guaranteed</p>
              <p className="text-sm text-muted-foreground">
                All experts are vetted and have proven track records, even when anonymous.
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AnonymityInfoModal;