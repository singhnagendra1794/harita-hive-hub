import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, Users, BarChart3, Zap, TrendingUp, Shield } from 'lucide-react';

// Phase 3 Components
import PredictiveIntelligenceHub from './intelligence/PredictiveIntelligenceHub';
import TeamManagement from './collaboration/TeamManagement';
import ScenarioSimulator from './scenarios/ScenarioSimulator';
import EnhancedAPIEndpoints from './enterprise/EnhancedAPIEndpoints';

// Phase 2 Components
import WorkflowTemplateLibrary from './templates/WorkflowTemplateLibrary';
import AdminDashboard from './admin/AdminDashboard';
import EnterpriseAPIManager from './enterprise/EnterpriseAPIManager';
import AdvancedVisualizationDashboard from './visualization/AdvancedVisualizationDashboard';

const GeoAIPhase3Main = () => {
  const [activeTab, setActiveTab] = useState('intelligence');

  const phaseFeatures = [
    {
      phase: 'Phase 3',
      title: 'Enterprise Intelligence',
      features: ['Predictive Intelligence Hub', 'Team Collaboration', 'Scenario Simulations', 'Enhanced APIs'],
      icon: <Brain className="h-6 w-6" />,
      color: 'bg-purple-500/20 text-purple-400 border-purple-500/30'
    },
    {
      phase: 'Phase 2',
      title: 'Advanced Platform',
      features: ['Workflow Templates', 'Admin Dashboard', 'Enterprise APIs', 'Visualization Tools'],
      icon: <Zap className="h-6 w-6" />,
      color: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50">
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Harita Hive GeoAI Platform</h1>
              <p className="text-muted-foreground mt-2">
                Enterprise-grade geospatial AI with predictive intelligence
              </p>
            </div>
            <div className="flex space-x-2">
              {phaseFeatures.map((phase) => (
                <Badge key={phase.phase} className={phase.color}>
                  {phase.icon}
                  <span className="ml-2">{phase.phase}</span>
                </Badge>
              ))}
            </div>
          </div>

          {/* Phase Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            {phaseFeatures.map((phase) => (
              <Card key={phase.phase}>
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    {phase.icon}
                    <div>
                      <CardTitle className="text-lg">{phase.title}</CardTitle>
                      <CardDescription>{phase.phase} Features</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    {phase.features.map((feature) => (
                      <div key={feature} className="text-sm p-2 bg-muted/50 rounded">
                        {feature}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="container mx-auto">
        <div className="border-b bg-card/30">
          <div className="p-6">
            <TabsList className="grid w-full grid-cols-8">
              <TabsTrigger value="intelligence" className="flex items-center space-x-2">
                <Brain className="h-4 w-4" />
                <span>Intelligence</span>
              </TabsTrigger>
              <TabsTrigger value="teams" className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>Teams</span>
              </TabsTrigger>
              <TabsTrigger value="scenarios" className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4" />
                <span>Scenarios</span>
              </TabsTrigger>
              <TabsTrigger value="enhanced-api" className="flex items-center space-x-2">
                <Shield className="h-4 w-4" />
                <span>Enhanced API</span>
              </TabsTrigger>
              <TabsTrigger value="templates" className="flex items-center space-x-2">
                <BarChart3 className="h-4 w-4" />
                <span>Templates</span>
              </TabsTrigger>
              <TabsTrigger value="admin" className="flex items-center space-x-2">
                <Shield className="h-4 w-4" />
                <span>Admin</span>
              </TabsTrigger>
              <TabsTrigger value="api" className="flex items-center space-x-2">
                <Zap className="h-4 w-4" />
                <span>API</span>
              </TabsTrigger>
              <TabsTrigger value="visualization" className="flex items-center space-x-2">
                <BarChart3 className="h-4 w-4" />
                <span>Visualization</span>
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        {/* Phase 3 Content */}
        <TabsContent value="intelligence" className="mt-0">
          <PredictiveIntelligenceHub />
        </TabsContent>

        <TabsContent value="teams" className="mt-0">
          <TeamManagement />
        </TabsContent>

        <TabsContent value="scenarios" className="mt-0">
          <ScenarioSimulator />
        </TabsContent>

        <TabsContent value="enhanced-api" className="mt-0">
          <EnhancedAPIEndpoints />
        </TabsContent>

        {/* Phase 2 Content */}
        <TabsContent value="templates" className="mt-0">
          <WorkflowTemplateLibrary onTemplateSelect={() => {}} onTemplateRun={() => {}} />
        </TabsContent>

        <TabsContent value="admin" className="mt-0">
          <AdminDashboard />
        </TabsContent>

        <TabsContent value="api" className="mt-0">
          <EnterpriseAPIManager />
        </TabsContent>

        <TabsContent value="visualization" className="mt-0">
          <AdvancedVisualizationDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GeoAIPhase3Main;