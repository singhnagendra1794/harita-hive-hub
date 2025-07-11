import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  FileCheck, 
  Shield, 
  FileText, 
  AlertTriangle, 
  CheckCircle,
  Calendar,
  MapPin,
  Building,
  Truck,
  Trees,
  Factory,
  Download,
  Eye
} from 'lucide-react';

const ComplianceToolkit = () => {
  const reportTemplates = [
    { id: 1, name: 'Environmental Impact Assessment', sector: 'Environment', compliance: 'EIA 2020', status: 'active' },
    { id: 2, name: 'Urban Zoning Compliance', sector: 'Urban Planning', compliance: 'Municipal Act', status: 'active' },
    { id: 3, name: 'Land Use Classification', sector: 'Agriculture', compliance: 'Land Records Act', status: 'active' },
    { id: 4, name: 'Mining Lease Validation', sector: 'Mining', compliance: 'MMDR Act', status: 'active' },
    { id: 5, name: 'Forest Clearance Report', sector: 'Environment', compliance: 'Forest Conservation Act', status: 'active' },
    { id: 6, name: 'Defense Infrastructure', sector: 'Defense', compliance: 'Strategic Guidelines', status: 'active' },
  ];

  const activeReports = [
    { id: 1, name: 'Industrial Park EIA', template: 'Environmental Impact Assessment', progress: 85, dueDate: '2024-02-15', priority: 'high' },
    { id: 2, name: 'Housing Project Zoning', template: 'Urban Zoning Compliance', progress: 60, dueDate: '2024-02-20', priority: 'medium' },
    { id: 3, name: 'Agricultural Land Survey', template: 'Land Use Classification', progress: 40, dueDate: '2024-02-25', priority: 'low' },
  ];

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Regulatory & Compliance Toolkit</h1>
          <p className="text-xl text-muted-foreground">
            Automated spatial compliance reports and regulatory analysis
          </p>
          <Badge variant="secondary" className="mt-2">Enterprise Only</Badge>
        </div>

        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="templates">Report Templates</TabsTrigger>
            <TabsTrigger value="generator">Report Generator</TabsTrigger>
            <TabsTrigger value="compliance">Compliance Check</TabsTrigger>
            <TabsTrigger value="regulations">Regulations</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Reports</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">24</div>
                  <p className="text-xs text-muted-foreground">+3 this week</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Compliance Rate</CardTitle>
                  <Shield className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">94.2%</div>
                  <p className="text-xs text-muted-foreground">+2% from last month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">8</div>
                  <p className="text-xs text-muted-foreground">Due this week</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Templates</CardTitle>
                  <FileCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">15</div>
                  <p className="text-xs text-muted-foreground">Across 6 sectors</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Active Reports</CardTitle>
                  <CardDescription>Reports currently in progress</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {activeReports.map((report) => (
                      <div key={report.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{report.name}</h4>
                          <Badge variant={report.priority === 'high' ? 'destructive' : report.priority === 'medium' ? 'secondary' : 'outline'}>
                            {report.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{report.template}</p>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Progress</span>
                            <span>{report.progress}%</span>
                          </div>
                          <Progress value={report.progress} />
                          <div className="flex justify-between text-sm text-muted-foreground">
                            <span>Due: {report.dueDate}</span>
                            <span>{100 - report.progress}% remaining</span>
                          </div>
                        </div>
                        <div className="flex space-x-2 mt-3">
                          <Button size="sm" variant="outline">Continue</Button>
                          <Button size="sm" variant="outline">Preview</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Compliance Alerts</CardTitle>
                  <CardDescription>Regulatory compliance notifications</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3 p-3 border rounded-lg border-red-200 bg-red-50">
                      <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium text-red-900">High Priority Alert</p>
                        <p className="text-sm text-red-700">EIA report for Industrial Park project due in 3 days</p>
                        <p className="text-xs text-red-600 mt-1">Missing: Biodiversity assessment, Soil analysis</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3 p-3 border rounded-lg border-yellow-200 bg-yellow-50">
                      <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium text-yellow-900">Medium Priority</p>
                        <p className="text-sm text-yellow-700">Zoning compliance check required for Housing Project</p>
                        <p className="text-xs text-yellow-600 mt-1">Buffer zone analysis pending</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3 p-3 border rounded-lg border-green-200 bg-green-50">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium text-green-900">Compliance Achieved</p>
                        <p className="text-sm text-green-700">Forest clearance report approved for Highway Project</p>
                        <p className="text-xs text-green-600 mt-1">All requirements met</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="templates" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reportTemplates.map((template) => (
                <Card key={template.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        {template.sector === 'Environment' && <Trees className="h-5 w-5" />}
                        {template.sector === 'Urban Planning' && <Building className="h-5 w-5" />}
                        {template.sector === 'Agriculture' && <MapPin className="h-5 w-5" />}
                        {template.sector === 'Mining' && <Factory className="h-5 w-5" />}
                        {template.sector === 'Defense' && <Shield className="h-5 w-5" />}
                        {template.name}
                      </span>
                      <Badge variant="default">{template.status}</Badge>
                    </CardTitle>
                    <CardDescription>
                      {template.sector} • {template.compliance}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Completion Time</span>
                        <span>2-4 hours</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Required Data</span>
                        <span>Spatial + Tabular</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Output Format</span>
                        <span>PDF + GIS</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Button className="w-full">Use Template</Button>
                      <div className="grid grid-cols-2 gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          Preview
                        </Button>
                        <Button variant="outline" size="sm">Customize</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="generator" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Automated Report Generator</CardTitle>
                <CardDescription>Generate compliance reports using spatial data analysis</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Report Type</Label>
                      <select className="w-full p-2 border rounded">
                        <option>Environmental Impact Assessment</option>
                        <option>Urban Zoning Compliance</option>
                        <option>Land Use Classification</option>
                        <option>Mining Lease Validation</option>
                        <option>Forest Clearance Report</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label>Project Name</Label>
                      <Input placeholder="Industrial Development Project" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Project Type</Label>
                        <select className="w-full p-2 border rounded">
                          <option>Industrial</option>
                          <option>Residential</option>
                          <option>Commercial</option>
                          <option>Infrastructure</option>
                          <option>Mining</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label>State/Region</Label>
                        <select className="w-full p-2 border rounded">
                          <option>Maharashtra</option>
                          <option>Delhi</option>
                          <option>Karnataka</option>
                          <option>Tamil Nadu</option>
                          <option>Gujarat</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Project Area (Upload KML/Shapefile)</Label>
                      <div className="border-2 border-dashed rounded-lg p-4 text-center">
                        <MapPin className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-muted-foreground">Drop project boundary files here</p>
                        <Button variant="outline" className="mt-2">Browse Files</Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Additional Documents</Label>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="soil-report" />
                          <Label htmlFor="soil-report">Soil Quality Report</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="water-report" />
                          <Label htmlFor="water-report">Groundwater Assessment</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="biodiversity" />
                          <Label htmlFor="biodiversity">Biodiversity Study</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="traffic-study" />
                          <Label htmlFor="traffic-study">Traffic Impact Analysis</Label>
                        </div>
                      </div>
                    </div>

                    <Button className="w-full">Generate Report</Button>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">Automatic Analysis Modules</h4>
                    <div className="space-y-3">
                      <div className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">Buffer Zone Analysis</span>
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Automated calculation of required buffer zones based on project type and regulations
                        </p>
                      </div>

                      <div className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">Land Use Compatibility</span>
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Check project compatibility with existing land use patterns and zoning regulations
                        </p>
                      </div>

                      <div className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">Environmental Sensitivity</span>
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Assessment of ecological sensitivity including forests, water bodies, and protected areas
                        </p>
                      </div>

                      <div className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">Compliance Checklist</span>
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Automated verification against regulatory requirements and approval criteria
                        </p>
                      </div>

                      <div className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">Risk Assessment</span>
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Identify potential environmental and social risks with mitigation recommendations
                        </p>
                      </div>
                    </div>

                    <div className="p-4 bg-muted/20 rounded-lg">
                      <h5 className="font-medium mb-2">Estimated Generation Time</h5>
                      <p className="text-2xl font-bold">15-30 minutes</p>
                      <p className="text-sm text-muted-foreground">
                        Based on project complexity and data availability
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="compliance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Compliance Check</CardTitle>
                  <CardDescription>Instant validation against regulatory requirements</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Upload Project File</Label>
                    <div className="border-2 border-dashed rounded-lg p-4 text-center">
                      <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-muted-foreground">Drop KML, Shapefile, or CAD files</p>
                      <Button variant="outline" className="mt-2">Browse Files</Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Project Category</Label>
                      <select className="w-full p-2 border rounded">
                        <option>Industrial Development</option>
                        <option>Residential Complex</option>
                        <option>Infrastructure Project</option>
                        <option>Mining Operation</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>Jurisdiction</Label>
                      <select className="w-full p-2 border rounded">
                        <option>Central Government</option>
                        <option>State Government</option>
                        <option>Municipal Corporation</option>
                        <option>Local Panchayat</option>
                      </select>
                    </div>
                  </div>

                  <Button className="w-full">Run Compliance Check</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Compliance Results</CardTitle>
                  <CardDescription>Latest validation results</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 border rounded-lg border-green-200 bg-green-50">
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <div>
                          <p className="font-medium text-green-900">Setback Requirements</p>
                          <p className="text-sm text-green-700">Meets minimum distance criteria</p>
                        </div>
                      </div>
                      <Badge variant="default">Compliant</Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg border-green-200 bg-green-50">
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <div>
                          <p className="font-medium text-green-900">Land Use Zoning</p>
                          <p className="text-sm text-green-700">Project type matches zoning classification</p>
                        </div>
                      </div>
                      <Badge variant="default">Compliant</Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg border-yellow-200 bg-yellow-50">
                      <div className="flex items-center space-x-3">
                        <AlertTriangle className="h-5 w-5 text-yellow-500" />
                        <div>
                          <p className="font-medium text-yellow-900">Environmental Clearance</p>
                          <p className="text-sm text-yellow-700">Additional documentation required</p>
                        </div>
                      </div>
                      <Badge variant="secondary">Pending</Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg border-red-200 bg-red-50">
                      <div className="flex items-center space-x-3">
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                        <div>
                          <p className="font-medium text-red-900">Water Body Buffer</p>
                          <p className="text-sm text-red-700">Project within 500m of water body</p>
                        </div>
                      </div>
                      <Badge variant="destructive">Non-Compliant</Badge>
                    </div>
                  </div>

                  <div className="mt-4 p-4 bg-muted/20 rounded-lg">
                    <h5 className="font-medium mb-2">Overall Compliance Score</h5>
                    <div className="flex items-center space-x-3">
                      <Progress value={75} className="flex-1" />
                      <span className="font-bold">75%</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      3 of 4 requirements met
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="regulations" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trees className="h-5 w-5" />
                    Environmental
                  </CardTitle>
                  <CardDescription>Environmental protection and conservation laws</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm space-y-2">
                    <div className="flex justify-between">
                      <span>EIA Notification 2020</span>
                      <Badge variant="outline">Updated</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Forest Conservation Act</span>
                      <Badge variant="outline">Active</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Water Prevention Act</span>
                      <Badge variant="outline">Active</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Air Quality Standards</span>
                      <Badge variant="outline">Updated</Badge>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full">View All Environmental</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    Urban Planning
                  </CardTitle>
                  <CardDescription>Municipal and urban development regulations</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm space-y-2">
                    <div className="flex justify-between">
                      <span>Master Plan Guidelines</span>
                      <Badge variant="outline">Active</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Building Bylaws</span>
                      <Badge variant="outline">Updated</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Zoning Regulations</span>
                      <Badge variant="outline">Active</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Development Control Rules</span>
                      <Badge variant="outline">Updated</Badge>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full">View All Urban Planning</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Factory className="h-5 w-5" />
                    Industrial
                  </CardTitle>
                  <CardDescription>Industrial development and safety regulations</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm space-y-2">
                    <div className="flex justify-between">
                      <span>Industrial Policy</span>
                      <Badge variant="outline">Active</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Factory Act Compliance</span>
                      <Badge variant="outline">Updated</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Hazardous Waste Rules</span>
                      <Badge variant="outline">Active</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Pollution Control Board</span>
                      <Badge variant="outline">Updated</Badge>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full">View All Industrial</Button>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Regulatory Updates & Notifications</CardTitle>
                <CardDescription>Latest changes in regulations and compliance requirements</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3 p-4 border rounded-lg">
                    <Calendar className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium">EIA Amendment 2024</p>
                        <Badge variant="secondary">New</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Updated environmental clearance requirements for Category B projects. Effective from March 1, 2024.
                      </p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                        <span>Ministry of Environment</span>
                        <span>Jan 15, 2024</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 p-4 border rounded-lg">
                    <Calendar className="h-5 w-5 text-green-500 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium">Digital Building Approval System</p>
                        <Badge variant="default">Updated</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        New online portal for building plan approvals in major cities. Reduced approval timeframes.
                      </p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                        <span>Urban Development Ministry</span>
                        <span>Jan 10, 2024</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default ComplianceToolkit;