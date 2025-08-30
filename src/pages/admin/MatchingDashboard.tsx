import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Settings, 
  RefreshCw, 
  Save,
  Users,
  Sliders,
  Brain,
  Target
} from 'lucide-react';

interface MatchingWeights {
  skills: number;
  rating: number;
  price: number;
  availability: number;
}

interface CuratedMatch {
  expertId: string;
  roleBadge: string;
  confidenceScore: number;
  isManuallyAdded: boolean;
}

interface MatchingDashboardProps {
  crId?: string;
  onWeightsChange?: (weights: MatchingWeights) => void;
  onRerun?: (crId: string) => Promise<void>;
  onSaveCurated?: (crId: string, matches: CuratedMatch[]) => Promise<void>;
}

export const MatchingDashboard: React.FC<MatchingDashboardProps> = ({
  crId,
  onWeightsChange,
  onRerun,
  onSaveCurated
}) => {
  const [weights, setWeights] = useState<MatchingWeights>({
    skills: 40,
    rating: 25,
    price: 20,
    availability: 15
  });
  
  const [algorithmVersion, setAlgorithmVersion] = useState('v2.1.3');
  const [curatedMatches, setCuratedMatches] = useState<CuratedMatch[]>([]);
  const [isRerunning, setIsRerunning] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [expertSearch, setExpertSearch] = useState('');
  const [autoRerun, setAutoRerun] = useState(false);

  // Normalize weights to ensure they sum to 100%
  const normalizeWeights = (newWeights: Partial<MatchingWeights>) => {
    const updated = { ...weights, ...newWeights };
    const total = Object.values(updated).reduce((sum, val) => sum + val, 0);
    
    if (total === 100) return updated;
    
    // Proportionally adjust other weights
    const factor = 100 / total;
    return {
      skills: Math.round(updated.skills * factor),
      rating: Math.round(updated.rating * factor),
      price: Math.round(updated.price * factor),
      availability: Math.round(updated.availability * factor)
    };
  };

  const handleWeightChange = (key: keyof MatchingWeights, value: number[]) => {
    const newWeights = normalizeWeights({ [key]: value[0] });
    setWeights(newWeights);
    
    if (onWeightsChange) {
      onWeightsChange(newWeights);
    }
    
    if (autoRerun && crId) {
      handleRerun();
    }
  };

  const handleRerun = async () => {
    if (!crId || !onRerun) return;
    
    setIsRerunning(true);
    try {
      await onRerun(crId);
    } finally {
      setIsRerunning(false);
    }
  };

  const handleSaveCurated = async () => {
    if (!crId || !onSaveCurated) return;
    
    setIsSaving(true);
    try {
      await onSaveCurated(crId, curatedMatches);
    } finally {
      setIsSaving(false);
    }
  };

  const addExpertToCurated = (expertData: any) => {
    const newMatch: CuratedMatch = {
      expertId: expertData.id,
      roleBadge: expertData.role,
      confidenceScore: 95, // High confidence for manually added
      isManuallyAdded: true
    };
    
    setCuratedMatches(prev => [...prev, newMatch]);
  };

  const removeFromCurated = (expertId: string) => {
    setCuratedMatches(prev => prev.filter(m => m.expertId !== expertId));
  };

  const totalWeight = Object.values(weights).reduce((sum, val) => sum + val, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="w-2 h-6 bg-purple-500 rounded-full"></div>
            <Brain className="h-5 w-5" />
            Admin Matching Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-medium text-muted-foreground">Algorithm Version</span>
              <p>{algorithmVersion}</p>
            </div>
            <div>
              <span className="font-medium text-muted-foreground">Total Weight</span>
              <p className={totalWeight === 100 ? 'text-green-600' : 'text-red-600'}>
                {totalWeight}%
              </p>
            </div>
            <div>
              <span className="font-medium text-muted-foreground">Auto Re-run</span>
              <div className="flex items-center gap-2 mt-1">
                <Switch
                  checked={autoRerun}
                  onCheckedChange={setAutoRerun}
                />
                <span className="text-xs">
                  {autoRerun ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>
            <div>
              <span className="font-medium text-muted-foreground">Status</span>
              <Badge variant={totalWeight === 100 ? 'default' : 'destructive'}>
                {totalWeight === 100 ? 'Ready' : 'Needs adjustment'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weight Sliders */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sliders className="h-5 w-5" />
            Matching Weights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(weights).map(([key, value]) => (
              <div key={key} className="space-y-2">
                <div className="flex justify-between">
                  <Label className="capitalize">{key} Match</Label>
                  <span className="text-sm text-muted-foreground">{value}%</span>
                </div>
                <Slider
                  value={[value]}
                  onValueChange={(newValue) => handleWeightChange(key as keyof MatchingWeights, newValue)}
                  max={100}
                  step={5}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0%</span>
                  <span>100%</span>
                </div>
              </div>
            ))}
          </div>

          {totalWeight !== 100 && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm text-destructive">
                ⚠️ Weights must sum to 100%. Current total: {totalWeight}%
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      {crId && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Match Operations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Button
                onClick={handleRerun}
                disabled={isRerunning || totalWeight !== 100}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRerunning ? 'animate-spin' : ''}`} />
                {isRerunning ? 'Re-running...' : 'Re-run Matching'}
              </Button>
              
              <Button
                variant="outline"
                onClick={handleSaveCurated}
                disabled={isSaving || curatedMatches.length === 0}
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Curated List'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Expert Search & Curation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Curated Expert List
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="flex gap-2">
            <Input
              placeholder="Search experts by name, skills, or role..."
              value={expertSearch}
              onChange={(e) => setExpertSearch(e.target.value)}
              className="flex-1"
            />
            <Button variant="outline">
              Search
            </Button>
          </div>

          {/* Curated List */}
          {curatedMatches.length > 0 ? (
            <div className="space-y-3">
              <Label className="font-medium">Curated Matches ({curatedMatches.length})</Label>
              <div className="space-y-2">
                {curatedMatches.map((match) => (
                  <div
                    key={match.expertId}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Badge variant={match.isManuallyAdded ? 'secondary' : 'default'}>
                        {match.isManuallyAdded ? 'Manual' : 'Algorithm'}
                      </Badge>
                      <div>
                        <p className="font-medium">{match.roleBadge}</p>
                        <p className="text-sm text-muted-foreground">
                          Confidence: {match.confidenceScore}%
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeFromCurated(match.expertId)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No curated matches yet</p>
              <p className="text-sm">Search and add experts to create a curated list</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Algorithm Parameters Log */}
      <Card>
        <CardHeader>
          <CardTitle>Parameter History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground space-y-2">
            <div className="flex justify-between">
              <span>Last updated:</span>
              <span>{new Date().toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Version:</span>
              <span>{algorithmVersion}</span>
            </div>
            <div className="flex justify-between">
              <span>Parameters:</span>
              <span>
                Skills {weights.skills}% • Rating {weights.rating}% • 
                Price {weights.price}% • Availability {weights.availability}%
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};