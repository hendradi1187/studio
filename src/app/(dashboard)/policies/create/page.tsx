
'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { createPolicy, updatePolicy, getPolicy } from '@/lib/api';
import { POLICY_TEMPLATES, getPolicyTemplatesByType, createPolicyFromTemplate } from '@/lib/policy-templates';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';

type PolicyRuleType = 'permissions' | 'prohibitions' | 'obligations';

interface PolicyRule {
  id: string;
  action: string;
  resource: string;
  description?: string;
}

export default function CreatePolicyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const editId = searchParams.get('edit');
  
  const [formData, setFormData] = React.useState({
    name: '',
    description: '',
    policyType: 'access' as 'access' | 'contract' | 'usage',
    status: 'draft' as 'draft' | 'active' | 'inactive'
  });

  const [policyRules, setPolicyRules] = React.useState({
    permissions: [] as PolicyRule[],
    prohibitions: [] as PolicyRule[],
    obligations: [] as PolicyRule[]
  });

  const [selectedTemplate, setSelectedTemplate] = React.useState<string>('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [isLoadingPolicy, setIsLoadingPolicy] = React.useState(false);

  React.useEffect(() => {
    if (editId) {
      loadPolicy(editId);
    }
  }, [editId]);

  const loadPolicy = async (policyId: string) => {
    setIsLoadingPolicy(true);
    try {
      const response = await getPolicy(policyId);
      const policy = response.policy;
      
      setFormData({
        name: policy.name,
        description: policy.description || '',
        policyType: policy.policyType,
        status: policy.status
      });

      if (policy.policyRules) {
        setPolicyRules({
          permissions: policy.policyRules.permissions || [],
          prohibitions: policy.policyRules.prohibitions || [],
          obligations: policy.policyRules.obligations || []
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load policy for editing.",
        variant: "destructive",
      });
      router.push('/policies');
    } finally {
      setIsLoadingPolicy(false);
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    const rules = createPolicyFromTemplate(templateId);
    if (rules) {
      setPolicyRules({
        permissions: rules.permissions || [],
        prohibitions: rules.prohibitions || [],
        obligations: rules.obligations || []
      });
    }
  };

  const addRule = (type: PolicyRuleType) => {
    const newRule: PolicyRule = {
      id: `rule_${Date.now()}`,
      action: '',
      resource: '',
      description: ''
    };

    setPolicyRules(prev => ({
      ...prev,
      [type]: [...prev[type], newRule]
    }));
  };

  const updateRule = (type: PolicyRuleType, ruleId: string, field: keyof PolicyRule, value: string) => {
    setPolicyRules(prev => ({
      ...prev,
      [type]: prev[type].map(rule => 
        rule.id === ruleId ? { ...rule, [field]: value } : rule
      )
    }));
  };

  const removeRule = (type: PolicyRuleType, ruleId: string) => {
    setPolicyRules(prev => ({
      ...prev,
      [type]: prev[type].filter(rule => rule.id !== ruleId)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Policy name is required.",
        variant: "destructive",
      });
      return;
    }

    if (policyRules.permissions.length === 0) {
      toast({
        title: "Validation Error",
        description: "At least one permission rule is required.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const policyData = {
        ...formData,
        policyRules
      };

      if (editId) {
        await updatePolicy(editId, policyData);
        toast({
          title: "Success",
          description: "Policy updated successfully.",
        });
      } else {
        await createPolicy(policyData);
        toast({
          title: "Success",
          description: "Policy created successfully.",
        });
      }

      router.push('/policies');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save policy.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderRuleSection = (type: PolicyRuleType, title: string) => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{title}</CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => addRule(type)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add {title.slice(0, -1)}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {policyRules[type].length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No {title.toLowerCase()} defined. Click "Add {title.slice(0, -1)}" to create one.
          </p>
        ) : (
          policyRules[type].map((rule, index) => (
            <div key={rule.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <Badge variant="outline">Rule {index + 1}</Badge>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeRule(type, rule.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`${rule.id}-action`}>Action</Label>
                  <Input
                    id={`${rule.id}-action`}
                    value={rule.action}
                    onChange={(e) => updateRule(type, rule.id, 'action', e.target.value)}
                    placeholder="e.g., read, write, download"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`${rule.id}-resource`}>Resource</Label>
                  <Input
                    id={`${rule.id}-resource`}
                    value={rule.resource}
                    onChange={(e) => updateRule(type, rule.id, 'resource', e.target.value)}
                    placeholder="e.g., dataset, file, api"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor={`${rule.id}-description`}>Description (Optional)</Label>
                <Input
                  id={`${rule.id}-description`}
                  value={rule.description || ''}
                  onChange={(e) => updateRule(type, rule.id, 'description', e.target.value)}
                  placeholder="Describe this rule..."
                />
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );

  if (isLoadingPolicy) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Loading policy...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/policies">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">
            {editId ? 'Edit Policy' : 'Create New Policy'}
          </h1>
          <p className="text-muted-foreground">
            {editId ? 'Update policy details and rules' : 'Define access, contract, or usage policies'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              Provide basic details about your policy
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Policy Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
                  placeholder="Enter policy name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="policyType">Policy Type *</Label>
                <Select
                  value={formData.policyType}
                  onValueChange={(value: 'access' | 'contract' | 'usage') =>
                    setFormData(prev => ({...prev, policyType: value}))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select policy type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="access">Access Policy</SelectItem>
                    <SelectItem value="contract">Contract Policy</SelectItem>
                    <SelectItem value="usage">Usage Policy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))}
                placeholder="Describe the purpose and scope of this policy"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: 'draft' | 'active' | 'inactive') =>
                  setFormData(prev => ({...prev, status: value}))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {!editId && (
          <Card>
            <CardHeader>
              <CardTitle>Policy Templates</CardTitle>
              <CardDescription>
                Start with a pre-built template or create from scratch
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {getPolicyTemplatesByType(formData.policyType).map((template) => (
                  <div
                    key={template.id}
                    className={`border rounded-lg p-4 cursor-pointer hover:bg-accent transition-colors ${
                      selectedTemplate === template.id ? 'border-primary bg-accent' : ''
                    }`}
                    onClick={() => handleTemplateSelect(template.id)}
                  >
                    <h4 className="font-semibold mb-2">{template.name}</h4>
                    <p className="text-sm text-muted-foreground mb-2">{template.description}</p>
                    <Badge variant="outline" className="text-xs">{template.category}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Separator />

        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">Policy Rules</h2>
          
          {renderRuleSection('permissions', 'Permissions')}
          {renderRuleSection('prohibitions', 'Prohibitions')}
          {renderRuleSection('obligations', 'Obligations')}
        </div>

        <div className="flex items-center justify-end space-x-4 pt-6">
          <Button type="button" variant="outline" asChild>
            <Link href="/policies">Cancel</Link>
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : editId ? 'Update Policy' : 'Create Policy'}
          </Button>
        </div>
      </form>
    </div>
  );
}
