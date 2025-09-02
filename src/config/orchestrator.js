/**
 * Orchestrator Implementation
 * Controls agent workflow with single-approval autonomous execution
 */

import { AGENT_BEHAVIORS, ORCHESTRATOR_CONFIG, WORKFLOW_RULES, HANDOFF_MATRIX } from './agentBehaviors.js'

class Orchestrator {
  constructor() {
    this.config = ORCHESTRATOR_CONFIG
    this.agents = AGENT_BEHAVIORS
    this.workflow = WORKFLOW_RULES
    this.currentPlan = null
    this.executionState = 'IDLE'
    this.approvalReceived = false
  }

  /**
   * Main workflow execution
   */
  async executeCommand(userCommand) {
    // Stage 1: Parse command
    const parsedCommand = this.parseCommand(userCommand)
    
    // Stage 2: Create plan
    const plan = await this.createPlan(parsedCommand)
    
    // Stage 3: Agent consultation
    const consultationResult = await this.consultAgents(plan)
    
    // Stage 4: Arbitration if needed
    if (consultationResult.hasDisputes) {
      plan.final = this.arbitrate(consultationResult)
    }
    
    // Stage 5: Request user approval
    const approval = await this.requestApproval(plan.final || plan)
    
    // Stage 6: Execute if approved
    if (approval.approved) {
      return await this.executeAutonomously(plan.final || plan)
    } else if (approval.corrections) {
      return await this.handleCorrections(approval.corrections)
    }
    
    return { status: 'CANCELLED', reason: 'User declined approval' }
  }

  /**
   * Parse user command to identify requirements
   */
  parseCommand(command) {
    return {
      text: command,
      complexity: this.assessComplexity(command),
      requiredAgents: this.identifyRequiredAgents(command),
      estimatedDuration: this.estimateDuration(command)
    }
  }

  /**
   * Create execution plan
   */
  async createPlan(parsedCommand) {
    const plan = {
      id: Date.now(),
      command: parsedCommand,
      steps: [],
      agents: [],
      parallelizable: [],
      estimatedTime: 0
    }

    // Determine agent sequence
    for (const agentId of parsedCommand.requiredAgents) {
      const agent = this.agents[agentId]
      plan.agents.push({
        id: agentId,
        priority: agent.consultation_priority,
        duration: agent.execution_rules.max_duration_ms,
        parallel: agent.execution_rules.parallel_enabled
      })
    }

    // Sort by priority
    plan.agents.sort((a, b) => a.priority - b.priority)
    
    // Create execution steps
    plan.steps = this.createExecutionSteps(plan.agents)
    plan.estimatedTime = this.calculateTotalTime(plan.steps)
    
    return plan
  }

  /**
   * Consult agents about the plan
   */
  async consultAgents(plan) {
    const consultations = []
    const timeout = this.config.planning.max_consultation_time_ms
    
    // Parallel consultation
    const consultationPromises = plan.agents.map(agent => 
      this.consultAgent(agent.id, plan, timeout)
    )
    
    const results = await Promise.allSettled(consultationPromises)
    
    // Analyze consultation results
    const disputes = this.analyzeDisputes(results)
    
    return {
      consultations: results,
      hasDisputes: disputes.length > 0,
      disputes: disputes
    }
  }

  /**
   * Arbitrate disputes between agents
   */
  arbitrate(consultationResult) {
    const resolution = {
      method: this.config.arbitration.resolution_strategy,
      decisions: []
    }
    
    for (const dispute of consultationResult.disputes) {
      // Orchestrator makes final decision
      const decision = this.makeArbitrationDecision(dispute)
      resolution.decisions.push(decision)
    }
    
    // Update plan based on arbitration
    return this.applyArbitrationDecisions(consultationResult, resolution)
  }

  /**
   * Request user approval (SINGLE CHECKPOINT)
   */
  async requestApproval(plan) {
    // Format plan for user review
    const formattedPlan = this.formatPlanForApproval(plan)
    
    // Present to user and wait for response
    console.log('\n=== PLAN FOR APPROVAL ===')
    console.log(formattedPlan)
    console.log('=========================\n')
    
    // In real implementation, this would wait for user input
    // For now, return structure for approval
    return {
      plan: formattedPlan,
      requiresApproval: true,
      approved: false,
      corrections: null
    }
  }

  /**
   * Execute plan autonomously (NO INTERRUPTIONS)
   */
  async executeAutonomously(plan) {
    this.executionState = 'EXECUTING'
    const results = []
    
    try {
      // Execute each step
      for (const step of plan.steps) {
        if (step.parallel) {
          // Execute parallel steps
          const parallelResults = await this.executeParallel(step.agents)
          results.push(...parallelResults)
        } else {
          // Execute sequential step
          const result = await this.executeAgent(step.agentId, step.task)
          results.push(result)
          
          // Automatic handoff
          if (HANDOFF_MATRIX[step.agentId]) {
            await this.performHandoff(step.agentId, HANDOFF_MATRIX[step.agentId], result)
          }
        }
      }
      
      this.executionState = 'COMPLETED'
      return {
        status: 'SUCCESS',
        results: results,
        summary: this.createExecutionSummary(results)
      }
    } catch (error) {
      this.executionState = 'ERROR'
      return {
        status: 'ERROR',
        error: error.message,
        partialResults: results
      }
    }
  }

