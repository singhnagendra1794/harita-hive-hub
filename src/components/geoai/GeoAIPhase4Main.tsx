import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, Building2, Sprout, AlertTriangle, Leaf, Calendar, ShoppingCart, Network } from 'lucide-react';

// Phase 4 Components
import IndustryIntelligencePacks from './industry/IndustryIntelligencePacks';
import AutomatedDecisionSupport from './automation/AutomatedDecisionSupport';
import CrossPlatformIntegration from './integration/CrossPlatformIntegration';
import WorkflowScheduler from './automation/WorkflowScheduler';
import GeoAIMarketplace from './marketplace/GeoAIMarketplace';

// Previous Phase Components
import PredictiveIntelligenceHub from './intelligence/PredictiveIntelligenceHub';
import TeamManagement from './collaboration/TeamManagement';
import ScenarioSimulator from './scenarios/ScenarioSimulator';
import EnhancedAPIEndpoints from './enterprise/EnhancedAPIEndpoints';
import WorkflowTemplateLibrary from './templates/WorkflowTemplateLibrary';
import AdminDashboard from './admin/AdminDashboard';
import EnterpriseAPIManager from './enterprise/EnterpriseAPIManager';
import AdvancedVisualizationDashboard from './visualization/AdvancedVisualizationDashboard';

const GeoAIPhase4Main = () => {
  const [activeTab, setActiveTab] = useState('industry-packs');

  const phaseFeatures = [
    {
      phase: 'Phase 4',
      title: 'Industry Intelligence OS',
      features: ['Industry Packs', 'Decision Automation', 'IoT Integration', 'Data Marketplace'],
      icon: <Building2 className="h-6 w-6" />,
      color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
    },
    {
      phase: 'Phase 3',
      title: 'Enterprise Intelligence',
      features: ['Predictive Hub', 'Team Collaboration', 'Scenario Simulations', 'Enhanced APIs'],
      icon: <Brain className="h-6 w-6" />,
      color: 'bg-purple-500/20 text-purple-400 border-purple-500/30'
    }
  ];

  const industryPacks = [
    {
      id: 'urban',
      name: 'Urban Development',
      icon: <Building2 className="h-8 w-8 text-blue-400" />,
      description: 'Smart zoning, traffic simulations, growth forecasting',
      models: 15,
      tier: 'Pro'
    },
    {
      id: 'agriculture',
      name: 'Agriculture Intelligence',
      icon: <Sprout className="h-8 w-8 text-green-400" />,
      description: 'Crop optimization, water planning, early warning',
      models: 12,
      tier: 'Pro'
    },
    {
      id: 'disaster',
      name: 'Disaster Management',
      icon: <AlertTriangle className="h-8 w-8 text-red-400" />,
      description: 'Real-time hazard detection, evacuation planning',
      models: 18,
      tier: 'Enterprise'
    },
    {
      id: 'climate',
      name: 'Climate & ESG',
      icon: <Leaf className="h-8 w-8 text-emerald-400" />,
      description: 'Carbon accounting, climate risk, biodiversity',
      models: 10,
      tier: 'Enterprise'
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
                Industry-grade GeoAI Operating System with automated decision support
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

          {/* Industry Packs Preview */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4">Available Industry Intelligence Packs</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {industryPacks.map((pack) => (
                <Card key={pack.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      {pack.icon}
                      <Badge variant="outline">{pack.tier}</Badge>
                    </div>
                    <CardTitle className="text-lg">{pack.name}</CardTitle>
                    <CardDescription className="text-sm">{pack.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xs text-muted-foreground">
                      {pack.models} AI models included
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="container mx-auto">
        <div className="border-b bg-card/30">
          <div className="p-6">
            <TabsList className="grid w-full grid-cols-10">
              <TabsTrigger value="industry-packs" className="flex items-center space-x-2">
                <Building2 className="h-4 w-4" />
                <span>Industry Packs</span>
              </TabsTrigger>
              <TabsTrigger value="decision-support" className="flex items-center space-x-2">
                <Brain className="h-4 w-4" />
                <span>Decision AI</span>
              </TabsTrigger>
              <TabsTrigger value="iot-integration" className="flex items-center space-x-2">
                <Network className="h-4 w-4" />
                <span>IoT Connect</span>
              </TabsTrigger>
              <TabsTrigger value="scheduler" className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>Scheduler</span>
              </TabsTrigger>
              <TabsTrigger value="marketplace" className="flex items-center space-x-2">
                <ShoppingCart className="h-4 w-4" />
                <span>Marketplace</span>
              </TabsTrigger>
              <TabsTrigger value="intelligence" className="flex items-center space-x-2">
                <Brain className="h-4 w-4" />
                <span>Intelligence</span>
              </TabsTrigger>
              <TabsTrigger value="teams" className="flex items-center space-x-2">
                <Building2 className="h-4 w-4" />
                <span>Teams</span>
              </TabsTrigger>
              <TabsTrigger value="scenarios" className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4" />
                <span>Scenarios</span>
              </TabsTrigger>
              <TabsTrigger value="templates" className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>Templates</span>
              </TabsTrigger>
              <TabsTrigger value="admin" className="flex items-center space-x-2">
                <Building2 className="h-4 w-4" />
                <span>Admin</span>
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        {/* Phase 4 Content */}
        <TabsContent value="industry-packs" className="mt-0">
          <IndustryIntelligencePacks />
        </TabsContent>

        <TabsContent value="decision-support" className="mt-0">
          <AutomatedDecisionSupport />
        </TabsContent>

        <TabsContent value="iot-integration" className="mt-0">
          <CrossPlatformIntegration />
        </TabsContent>

        <TabsContent value="scheduler" className="mt-0">
          <WorkflowScheduler />
        </TabsContent>

        <TabsContent value="marketplace" className="mt-0">
          <GeoAIMarketplace />
        </TabsContent>

        {/* Previous Phase Content */}
        <TabsContent value="intelligence" className="mt-0">
          <PredictiveIntelligenceHub />
        </TabsContent>

        <TabsContent value="teams" className="mt-0">
          <TeamManagement />
        </TabsContent>

        <TabsContent value="scenarios" className="mt-0">
          <ScenarioSimulator />
        </TabsContent>

        <TabsContent value="templates" className="mt-0">
          <WorkflowTemplateLibrary onTemplateSelect={() => {}} onTemplateRun={() => {}} />
        </TabsContent>

        <TabsContent value="admin" className="mt-0">
          <AdminDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GeoAIPhase4Main;