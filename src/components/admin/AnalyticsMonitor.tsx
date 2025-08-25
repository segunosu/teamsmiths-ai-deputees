import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Activity, TrendingUp, Users, Target, Bot } from 'lucide-react';

interface AnalyticsEvent {
  event: string;
  properties: Record<string, any>;
  timestamp: string;
  url: string;
}

const AnalyticsMonitor = () => {
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);

  useEffect(() => {
    if (!isMonitoring) return;

    // Override console.log to capture analytics events
    const originalConsoleLog = console.log;
    
    const captureAnalytics = (...args: any[]) => {
      originalConsoleLog(...args);
      
      if (args[0] === '📊 Analytics Event:' && args[1]) {
        const eventData = args[1] as AnalyticsEvent;
        setEvents(prev => [eventData, ...prev.slice(0, 49)]); // Keep last 50 events
      }
    };

    console.log = captureAnalytics;

    return () => {
      console.log = originalConsoleLog;
    };
  }, [isMonitoring]);

  const getEventIcon = (eventName: string) => {
    if (eventName.includes('ai_processed')) return <Bot className="h-4 w-4 text-blue-500" />;
    if (eventName.includes('intent')) return <Target className="h-4 w-4 text-green-500" />;
    if (eventName.includes('submit')) return <Users className="h-4 w-4 text-purple-500" />;
    if (eventName.includes('proposal')) return <TrendingUp className="h-4 w-4 text-orange-500" />;
    return <Activity className="h-4 w-4 text-gray-500" />;
  };

  const getEventColor = (eventName: string) => {
    if (eventName.includes('ai_processed')) return 'bg-blue-100 text-blue-800';
    if (eventName.includes('intent')) return 'bg-green-100 text-green-800';
    if (eventName.includes('submit')) return 'bg-purple-100 text-purple-800';
    if (eventName.includes('proposal')) return 'bg-orange-100 text-orange-800';
    return 'bg-gray-100 text-gray-800';
  };

  const clearEvents = () => setEvents([]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Live Analytics Monitor
            </CardTitle>
            <CardDescription>
              Real-time tracking of brief builder and user interactions
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant={isMonitoring ? "destructive" : "default"}
              size="sm"
              onClick={() => setIsMonitoring(!isMonitoring)}
            >
              {isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
            </Button>
            <Button variant="outline" size="sm" onClick={clearEvents}>
              Clear
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!isMonitoring && (
          <div className="text-center py-8 text-muted-foreground">
            <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Click "Start Monitoring" to capture analytics events</p>
            <p className="text-sm mt-2">Navigate to the Brief Builder to see events in action</p>
          </div>
        )}

        {isMonitoring && events.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Monitoring active - waiting for events...</p>
            <p className="text-sm mt-2">Try using the Brief Builder to generate events</p>
          </div>
        )}

        {events.length > 0 && (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {events.map((event, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                <div className="mt-0.5">
                  {getEventIcon(event.event)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className={getEventColor(event.event)}>
                      {event.event}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  {Object.keys(event.properties).length > 0 && (
                    <div className="text-sm text-muted-foreground">
                      <code className="text-xs bg-background px-1 rounded">
                        {JSON.stringify(event.properties, null, 0)}
                      </code>
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground mt-1">
                    {event.url.replace(window.location.origin, '')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {isMonitoring && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 text-green-800">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">Analytics monitoring active</span>
            </div>
            <p className="text-xs text-green-700 mt-1">
              Events are being captured and displayed in real-time
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AnalyticsMonitor;