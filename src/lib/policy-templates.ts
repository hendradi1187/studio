// Policy Templates Library for SPEKTOR SDSC
// Professional templates for common data governance scenarios

export interface PolicyTemplate {
  id: string;
  name: string;
  description: string;
  policyType: 'access' | 'contract' | 'usage';
  category: string;
  template: PolicyRules;
}

export interface PolicyRules {
  permissions: PolicyRule[];
  prohibitions: PolicyRule[];
  obligations: PolicyRule[];
  conditions?: PolicyCondition[];
}

export interface PolicyRule {
  id: string;
  action: string;
  resource: string;
  constraint?: PolicyConstraint[];
  description?: string;
}

export interface PolicyConstraint {
  leftOperand: string;
  operator: string;
  rightOperand: string | number | boolean;
}

export interface PolicyCondition {
  type: 'temporal' | 'spatial' | 'count' | 'event';
  parameters: Record<string, any>;
}

// Policy Templates Collection
export const POLICY_TEMPLATES: PolicyTemplate[] = [
  // Access Policies
  {
    id: 'public-read-access',
    name: 'Public Read Access',
    description: 'Allow public read access to non-sensitive data',
    policyType: 'access',
    category: 'Public Access',
    template: {
      permissions: [
        {
          id: 'p1',
          action: 'read',
          resource: 'dataset',
          description: 'Allow reading dataset content'
        },
        {
          id: 'p2',
          action: 'download',
          resource: 'metadata',
          description: 'Allow downloading metadata'
        }
      ],
      prohibitions: [
        {
          id: 'pr1',
          action: 'modify',
          resource: 'dataset',
          description: 'Prohibit any modifications'
        },
        {
          id: 'pr2',
          action: 'redistribute',
          resource: 'dataset',
          description: 'Prohibit redistribution'
        }
      ],
      obligations: [
        {
          id: 'o1',
          action: 'log',
          resource: 'access',
          description: 'Log all access attempts'
        }
      ]
    }
  },
  
  {
    id: 'restricted-internal-access',
    name: 'Restricted Internal Access',
    description: 'Internal access with role-based restrictions',
    policyType: 'access',
    category: 'Internal Access',
    template: {
      permissions: [
        {
          id: 'p1',
          action: 'read',
          resource: 'dataset',
          constraint: [
            {
              leftOperand: 'user.role',
              operator: 'in',
              rightOperand: ['analyst', 'manager', 'admin']
            }
          ],
          description: 'Allow read access for authorized roles'
        },
        {
          id: 'p2',
          action: 'export',
          resource: 'report',
          constraint: [
            {
              leftOperand: 'user.clearance',
              operator: 'gte',
              rightOperand: 'confidential'
            }
          ],
          description: 'Allow export for users with clearance'
        }
      ],
      prohibitions: [
        {
          id: 'pr1',
          action: 'access',
          resource: 'dataset',
          constraint: [
            {
              leftOperand: 'time.hour',
              operator: 'between',
              rightOperand: [22, 6]
            }
          ],
          description: 'Prohibit access during off-hours'
        }
      ],
      obligations: [
        {
          id: 'o1',
          action: 'notify',
          resource: 'admin',
          description: 'Notify admin of sensitive access'
        },
        {
          id: 'o2',
          action: 'encrypt',
          resource: 'data',
          description: 'Encrypt all data in transit'
        }
      ]
    }
  },

  // Contract Policies
  {
    id: 'standard-data-license',
    name: 'Standard Data License',
    description: 'Standard licensing terms for data sharing',
    policyType: 'contract',
    category: 'Licensing',
    template: {
      permissions: [
        {
          id: 'p1',
          action: 'use',
          resource: 'dataset',
          constraint: [
            {
              leftOperand: 'purpose',
              operator: 'eq',
              rightOperand: 'research'
            }
          ],
          description: 'Allow use for research purposes'
        },
        {
          id: 'p2',
          action: 'analyze',
          resource: 'dataset',
          description: 'Allow data analysis and processing'
        }
      ],
      prohibitions: [
        {
          id: 'pr1',
          action: 'commercialize',
          resource: 'dataset',
          description: 'Prohibit commercial use'
        },
        {
          id: 'pr2',
          action: 'share',
          resource: 'dataset',
          constraint: [
            {
              leftOperand: 'recipient.type',
              operator: 'neq',
              rightOperand: 'approved_partner'
            }
          ],
          description: 'Prohibit sharing with non-approved parties'
        }
      ],
      obligations: [
        {
          id: 'o1',
          action: 'attribute',
          resource: 'source',
          description: 'Provide proper attribution'
        },
        {
          id: 'o2',
          action: 'report',
          resource: 'usage',
          constraint: [
            {
              leftOperand: 'frequency',
              operator: 'eq',
              rightOperand: 'monthly'
            }
          ],
          description: 'Submit monthly usage reports'
        }
      ]
    }
  },

  {
    id: 'commercial-data-agreement',
    name: 'Commercial Data Agreement',
    description: 'Commercial licensing with payment terms',
    policyType: 'contract',
    category: 'Commercial',
    template: {
      permissions: [
        {
          id: 'p1',
          action: 'use',
          resource: 'dataset',
          constraint: [
            {
              leftOperand: 'payment.status',
              operator: 'eq',
              rightOperand: 'current'
            }
          ],
          description: 'Allow use with valid payment'
        },
        {
          id: 'p2',
          action: 'commercialize',
          resource: 'derivative_work',
          description: 'Allow commercialization of derivatives'
        }
      ],
      prohibitions: [
        {
          id: 'pr1',
          action: 'resell',
          resource: 'raw_dataset',
          description: 'Prohibit reselling raw data'
        }
      ],
      obligations: [
        {
          id: 'o1',
          action: 'pay',
          resource: 'license_fee',
          constraint: [
            {
              leftOperand: 'frequency',
              operator: 'eq',
              rightOperand: 'quarterly'
            }
          ],
          description: 'Pay quarterly license fees'
        },
        {
          id: 'o2',
          action: 'audit',
          resource: 'usage',
          description: 'Allow usage audits'
        }
      ]
    }
  },

  // Usage Policies
  {
    id: 'rate-limited-access',
    name: 'Rate Limited Access',
    description: 'Control access frequency and volume',
    policyType: 'usage',
    category: 'Rate Limiting',
    template: {
      permissions: [
        {
          id: 'p1',
          action: 'query',
          resource: 'api',
          constraint: [
            {
              leftOperand: 'requests.per_minute',
              operator: 'lte',
              rightOperand: 100
            }
          ],
          description: 'Allow up to 100 requests per minute'
        },
        {
          id: 'p2',
          action: 'download',
          resource: 'dataset',
          constraint: [
            {
              leftOperand: 'data.size',
              operator: 'lte',
              rightOperand: '10GB'
            }
          ],
          description: 'Allow downloads up to 10GB per session'
        }
      ],
      prohibitions: [
        {
          id: 'pr1',
          action: 'bulk_download',
          resource: 'dataset',
          constraint: [
            {
              leftOperand: 'time.duration',
              operator: 'lt',
              rightOperand: '24h'
            }
          ],
          description: 'Prohibit bulk downloads within 24h'
        }
      ],
      obligations: [
        {
          id: 'o1',
          action: 'throttle',
          resource: 'requests',
          description: 'Apply throttling when limits exceeded'
        },
        {
          id: 'o2',
          action: 'monitor',
          resource: 'usage_patterns',
          description: 'Monitor for abuse patterns'
        }
      ]
    }
  },

  {
    id: 'time-based-access',
    name: 'Time-based Access Control',
    description: 'Control access based on time windows',
    policyType: 'usage',
    category: 'Temporal Control',
    template: {
      permissions: [
        {
          id: 'p1',
          action: 'access',
          resource: 'dataset',
          constraint: [
            {
              leftOperand: 'time.day_of_week',
              operator: 'between',
              rightOperand: [1, 5]
            },
            {
              leftOperand: 'time.hour',
              operator: 'between',
              rightOperand: [8, 18]
            }
          ],
          description: 'Allow access during business hours (Mon-Fri, 8AM-6PM)'
        }
      ],
      prohibitions: [
        {
          id: 'pr1',
          action: 'access',
          resource: 'dataset',
          constraint: [
            {
              leftOperand: 'time.day_of_week',
              operator: 'in',
              rightOperand: [0, 6]
            }
          ],
          description: 'Prohibit weekend access'
        }
      ],
      obligations: [
        {
          id: 'o1',
          action: 'warn',
          resource: 'user',
          constraint: [
            {
              leftOperand: 'time.remaining',
              operator: 'lt',
              rightOperand: 30
            }
          ],
          description: 'Warn users 30 minutes before access window closes'
        }
      ]
    }
  },

  {
    id: 'geographic-restriction',
    name: 'Geographic Access Control',
    description: 'Restrict access based on geographic location',
    policyType: 'usage',
    category: 'Geographic Control',
    template: {
      permissions: [
        {
          id: 'p1',
          action: 'access',
          resource: 'dataset',
          constraint: [
            {
              leftOperand: 'location.country',
              operator: 'in',
              rightOperand: ['ID', 'MY', 'SG', 'TH', 'VN']
            }
          ],
          description: 'Allow access from ASEAN countries'
        }
      ],
      prohibitions: [
        {
          id: 'pr1',
          action: 'access',
          resource: 'sensitive_dataset',
          constraint: [
            {
              leftOperand: 'location.country',
              operator: 'not_in',
              rightOperand: ['ID']
            }
          ],
          description: 'Prohibit sensitive data access from outside Indonesia'
        }
      ],
      obligations: [
        {
          id: 'o1',
          action: 'verify',
          resource: 'location',
          description: 'Verify user location before access'
        },
        {
          id: 'o2',
          action: 'log',
          resource: 'geographic_access',
          description: 'Log all geographic access patterns'
        }
      ]
    }
  }
];