  /**
   * Handle user corrections
   */
  async handleCorrections(corrections) {
    if (this.workflow.approval.corrections_allowed) {
      // Apply corrections to plan
      const correctedPlan = this.applyCorrectionsToPlan(this.currentPlan, corrections)
      
      // Re-consult if needed
      const consultationResult = await this.consultAgents(correctedPlan)
      
      // Request approval again
      return await this.requestApproval(correctedPlan)
    }
    
    return { status: 'CORRECTIONS_NOT_ALLOWED' }
  }

  // Helper methods
  assessComplexity(command) {
    const keywords = command.toLowerCase()
    if (keywords.includes('fix') || keywords.includes('bug')) return 'SIMPLE'
    if (keywords.includes('implement') || keywords.includes('create')) return 'MEDIUM'
    if (keywords.includes('refactor') || keywords.includes('redesign')) return 'COMPLEX'
    return 'MEDIUM'
  }

  identifyRequiredAgents(command) {
    const agents = []
    const keywords = command.toLowerCase()
    
    if (keywords.includes('research') || keywords.includes('analyze')) agents.push('RESEARCH')
    if (keywords.includes('plan') || keywords.includes('design')) agents.push('PLANNING')
    if (keywords.includes('implement') || keywords.includes('code')) agents.push('IMPLEMENTATION')
    if (keywords.includes('ui') || keywords.includes('frontend')) agents.push('FRONTEND')
    if (keywords.includes('fix') || keywords.includes('debug')) agents.push('TROUBLESHOOTING')
    if (keywords.includes('deploy') || keywords.includes('commit')) agents.push('FINALIZATION')
    
    // Default to planning and implementation if no specific agents identified
    if (agents.length === 0) {
      agents.push('PLANNING', 'IMPLEMENTATION')
    }
    
    return agents
  }

  estimateDuration(command) {
    const complexity = this.assessComplexity(command)
    const multipliers = { SIMPLE: 1, MEDIUM: 2, COMPLEX: 3 }
    return 30000 * multipliers[complexity] // Base 30 seconds
  }

  createExecutionSteps(agents) {
    const steps = []
    const grouped = this.groupParallelAgents(agents)
    
    for (const group of grouped) {
      if (group.length > 1) {
        steps.push({
          parallel: true,
          agents: group,
          task: 'Execute parallel tasks'
        })
      } else {
        steps.push({
          parallel: false,
          agentId: group[0].id,
          task: `Execute ${group[0].id} tasks`
        })
      }
    }
    
    return steps
  }

  groupParallelAgents(agents) {
    const groups = []
    let currentGroup = []
    
    for (const agent of agents) {
      if (agent.parallel && currentGroup.length > 0) {
        currentGroup.push(agent)
      } else {
        if (currentGroup.length > 0) {
          groups.push(currentGroup)
        }
        currentGroup = [agent]
      }
    }
    
    if (currentGroup.length > 0) {
      groups.push(currentGroup)
    }
    
    return groups
  }

  calculateTotalTime(steps) {
    let total = 0
    for (const step of steps) {
      if (step.parallel) {
        total += Math.max(...step.agents.map(a => a.duration))
      } else {
        total += this.agents[step.agentId].execution_rules.max_duration_ms
      }
    }
    return total
  }

  formatPlanForApproval(plan) {
    const lines = []
    lines.push(`COMMAND: ${plan.command.text}`)
    lines.push(`COMPLEXITY: ${plan.command.complexity}`)
    lines.push(`ESTIMATED TIME: ${plan.estimatedTime / 1000}s`)
    lines.push('\nEXECUTION STEPS:')
    
    plan.steps.forEach((step, i) => {
      if (step.parallel) {
        lines.push(`${i + 1}. [PARALLEL] ${step.agents.map(a => a.id).join(', ')}`)
      } else {
        lines.push(`${i + 1}. ${step.agentId}: ${step.task}`)
      }
    })
    
    lines.push('\nType "APPROVE" to execute or provide corrections')
    
    return lines.join('\n')
  }

  createExecutionSummary(results) {
    return {
      totalAgents: results.length,
      successful: results.filter(r => r.status === 'SUCCESS').length,
      failed: results.filter(r => r.status === 'ERROR').length,
      changes: results.reduce((acc, r) => acc + (r.changes || 0), 0)
    }
  }

  // Stub methods for agent interaction
  async consultAgent(agentId, plan, timeout) {
    // In real implementation, would consult actual agent
    return { agentId, feedback: 'APPROVED', concerns: [] }
  }

  analyzeDisputes(results) {
    // Analyze consultation results for disputes
    return []
  }

  makeArbitrationDecision(dispute) {
    // Orchestrator makes final decision
    return { dispute, resolution: 'ORCHESTRATOR_OVERRIDE' }
  }

  applyArbitrationDecisions(consultationResult, resolution) {
    // Apply arbitration decisions to plan
    return this.currentPlan
  }

  async executeAgent(agentId, task) {
    // Execute agent task
    return { agentId, task, status: 'SUCCESS', changes: 1 }
  }

  async executeParallel(agents) {
    // Execute agents in parallel
    const promises = agents.map(a => this.executeAgent(a.id, 'Parallel task'))
    return await Promise.all(promises)
  }

  async performHandoff(fromAgent, toAgents, result) {
    // Perform automatic handoff
    console.log(`Handoff: ${fromAgent} -> ${toAgents.join(', ')}`)
  }

  applyCorrectionsToPlan(plan, corrections) {
    // Apply user corrections to plan
    return { ...plan, corrections: corrections }
  }
}

// Export singleton instance
export default new Orchestrator()