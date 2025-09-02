/**
 * Agent Behavior Configuration
 * Defines autonomous execution rules for all agents
 */

export const AGENT_BEHAVIORS = {
  // Research Agent
  RESEARCH: {
    id: 'research_agent',
    autonomy_level: 'FULL',
    confirmation_required: false,
    consultation_priority: 1,
    capabilities: [
      'analyze_codebase',
      'identify_patterns',
      'find_dependencies',
      'assess_complexity'
    ],
    execution_rules: {
      max_duration_ms: 30000,
      can_access_external: false,
      parallel_enabled: true,
      handoff_automatic: true
    },
    communication: {
      style: 'TECHNICAL_CONCISE',
      max_tokens: 200,
      include_reasoning: false
    }
  },

  // Planning Agent
  PLANNING: {
    id: 'planning_agent',
    autonomy_level: 'FULL',
    confirmation_required: false,
    consultation_priority: 2,
    capabilities: [
      'create_implementation_plan',
      'identify_risks',
      'estimate_complexity',
      'define_success_criteria'
    ],
    execution_rules: {
      max_duration_ms: 20000,
      can_modify_plan: true,
      requires_orchestrator_approval: false,
      handoff_automatic: true
    },
    communication: {
      style: 'STRUCTURED_PLAN',
      max_tokens: 300,
      format: 'NUMBERED_LIST'
    }
  },

  // Implementation Agent
  IMPLEMENTATION: {
    id: 'implementation_agent',
    autonomy_level: 'FULL',
    confirmation_required: false,
    consultation_priority: 3,
    capabilities: [
      'write_code',
      'modify_files',
      'create_components',
      'refactor_existing'
    ],
    execution_rules: {
      max_duration_ms: 60000,
      batch_operations: true,
      auto_commit: false,
      handoff_automatic: true
    },
    communication: {
      style: 'ACTION_ONLY',
      max_tokens: 100,
      report_format: 'CHANGES_SUMMARY'
    }
  },

  // Frontend Agent
  FRONTEND: {
    id: 'frontend_agent',
    autonomy_level: 'FULL',
    confirmation_required: false,
    consultation_priority: 4,
    capabilities: [
      'ui_implementation',
      'responsive_design',
      'accessibility_compliance',
      'style_optimization'
    ],
    execution_rules: {
      max_duration_ms: 45000,
      parallel_with: ['IMPLEMENTATION'],
      auto_test: true,
      handoff_automatic: true
    },
    communication: {
      style: 'VISUAL_CONCISE',
      max_tokens: 150,
      include_screenshots: false
    }
  },

  // Troubleshooting Agent
  TROUBLESHOOTING: {
    id: 'troubleshooting_agent',
    autonomy_level: 'FULL',
    confirmation_required: false,
    consultation_priority: 5,
    capabilities: [
      'debug_errors',
      'analyze_performance',
      'security_audit',
      'test_coverage'
    ],
    execution_rules: {
      max_duration_ms: 40000,
      can_modify_code: true,
      auto_fix: true,
      handoff_automatic: true
    },
    communication: {
      style: 'PROBLEM_SOLUTION',
      max_tokens: 200,
      include_stack_traces: false
    }
  },

  // Finalization Agent
  FINALIZATION: {
    id: 'finalization_agent',
    autonomy_level: 'FULL',
    confirmation_required: false,
    consultation_priority: 6,
    capabilities: [
      'prepare_deployment',
      'create_documentation',
      'git_operations',
      'verify_completion'
    ],
    execution_rules: {
      max_duration_ms: 30000,
      auto_commit: true,
      auto_push: true,
      handoff_automatic: false
    },
    communication: {
      style: 'SUMMARY_ONLY',
      max_tokens: 250,
      format: 'BULLET_POINTS'
    }
  }
}

// Orchestrator Configuration
export const ORCHESTRATOR_CONFIG = {
  authority: 'SUPREME',
  arbitration: {
    enabled: true,
    timeout_ms: 5000,
    resolution_strategy: 'ORCHESTRATOR_DECIDES',
    agent_input_weight: 0.3
  },
  planning: {
    consultation_required: true,
    max_consultation_time_ms: 30000,
    parallel_consultation: true,
    dispute_threshold: 2
  },
  execution: {
    supervision_mode: 'PASSIVE',
    intervention_threshold: 'CRITICAL_ONLY',
    progress_reporting: 'SUMMARY',
    error_recovery: 'AUTONOMOUS'
  },
  communication: {
    with_user: {
      style: 'EXECUTIVE_SUMMARY',
      max_tokens: 500,
      approval_format: 'STRUCTURED_PLAN'
    },
    with_agents: {
      style: 'DIRECTIVE',
      max_tokens: 100,
      format: 'COMMAND'
    }
  }
}

// Workflow Rules
export const WORKFLOW_RULES = {
  approval: {
    required_after: 'PLANNING',
    type: 'EXPLICIT',
    timeout_ms: null,
    corrections_allowed: true,
    max_corrections: 3
  },
  execution: {
    mode: 'AUTONOMOUS',
    interruptions: 'PROHIBITED',
    parallel_tasks: true,
    max_parallel: 4,
    rollback_on_error: true
  },
  communication: {
    verbosity: 'MINIMAL',
    updates: 'CRITICAL_ONLY',
    format: 'STRUCTURED',
    no_pleasantries: true
  }
}

// Agent Handoff Matrix
export const HANDOFF_MATRIX = {
  RESEARCH: ['PLANNING', 'TROUBLESHOOTING'],
  PLANNING: ['IMPLEMENTATION', 'FRONTEND'],
  IMPLEMENTATION: ['FRONTEND', 'TROUBLESHOOTING', 'FINALIZATION'],
  FRONTEND: ['TROUBLESHOOTING', 'FINALIZATION'],
  TROUBLESHOOTING: ['IMPLEMENTATION', 'FINALIZATION'],
  FINALIZATION: [] // Terminal agent
}

// Export consolidated configuration
export default {
  agents: AGENT_BEHAVIORS,
  orchestrator: ORCHESTRATOR_CONFIG,
  workflow: WORKFLOW_RULES,
  handoffs: HANDOFF_MATRIX
}