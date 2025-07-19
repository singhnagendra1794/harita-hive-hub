import React, { useState, useCallback } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  Position
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Play, 
  Pause, 
  Save, 
  Plus, 
  Database, 
  Mail, 
  Globe, 
  Clock, 
  Filter,
  MapPin,
  BarChart3,
  FileText,
  Zap,
  Settings
} from 'lucide-react';

interface WorkflowDesignerProps {
  projectId: string;
}

// Custom node types
const DataSourceNode = ({ data }: any) => (
  <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-blue-200">
    <div className="flex items-center gap-2">
      <Database className="h-4 w-4 text-blue-500" />
      <span className="text-sm font-medium">{data.label}</span>
    </div>
    <div className="mt-1 text-xs text-gray-500">{data.source}</div>
  </div>
);

const ProcessNode = ({ data }: any) => (
  <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-green-200">
    <div className="flex items-center gap-2">
      <Settings className="h-4 w-4 text-green-500" />
      <span className="text-sm font-medium">{data.label}</span>
    </div>
    <div className="mt-1 text-xs text-gray-500">{data.operation}</div>
  </div>
);

const OutputNode = ({ data }: any) => (
  <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-purple-200">
    <div className="flex items-center gap-2">
      <FileText className="h-4 w-4 text-purple-500" />
      <span className="text-sm font-medium">{data.label}</span>
    </div>
    <div className="mt-1 text-xs text-gray-500">{data.destination}</div>
  </div>
);

const TriggerNode = ({ data }: any) => (
  <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-orange-200">
    <div className="flex items-center gap-2">
      <Clock className="h-4 w-4 text-orange-500" />
      <span className="text-sm font-medium">{data.label}</span>
    </div>
    <div className="mt-1 text-xs text-gray-500">{data.trigger}</div>
  </div>
);

const nodeTypes = {
  dataSource: DataSourceNode,
  process: ProcessNode,
  output: OutputNode,
  trigger: TriggerNode,
};

const WorkflowDesigner: React.FC<WorkflowDesignerProps> = ({ projectId }) => {
  const [showNodeDialog, setShowNodeDialog] = useState(false);
  const [selectedNodeType, setSelectedNodeType] = useState('');
  const [workflowStatus, setWorkflowStatus] = useState<'idle' | 'running' | 'paused'>('idle');

  const initialNodes: Node[] = [
    {
      id: '1',
      type: 'trigger',
      position: { x: 100, y: 100 },
      data: { 
        label: 'Schedule Trigger',
        trigger: 'Daily at 6 AM'
      },
    },
    {
      id: '2',
      type: 'dataSource',
      position: { x: 300, y: 100 },
      data: { 
        label: 'Load Dataset',
        source: 'PostgreSQL Table'
      },
    },
    {
      id: '3',
      type: 'process',
      position: { x: 500, y: 100 },
      data: { 
        label: 'Spatial Analysis',
        operation: 'Buffer Analysis'
      },
    },
    {
      id: '4',
      type: 'output',
      position: { x: 700, y: 100 },
      data: { 
        label: 'Export Results',
        destination: 'Email Report'
      },
    },
  ];

  const initialEdges: Edge[] = [
    { id: 'e1-2', source: '1', target: '2', type: 'smoothstep' },
    { id: 'e2-3', source: '2', target: '3', type: 'smoothstep' },
    { id: 'e3-4', source: '3', target: '4', type: 'smoothstep' },
  ];

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const workflows = [
    {
      id: '1',
      name: 'Daily Data Processing',
      status: 'active',
      lastRun: '2 hours ago',
      nextRun: '22 hours',
      steps: 4
    },
    {
      id: '2',
      name: 'Change Detection Alert',
      status: 'paused',
      lastRun: '1 day ago',
      nextRun: 'Paused',
      steps: 6
    },
    {
      id: '3',
      name: 'Weekly Report Generation',
      status: 'idle',
      lastRun: '5 days ago',
      nextRun: '2 days',
      steps: 3
    }
  ];

  const nodeTemplates = [
    { type: 'trigger', label: 'Trigger', icon: Clock, description: 'Start workflow with schedule or event' },
    { type: 'dataSource', label: 'Data Source', icon: Database, description: 'Load data from various sources' },
    { type: 'process', label: 'Process', icon: Settings, description: 'Transform or analyze data' },
    { type: 'output', label: 'Output', icon: FileText, description: 'Export or save results' }
  ];

  const addNode = (type: string) => {
    const newNode: Node = {
      id: `${nodes.length + 1}`,
      type,
      position: { x: Math.random() * 500, y: Math.random() * 300 },
      data: { 
        label: `New ${type}`,
        ...(type === 'trigger' && { trigger: 'Manual' }),
        ...(type === 'dataSource' && { source: 'Select source' }),
        ...(type === 'process' && { operation: 'Select operation' }),
        ...(type === 'output' && { destination: 'Select destination' })
      },
    };
    setNodes((nds) => [...nds, newNode]);
    setShowNodeDialog(false);
  };

  const runWorkflow = () => {
    setWorkflowStatus('running');
    // Simulate workflow execution
    setTimeout(() => {
      setWorkflowStatus('idle');
    }, 3000);
  };

  const pauseWorkflow = () => {
    setWorkflowStatus('paused');
  };

  const saveWorkflow = () => {
    // Save workflow logic
    console.log('Saving workflow:', { nodes, edges });
  };

  return (
    <div className="space-y-6">
      {/* Workflow Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Zap className="h-6 w-6 text-primary" />
              <div>
                <CardTitle>Workflow Designer</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Create automated GIS data processing workflows
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={workflowStatus === 'running' ? 'default' : 'secondary'}>
                {workflowStatus}
              </Badge>
              <Button 
                size="sm" 
                variant="outline"
                onClick={workflowStatus === 'running' ? pauseWorkflow : runWorkflow}
                disabled={workflowStatus === 'running'}
              >
                {workflowStatus === 'running' ? (
                  <>
                    <Pause className="h-4 w-4 mr-2" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Run
                  </>
                )}
              </Button>
              <Button size="sm" onClick={saveWorkflow}>
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Node Palette */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Node Palette</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {nodeTemplates.map((template) => {
              const IconComponent = template.icon;
              return (
                <Button
                  key={template.type}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start h-auto p-3"
                  onClick={() => addNode(template.type)}
                >
                  <div className="flex items-start gap-3">
                    <IconComponent className="h-4 w-4 mt-0.5" />
                    <div className="text-left">
                      <div className="font-medium text-xs">{template.label}</div>
                      <div className="text-xs text-muted-foreground">{template.description}</div>
                    </div>
                  </div>
                </Button>
              );
            })}
          </CardContent>
        </Card>

        {/* Workflow Canvas */}
        <div className="lg:col-span-3">
          <Card>
            <CardContent className="p-0">
              <div style={{ height: '500px', width: '100%' }}>
                <ReactFlow
                  nodes={nodes}
                  edges={edges}
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                  onConnect={onConnect}
                  nodeTypes={nodeTypes}
                  fitView
                  className="bg-gray-50"
                >
                  <Controls />
                  <MiniMap />
                  <Background />
                </ReactFlow>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Existing Workflows */}
      <Card>
        <CardHeader>
          <CardTitle>Existing Workflows</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {workflows.map((workflow) => (
              <div key={workflow.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3">
                    <Zap className="h-8 w-8 text-muted-foreground" />
                    <div>
                      <h4 className="font-semibold">{workflow.name}</h4>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span>{workflow.steps} steps</span>
                        <span>•</span>
                        <span>Last run: {workflow.lastRun}</span>
                        <span>•</span>
                        <span>Next: {workflow.nextRun}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge 
                    variant={workflow.status === 'active' ? 'default' : 
                             workflow.status === 'paused' ? 'secondary' : 'outline'}
                  >
                    {workflow.status}
                  </Badge>
                  <Button variant="outline" size="sm">Edit</Button>
                  <Button variant="outline" size="sm">
                    <Play className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkflowDesigner;
