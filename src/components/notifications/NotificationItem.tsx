import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Bell, 
  CheckCircle, 
  AlertCircle, 
  Mail, 
  CreditCard,
  Users,
  FileText,
  Calendar,
  MessageCircle
} from 'lucide-react';

interface Notification {
  id: string;
  type: string;
  title: string;
  body?: string;
  cta_text?: string;
  cta_url?: string;
  read_at?: string;
  created_at: string;
}

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onClose: () => void;
}

export function NotificationItem({ notification, onMarkAsRead, onClose }: NotificationItemProps) {
  const isUnread = !notification.read_at;
  
  const handleClick = () => {
    if (isUnread) {
      onMarkAsRead(notification.id);
    }
    
    if (notification.cta_url) {
      window.open(notification.cta_url, '_blank');
    }
    
    onClose();
  };

  const getIcon = () => {
    switch (notification.type) {
      case 'expert_invite_to_propose':
        return <Mail className="h-4 w-4 text-primary" />;
      case 'expert_proposal_won':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'client_proposals_ready':
        return <FileText className="h-4 w-4 text-accent" />;
      case 'payment_received_milestone':
        return <CreditCard className="h-4 w-4 text-success" />;
      case 'qa_passed_milestone':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'qa_failed_milestone':
        return <AlertCircle className="h-4 w-4 text-warning" />;
      case 'meeting_scheduled':
        return <Calendar className="h-4 w-4 text-primary" />;
      case 'chat_message_received':
        return <MessageCircle className="h-4 w-4 text-accent" />;
      default:
        return <Bell className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getTypeColor = () => {
    switch (notification.type) {
      case 'expert_proposal_won':
      case 'qa_passed_milestone':
      case 'payment_received_milestone':
        return 'success';
      case 'qa_failed_milestone':
        return 'warning';
      case 'expert_proposal_not_selected':
        return 'secondary';
      default:
        return 'primary';
    }
  };

  return (
    <div 
      className={`p-4 hover:bg-muted/50 transition-colors cursor-pointer ${
        isUnread ? 'bg-primary/5 border-l-2 border-l-primary' : ''
      }`}
      onClick={handleClick}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className={`text-sm font-medium truncate ${
              isUnread ? 'text-foreground' : 'text-muted-foreground'
            }`}>
              {notification.title}
            </p>
            {isUnread && (
              <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 ml-2" />
            )}
          </div>
          
          {notification.body && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {notification.body}
            </p>
          )}
          
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
            </span>
            
            {notification.cta_text && (
              <Button 
                variant="outline" 
                size="sm"
                className="text-xs h-6 px-2"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClick();
                }}
              >
                {notification.cta_text}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}