// Helper functions for policy template management
export const getPolicyTemplatesByType = (type: 'access' | 'contract' | 'usage'): PolicyTemplate[] => {
  return POLICY_TEMPLATES.filter(template => template.policyType === type);
};

export const getPolicyTemplatesByCategory = (category: string): PolicyTemplate[] => {
  return POLICY_TEMPLATES.filter(template => template.category === category);
};

export const getPolicyTemplate = (id: string): PolicyTemplate | undefined => {
  return POLICY_TEMPLATES.find(template => template.id === id);
};

export const getAllCategories = (): string[] => {
  return [...new Set(POLICY_TEMPLATES.map(template => template.category))];
};

// Validation helpers
export const validatePolicyRules = (rules: PolicyRules): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Validate permissions
  if (!rules.permissions || rules.permissions.length === 0) {
    errors.push('At least one permission rule is required');
  }

  // Validate rule structure
  const allRules = [...rules.permissions, ...rules.prohibitions, ...rules.obligations];
  allRules.forEach((rule, index) => {
    if (!rule.action || !rule.resource) {
      errors.push(`Rule ${index + 1}: Action and resource are required`);
    }

    // Validate constraints
    if (rule.constraint) {
      rule.constraint.forEach((constraint, cIndex) => {
        if (!constraint.leftOperand || !constraint.operator) {
          errors.push(`Rule ${index + 1}, Constraint ${cIndex + 1}: Invalid constraint structure`);
        }
      });
    }
  });

  return {
    valid: errors.length === 0,
    errors
  };
};

// Create policy from template
export const createPolicyFromTemplate = (
  templateId: string, 
  customizations?: Partial<PolicyRules>
): PolicyRules | null => {
  const template = getPolicyTemplate(templateId);
  if (!template) return null;

  const baseRules = JSON.parse(JSON.stringify(template.template));
  
  if (customizations) {
    return {
      permissions: customizations.permissions || baseRules.permissions,
      prohibitions: customizations.prohibitions || baseRules.prohibitions,
      obligations: customizations.obligations || baseRules.obligations,
      conditions: customizations.conditions || baseRules.conditions
    };
  }

  return baseRules;
};