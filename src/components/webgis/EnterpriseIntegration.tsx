import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  Shield, 
  Key, 
  Users, 
  Building, 
  Globe, 
  Lock, 
  CheckCircle, 
  AlertTriangle,
  Settings,
  ExternalLink,
  Plus,
  UserCheck,
  Database
} from 'lucide-react';

interface EnterpriseIntegrationProps {
  projectId: string;
}

const EnterpriseIntegration: React.FC<EnterpriseIntegrationProps> = ({ projectId }) => {
  const [ssoEnabled, setSsoEnabled] = useState(false);
  const [ldapEnabled, setLdapEnabled] = useState(false);
  const [whitelabelEnabled, setWhitelabelEnabled] = useState(false);

  const ssoProviders = [
    {
      id: 'azure',
      name: 'Azure Active Directory',
      status: 'connected',
      users: 247,
      icon: Building,
      description: 'Microsoft Azure AD integration'
    },
    {
      id: 'okta',
      name: 'Okta',
      status: 'available',
      users: 0,
      icon: Shield,
      description: 'Okta identity management'
    },
    {
      id: 'google',
      name: 'Google Workspace',
      status: 'available',
      users: 0,
      icon: Globe,
      description: 'Google Workspace SSO'
    },
    {
      id: 'saml',
      name: 'SAML 2.0',
      status: 'configured',
      users: 89,
      icon: Key,
      description: 'Generic SAML 2.0 provider'
    }
  ];

  const securityFeatures = [
    {
      id: 'mfa',
      name: 'Multi-Factor Authentication',
      description: 'Require 2FA for all users',
      enabled: true,
      enterprise: true
    },
    {
      id: 'session',
      name: 'Session Management',
      description: 'Advanced session timeout and controls',
      enabled: true,
      enterprise: true
    },
    {
      id: 'audit',
      name: 'Audit Logging',
      description: 'Comprehensive audit trail',
      enabled: true,
      enterprise: true
    },
    {
      id: 'encryption',
      name: 'Data Encryption',
      description: 'End-to-end data encryption',
      enabled: true,
      enterprise: true
    },
    {
      id: 'backup',
      name: 'Automated Backups',
      description: 'Regular automated data backups',
      enabled: false,
      enterprise: false
    },
    {
      id: 'compliance',
      name: 'Compliance Reports',
      description: 'SOC2, GDPR compliance reporting',
      enabled: false,
      enterprise: true
    }
  ];

  const deploymentOptions = [
    {
      id: 'cloud',
      name: 'Cloud Deployment',
      description: 'Managed cloud hosting',
      status: 'active',
      recommended: true
    },
    {
      id: 'onpremise',
      name: 'On-Premise',
      description: 'Deploy on your infrastructure',
      status: 'available',
      recommended: false
    },
    {
      id: 'hybrid',
      name: 'Hybrid Cloud',
      description: 'Hybrid cloud and on-premise',
      status: 'available',
      recommended: false
    },
    {
      id: 'private',
      name: 'Private Cloud',
      description: 'Dedicated private cloud instance',
      status: 'enterprise',
      recommended: false
    }
  ];

  const complianceStandards = [
    { name: 'SOC 2 Type II', status: 'certified', description: 'Security and availability' },
    { name: 'GDPR', status: 'compliant', description: 'EU data protection regulation' },
    { name: 'HIPAA', status: 'available', description: 'Healthcare data protection' },
    { name: 'FedRAMP', status: 'in-progress', description: 'US federal security standard' },
    { name: 'ISO 27001', status: 'certified', description: 'Information security management' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
      case 'active':
      case 'certified':
      case 'compliant':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'configured':
      case 'available':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'enterprise':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-primary" />
            <div>
              <CardTitle>Enterprise Integration</CardTitle>
              <p className="text-sm text-muted-foreground">
                Advanced security, SSO, and enterprise deployment options
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="sso" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="sso">SSO & Auth</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="deployment">Deployment</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        {/* SSO & Authentication Tab */}
        <TabsContent value="sso" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Single Sign-On Providers</CardTitle>
                <div className="flex items-center gap-2">
                  <Label htmlFor="sso-toggle">Enable SSO</Label>
                  <Switch
                    id="sso-toggle"
                    checked={ssoEnabled}
                    onCheckedChange={setSsoEnabled}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ssoProviders.map((provider) => {
                  const IconComponent = provider.icon;
                  return (
                    <Card key={provider.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <IconComponent className="h-8 w-8 text-muted-foreground" />
                            <div>
                              <h4 className="font-semibold">{provider.name}</h4>
                              <p className="text-xs text-muted-foreground">{provider.description}</p>
                            </div>
                          </div>
                          <Badge className={getStatusColor(provider.status)}>
                            {provider.status}
                          </Badge>
                        </div>
                        
                        {provider.users > 0 && (
                          <div className="flex items-center gap-2 mb-3">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{provider.users} users</span>
                          </div>
                        )}
                        
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1"
                            disabled={provider.status === 'connected'}
                          >
                            {provider.status === 'connected' ? 'Connected' : 'Configure'}
                          </Button>
                          {provider.status === 'connected' && (
                            <Button variant="outline" size="sm">
                              <Settings className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* LDAP Configuration */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">LDAP/Active Directory</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Connect to your existing directory services
                  </p>
                </div>
                <Switch
                  checked={ldapEnabled}
                  onCheckedChange={setLdapEnabled}
                />
              </div>
            </CardHeader>
            {ldapEnabled && (
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ldap-server">LDAP Server</Label>
                    <Input id="ldap-server" placeholder="ldap://company.com:389" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ldap-base">Base DN</Label>
                    <Input id="ldap-base" placeholder="dc=company,dc=com" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ldap-user">Bind User</Label>
                    <Input id="ldap-user" placeholder="cn=admin,dc=company,dc=com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ldap-password">Bind Password</Label>
                    <Input id="ldap-password" type="password" placeholder="••••••••" />
                  </div>
                </div>
                <Button>Test LDAP Connection</Button>
              </CardContent>
            )}
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {securityFeatures.map((feature) => (
                  <div key={feature.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${feature.enabled ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{feature.name}</span>
                          {feature.enterprise && (
                            <Badge variant="outline" className="text-xs">Enterprise</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{feature.description}</p>
                      </div>
                    </div>
                    <Switch
                      checked={feature.enabled}
                      disabled={feature.enterprise && !feature.enabled}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* API Security */}
          <Card>
            <CardHeader>
              <CardTitle>API Security</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Rate Limiting</Label>
                  <Select defaultValue="standard">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard (1000/hour)</SelectItem>
                      <SelectItem value="enhanced">Enhanced (5000/hour)</SelectItem>
                      <SelectItem value="unlimited">Unlimited</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>IP Whitelisting</Label>
                  <div className="flex gap-2">
                    <Input placeholder="192.168.1.0/24" />
                    <Button variant="outline" size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Deployment Tab */}
        <TabsContent value="deployment" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {deploymentOptions.map((option) => (
              <Card key={option.id} className={`hover:shadow-md transition-shadow ${
                option.status === 'active' ? 'ring-2 ring-primary' : ''
              }`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{option.name}</h4>
                        {option.recommended && (
                          <Badge variant="default" className="text-xs">Recommended</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{option.description}</p>
                    </div>
                    <Badge className={getStatusColor(option.status)}>
                      {option.status}
                    </Badge>
                  </div>
                  
                  <Button 
                    variant={option.status === 'active' ? 'default' : 'outline'} 
                    size="sm" 
                    className="w-full"
                    disabled={option.status === 'active'}
                  >
                    {option.status === 'active' ? 'Current Deployment' : 'Configure'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* White-label Options */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>White-label Deployment</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Customize branding and domain for your organization
                  </p>
                </div>
                <Switch
                  checked={whitelabelEnabled}
                  onCheckedChange={setWhitelabelEnabled}
                />
              </div>
            </CardHeader>
            {whitelabelEnabled && (
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="custom-domain">Custom Domain</Label>
                    <Input id="custom-domain" placeholder="maps.yourcompany.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company-name">Company Name</Label>
                    <Input id="company-name" placeholder="Your Company" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="logo-upload">Company Logo</Label>
                  <Input id="logo-upload" type="file" accept="image/*" />
                </div>
                <Button>Save Branding Settings</Button>
              </CardContent>
            )}
          </Card>
        </TabsContent>

        {/* Compliance Tab */}
        <TabsContent value="compliance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Standards</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {complianceStandards.map((standard, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        {standard.status === 'certified' || standard.status === 'compliant' ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : standard.status === 'in-progress' ? (
                          <AlertTriangle className="h-5 w-5 text-yellow-500" />
                        ) : (
                          <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                        )}
                        <span className="font-medium">{standard.name}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground">{standard.description}</span>
                      <Badge className={getStatusColor(standard.status)}>
                        {standard.status}
                      </Badge>
                      <Button variant="outline" size="sm">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Data Governance */}
          <Card>
            <CardHeader>
              <CardTitle>Data Governance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Data Retention Period</Label>
                  <Select defaultValue="7years">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1year">1 Year</SelectItem>
                      <SelectItem value="3years">3 Years</SelectItem>
                      <SelectItem value="7years">7 Years</SelectItem>
                      <SelectItem value="indefinite">Indefinite</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Data Location</Label>
                  <Select defaultValue="us-east">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="us-east">US East</SelectItem>
                      <SelectItem value="us-west">US West</SelectItem>
                      <SelectItem value="eu-central">EU Central</SelectItem>
                      <SelectItem value="asia-pacific">Asia Pacific</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Data Processing Agreement</div>
                  <div className="text-sm text-muted-foreground">GDPR-compliant DPA available</div>
                </div>
                <Button variant="outline">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Download DPA
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnterpriseIntegration;