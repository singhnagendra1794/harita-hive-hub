import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, CheckCircle, AlertTriangle, Clock, Users, Target, Settings, Play, Pause } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

interface DecisionRule {
  id: string;
  name: string;
  description: string;
  trigger: string;
  condition: string;
  action: string;
  confidence: number;
  status: 'active' | 'paused' | 'reviewing';
  priority: 'low' | 'medium' | 'high' | 'critical';
  approvals_required: number;
  auto_execute: boolean;
  created_at: string;
  last_triggered: string | null;
  success_rate: number;
}

interface PendingDecision {
  id: string;
  rule_id: string;
  rule_name: string;
  trigger_data: any;
  recommended_action: string;
  confidence_score: number;
  estimated_impact: string;
  requires_approval: boolean;
  status: 'pending' | 'approved' | 'rejected' | 'executed';
  created_at: string;
  expires_at: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

const AutomatedDecisionSupport = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('pending');
  const [decisionRules, setDecisionRules] = useState<DecisionRule[]>([]);
  const [pendingDecisions, setPendingDecisions] = useState<PendingDecision[]>([]);
  const [selectedDecision, setSelectedDecision] = useState<string | null>(null);

  // Mock data - in real implementation, this would come from Supabase
  useEffect(() => {
    // Simulate loading decision rules
    setDecisionRules([
      {
        id: '1',
        name: 'Flood Risk Alert & Response',
        description: 'Automatically trigger evacuation notices when flood risk exceeds 80%',
        trigger: 'flood_model_prediction',
        condition: 'risk_percentage > 0.8',
        action: 'send_evacuation_alert + adjust_reservoir_discharge',
        confidence: 0.92,
        status: 'active',
        priority: 'critical',
        approvals_required: 2,
        auto_execute: false,
        created_at: '2024-01-15T10:00:00Z',
        last_triggered: '2024-01-20T14:30:00Z',
        success_rate: 0.95
      },
      {
        id: '2',
        name: 'Crop Irrigation Optimization',
        description: 'Adjust irrigation schedules based on soil moisture and weather predictions',
        trigger: 'soil_moisture_analysis',
        condition: 'moisture_level < 0.3 AND no_rain_forecast_72h',
        action: 'activate_irrigation_zones + notify_farmers',
        confidence: 0.88,
        status: 'active',
        priority: 'medium',
        approvals_required: 0,
        auto_execute: true,
        created_at: '2024-01-10T08:00:00Z',
        last_triggered: '2024-01-22T06:15:00Z',
        success_rate: 0.91
      },
      {
        id: '3',
        name: 'Urban Traffic Optimization',
        description: 'Dynamically adjust traffic light timings during peak congestion',
        trigger: 'traffic_density_analysis',
        condition: 'congestion_index > 0.7 AND peak_hours',
        action: 'optimize_traffic_lights + suggest_alternate_routes',
        confidence: 0.85,
        status: 'active',
        priority: 'medium',
        approvals_required: 1,
        auto_execute: false,
        created_at: '2024-01-12T12:00:00Z',
        last_triggered: '2024-01-23T17:45:00Z',
        success_rate: 0.87
      }
    ]);

    // Simulate loading pending decisions
    setPendingDecisions([
      {
        id: '1',
        rule_id: '1',
        rule_name: 'Flood Risk Alert & Response',
        trigger_data: {
          location: 'Riverside District',
          risk_percentage: 0.85,
          affected_population: 12500,
          water_level: '4.2m above normal'
        },
        recommended_action: 'Issue evacuation alert for Zones A-C and increase reservoir discharge to 85%',
        confidence_score: 0.92,
        estimated_impact: 'High - Potential to save 12,500 lives and $50M in property damage',
        requires_approval: true,
        status: 'pending',
        created_at: '2024-01-23T09:15:00Z',
        expires_at: '2024-01-23T11:15:00Z',
        priority: 'critical'
      },
      {
        id: '2',
        rule_id: '3',
        rule_name: 'Urban Traffic Optimization',
        trigger_data: {
          congestion_index: 0.75,
          affected_intersections: ['Main St & 5th Ave', 'Broadway & Oak St'],
          delay_minutes: 18
        },
        recommended_action: 'Extend green light cycles by 20% and activate dynamic routing suggestions',
        confidence_score: 0.85,
        estimated_impact: 'Medium - Reduce average commute time by 12 minutes',
        requires_approval: true,
        status: 'pending',
        created_at: '2024-01-23T08:30:00Z',
        expires_at: '2024-01-23T10:30:00Z',
        priority: 'medium'
      }
    ]);
  }, []);

  const approveDecision = async (decisionId: string) => {
    try {
      setPendingDecisions(prev => 
        prev.map(decision => 
          decision.id === decisionId 
            ? { ...decision, status: 'approved' as const }
            : decision
        )
      );
      
      toast({
        title: "Decision Approved",
        description: "The automated action has been approved and will be executed."
      });
    } catch (error) {
      toast({
        title: "Approval Failed",
        description: "Failed to approve decision. Please try again.",
        variant: "destructive"
      });
    }
  };

  const rejectDecision = async (decisionId: string) => {
    try {
      setPendingDecisions(prev => 
        prev.map(decision => 
          decision.id === decisionId 
            ? { ...decision, status: 'rejected' as const }
            : decision
        )
      );
      
      toast({
        title: "Decision Rejected",
        description: "The automated action has been rejected."
      });
    } catch (error) {
      toast({
        title: "Rejection Failed",
        description: "Failed to reject decision. Please try again.",
        variant: "destructive"
      });
    }
  };

  const toggleRule = async (ruleId: string) => {
    try {
      setDecisionRules(prev => 
        prev.map(rule => 
          rule.id === ruleId 
            ? { ...rule, status: rule.status === 'active' ? 'paused' as const : 'active' as const }
            : rule
        )
      );
      
      toast({
        title: "Rule Updated",
        description: "Decision rule status has been updated."
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update rule status. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'paused': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'reviewing': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Automated Decision Support</h1>
          <p className="text-muted-foreground">
            AI-powered decision automation with human oversight and approval workflows
          </p>
        </div>
        <Button variant="outline">
          <Settings className="h-4 w-4 mr-2" />
          Configure Rules
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-orange-400" />
              <div>
                <p className="text-sm font-medium">Pending Decisions</p>
                <p className="text-2xl font-bold">{pendingDecisions.filter(d => d.status === 'pending').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Brain className="h-5 w-5 text-blue-400" />
              <div>
                <p className="text-sm font-medium">Active Rules</p>
                <p className="text-2xl font-bold">{decisionRules.filter(r => r.status === 'active').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <div>
                <p className="text-sm font-medium">Auto-Executed</p>
                <p className="text-2xl font-bold">147</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-purple-400" />
              <div>
                <p className="text-sm font-medium">Success Rate</p>
                <p className="text-2xl font-bold">92%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pending">Pending Decisions</TabsTrigger>
          <TabsTrigger value="rules">Decision Rules</TabsTrigger>
          <TabsTrigger value="history">Decision History</TabsTrigger>
          <TabsTrigger value="analytics">Performance Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          <div className="space-y-4">
            {pendingDecisions.filter(d => d.status === 'pending').map((decision) => (
              <Card key={decision.id} className="border-l-4 border-l-orange-500">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-5 w-5 text-orange-400" />
                      <CardTitle className="text-lg">{decision.rule_name}</CardTitle>
                      <Badge className={getPriorityColor(decision.priority)}>
                        {decision.priority.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">
                        {Math.round(decision.confidence_score * 100)}% confidence
                      </Badge>
                      <div className="text-sm text-muted-foreground">
                        Expires: {new Date(decision.expires_at).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Recommended Action</h4>
                    <p className="text-sm bg-muted/50 p-3 rounded">{decision.recommended_action}</p>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Estimated Impact</h4>
                    <p className="text-sm text-muted-foreground">{decision.estimated_impact}</p>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Trigger Data</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {Object.entries(decision.trigger_data).map(([key, value]) => (
                        <div key={key}>
                          <span className="font-medium">{key.replace('_', ' ').toUpperCase()}: </span>
                          <span>{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <Button 
                      onClick={() => approveDecision(decision.id)}
                      className="flex-1"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve & Execute
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => rejectDecision(decision.id)}
                      className="flex-1"
                    >
                      Reject
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {pendingDecisions.filter(d => d.status === 'pending').length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
                  <p className="text-lg font-medium">No Pending Decisions</p>
                  <p className="text-muted-foreground">All automated decisions are either approved or handled automatically</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="rules" className="space-y-4">
          <div className="space-y-4">
            {decisionRules.map((rule) => (
              <Card key={rule.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Brain className="h-5 w-5 text-blue-400" />
                      <CardTitle className="text-lg">{rule.name}</CardTitle>
                      <Badge className={getStatusColor(rule.status)}>
                        {rule.status.toUpperCase()}
                      </Badge>
                      <Badge className={getPriorityColor(rule.priority)}>
                        {rule.priority.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleRule(rule.id)}
                      >
                        {rule.status === 'active' ? (
                          <>
                            <Pause className="h-4 w-4 mr-1" />
                            Pause
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4 mr-1" />
                            Activate
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                  <CardDescription>{rule.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium">Trigger Condition</p>
                      <p className="text-muted-foreground">{rule.condition}</p>
                    </div>
                    <div>
                      <p className="font-medium">Automated Action</p>
                      <p className="text-muted-foreground">{rule.action}</p>
                    </div>
                    <div>
                      <p className="font-medium">Success Rate</p>
                      <p className="text-muted-foreground">{Math.round(rule.success_rate * 100)}%</p>
                    </div>
                    <div>
                      <p className="font-medium">Auto Execute</p>
                      <p className="text-muted-foreground">
                        {rule.auto_execute ? 'Yes' : `Requires ${rule.approvals_required} approval(s)`}
                      </p>
                    </div>
                  </div>

                  {rule.last_triggered && (
                    <div className="text-xs text-muted-foreground">
                      Last triggered: {new Date(rule.last_triggered).toLocaleString()}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardContent className="p-8 text-center">
              <Clock className="h-12 w-12 text-blue-400 mx-auto mb-4" />
              <p className="text-lg font-medium">Decision History</p>
              <p className="text-muted-foreground">Complete audit trail of all automated decisions</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardContent className="p-8 text-center">
              <Target className="h-12 w-12 text-purple-400 mx-auto mb-4" />
              <p className="text-lg font-medium">Performance Analytics</p>
              <p className="text-muted-foreground">Detailed metrics on decision accuracy and impact</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AutomatedDecisionSupport;