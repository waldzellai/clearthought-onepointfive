/**
 * Simulation Operation
 * 
 * Runs simulations and models to understand system behavior
 */

import { BaseOperation, type OperationContext, type OperationResult } from '../base.js';
import type { SimulationResult } from '../../../types/index.js';

export class SimulationOperation extends BaseOperation {
  name = 'simulation';
  category = 'analysis';
  
  async execute(context: OperationContext): Promise<OperationResult> {
    const { sessionState, prompt, parameters } = context;
    
    const simulationType = this.getParam(parameters, 'simulationType', 'system-dynamics') as 'system-dynamics' | 'agent-based' | 'monte-carlo' | 'discrete-event' | 'cellular-automata';
    const steps = this.getParam(parameters, 'steps', 100);
    const initialState = (parameters.initialState as Record<string, number>) || this.parseInitialState(prompt);
    const rules = (parameters.rules as string[]) || this.extractRules(prompt);
    const timeStep = this.getParam(parameters, 'timeStep', 1);
    
    let result: SimulationResult;
    
    switch (simulationType) {
      case 'system-dynamics':
        result = this.runSystemDynamicsSimulation(initialState, rules, steps, timeStep);
        break;
      case 'agent-based':
        const agentCount = this.getParam(parameters, 'agentCount', 10);
        result = this.runAgentBasedSimulation(agentCount, rules, steps);
        break;
      case 'monte-carlo':
        const iterations = this.getParam(parameters, 'iterations', 1000);
        result = this.runMonteCarloSimulation(initialState, rules, iterations);
        break;
      case 'discrete-event':
        const events = (parameters.events as Array<{time: number, type: string, data: any}>) || [];
        result = this.runDiscreteEventSimulation(initialState, events, steps);
        break;
      case 'cellular-automata':
        const gridSize = this.getParam(parameters, 'gridSize', 10);
        result = this.runCellularAutomataSimulation(gridSize, rules, steps);
        break;
      default:
        result = this.runSystemDynamicsSimulation(initialState, rules, steps, timeStep);
    }
    
    return this.createResult({
      simulationType,
      result,
      parameters: {
        steps,
        timeStep,
        initialState,
        rules
      },
      analysis: this.analyzeSimulationResults(result),
      insights: this.generateInsights(result, simulationType),
      recommendations: this.generateRecommendations(result, simulationType),
      sessionContext: {
        sessionId: sessionState.sessionId,
        stats: sessionState.getStats(),
      },
    });
  }
  
  private parseInitialState(prompt: string): Record<string, number> {
    const state: Record<string, number> = {};
    
    // Look for variable assignments in the prompt
    const assignments = prompt.match(/([a-zA-Z_]\w*)\s*[=:]\s*(\d+(?:\.\d+)?)/g);
    if (assignments) {
      for (const assignment of assignments) {
        const match = assignment.match(/([a-zA-Z_]\w*)\s*[=:]\s*(\d+(?:\.\d+)?)/);
        if (match) {
          state[match[1]] = parseFloat(match[2]);
        }
      }
    }
    
    // Default state if nothing found
    if (Object.keys(state).length === 0) {
      state.population = 100;
      state.resources = 1000;
      state.growth_rate = 0.05;
    }
    
    return state;
  }
  
  private extractRules(prompt: string): string[] {
    const rules: string[] = [];
    
    // Look for rule-like statements
    const sentences = prompt.split(/[.!?]+/);
    for (const sentence of sentences) {
      const trimmed = sentence.trim().toLowerCase();
      if (trimmed.includes('if') || trimmed.includes('when') || trimmed.includes('increase') || trimmed.includes('decrease')) {
        rules.push(sentence.trim());
      }
    }
    
    // Default rules if none found
    if (rules.length === 0) {
      rules.push('population increases by growth_rate * population');
      rules.push('resources decrease by population * 0.1');
      rules.push('if resources < 100, growth_rate decreases');
    }
    
    return rules;
  }
  
  private runSystemDynamicsSimulation(
    initialState: Record<string, number>,
    rules: string[],
    steps: number,
    timeStep: number
  ): SimulationResult {
    const trajectory: Array<Record<string, number>> = [];
    let currentState = { ...initialState };
    
    for (let step = 0; step < steps; step++) {
      trajectory.push({ ...currentState, time: step * timeStep });
      
      // Apply rules to update state
      const newState = { ...currentState };
      
      // Simple rule interpreter
      for (const rule of rules) {
        this.applySystemDynamicsRule(rule, newState, timeStep);
      }
      
      currentState = newState;
    }
    
    return {
      steps,
      trajectory,
      finalState: currentState
    };
  }
  
  private applySystemDynamicsRule(rule: string, state: Record<string, number>, timeStep: number): void {
    const ruleLower = rule.toLowerCase();
    
    // Growth rule
    if (ruleLower.includes('population') && ruleLower.includes('growth_rate')) {
      const growthRate = state.growth_rate || 0.05;
      const population = state.population || 0;
      state.population = population + (population * growthRate * timeStep);
    }
    
    // Resource consumption
    if (ruleLower.includes('resources') && ruleLower.includes('decrease')) {
      const population = state.population || 0;
      const consumption = population * 0.1 * timeStep;
      state.resources = Math.max(0, (state.resources || 1000) - consumption);
    }
    
    // Resource constraint
    if (ruleLower.includes('resources < 100')) {
      if ((state.resources || 0) < 100) {
        state.growth_rate = Math.max(0, (state.growth_rate || 0.05) * 0.9);
      }
    }
  }
  
  private runAgentBasedSimulation(agentCount: number, rules: string[], steps: number): SimulationResult {
    const trajectory: Array<Record<string, number>> = [];
    
    // Initialize agents
    const agents = Array.from({ length: agentCount }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      energy: 100,
      state: 'active'
    }));
    
    for (let step = 0; step < steps; step++) {
      // Update agents
      for (const agent of agents) {
        agent.energy -= 1; // Energy decay
        
        if (agent.energy <= 0) {
          agent.state = 'inactive';
        } else {
          // Random movement
          agent.x += (Math.random() - 0.5) * 10;
          agent.y += (Math.random() - 0.5) * 10;
          
          // Boundary conditions
          agent.x = Math.max(0, Math.min(100, agent.x));
          agent.y = Math.max(0, Math.min(100, agent.y));
        }
      }
      
      // Record aggregate statistics
      const activeAgents = agents.filter(a => a.state === 'active').length;
      const avgEnergy = agents.reduce((sum, a) => sum + a.energy, 0) / agents.length;
      
      trajectory.push({
        time: step,
        active_agents: activeAgents,
        average_energy: avgEnergy,
        total_agents: agentCount
      });
    }
    
    const finalState = {
      active_agents: agents.filter(a => a.state === 'active').length,
      total_agents: agentCount,
      average_energy: agents.reduce((sum, a) => sum + a.energy, 0) / agents.length
    };
    
    return { steps, trajectory, finalState };
  }
  
  private runMonteCarloSimulation(
    initialState: Record<string, number>,
    rules: string[],
    iterations: number
  ): SimulationResult {
    const results: Array<Record<string, number>> = [];
    
    for (let i = 0; i < iterations; i++) {
      // Add randomness to initial state
      const randomizedState: Record<string, number> = {};
      for (const [key, value] of Object.entries(initialState)) {
        // Add ±20% random variation
        const variation = (Math.random() - 0.5) * 0.4;
        randomizedState[key] = value * (1 + variation);
      }
      
      // Run a short simulation
      const shortSim = this.runSystemDynamicsSimulation(randomizedState, rules, 10, 1);
      results.push({ iteration: i, ...shortSim.finalState });
    }
    
    // Calculate summary statistics
    const keys = Object.keys(results[0]).filter(k => k !== 'iteration');
    const finalState: Record<string, number> = {};
    
    for (const key of keys) {
      const values = results.map(r => r[key]).filter(v => typeof v === 'number');
      finalState[key] = values.reduce((sum, v) => sum + v, 0) / values.length;
      finalState[`${key}_std`] = Math.sqrt(
        values.reduce((sum, v) => sum + Math.pow(v - finalState[key], 2), 0) / values.length
      );
    }
    
    return {
      steps: iterations,
      trajectory: results,
      finalState
    };
  }
  
  private runDiscreteEventSimulation(
    initialState: Record<string, number>,
    events: Array<{time: number, type: string, data: any}>,
    maxTime: number
  ): SimulationResult {
    const trajectory: Array<Record<string, number>> = [];
    let currentState = { ...initialState };
    const sortedEvents = events.sort((a, b) => a.time - b.time);
    
    let eventIndex = 0;
    
    for (let time = 0; time < maxTime; time++) {
      // Process events at current time
      while (eventIndex < sortedEvents.length && sortedEvents[eventIndex].time <= time) {
        const event = sortedEvents[eventIndex];
        this.processEvent(event, currentState);
        eventIndex++;
      }
      
      trajectory.push({ time, ...currentState });
    }
    
    return {
      steps: maxTime,
      trajectory,
      finalState: currentState
    };
  }
  
  private processEvent(event: {time: number, type: string, data: any}, state: Record<string, number>): void {
    switch (event.type) {
      case 'increase':
        if (event.data.variable && typeof event.data.amount === 'number') {
          state[event.data.variable] = (state[event.data.variable] || 0) + event.data.amount;
        }
        break;
      case 'decrease':
        if (event.data.variable && typeof event.data.amount === 'number') {
          state[event.data.variable] = Math.max(0, (state[event.data.variable] || 0) - event.data.amount);
        }
        break;
      case 'set':
        if (event.data.variable && typeof event.data.value === 'number') {
          state[event.data.variable] = event.data.value;
        }
        break;
    }
  }
  
  private runCellularAutomataSimulation(gridSize: number, rules: string[], steps: number): SimulationResult {
    const trajectory: Array<Record<string, number>> = [];
    
    // Initialize grid
    let grid = Array.from({ length: gridSize }, () => 
      Array.from({ length: gridSize }, () => Math.random() > 0.5 ? 1 : 0)
    );
    
    for (let step = 0; step < steps; step++) {
      const newGrid = grid.map(row => [...row]);
      
      // Apply rules (simplified Conway's Game of Life)
      for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
          const neighbors = this.countNeighbors(grid, i, j);
          
          if (grid[i][j] === 1) {
            // Live cell
            newGrid[i][j] = (neighbors === 2 || neighbors === 3) ? 1 : 0;
          } else {
            // Dead cell
            newGrid[i][j] = (neighbors === 3) ? 1 : 0;
          }
        }
      }
      
      grid = newGrid;
      
      // Record statistics
      const aliveCells = grid.flat().reduce((sum: number, cell: number) => sum + cell, 0);
      trajectory.push({
        time: step,
        alive_cells: aliveCells,
        total_cells: gridSize * gridSize,
        density: aliveCells / (gridSize * gridSize)
      });
    }
    
    const finalAliveCells = grid.flat().reduce((sum: number, cell: number) => sum + cell, 0);
    const finalState = {
      alive_cells: finalAliveCells,
      total_cells: gridSize * gridSize,
      density: finalAliveCells / (gridSize * gridSize)
    };
    
    return { steps, trajectory, finalState };
  }
  
  private countNeighbors(grid: number[][], row: number, col: number): number {
    let count = 0;
    const size = grid.length;
    
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        if (i === 0 && j === 0) continue;
        
        const newRow = (row + i + size) % size;
        const newCol = (col + j + size) % size;
        count += grid[newRow][newCol];
      }
    }
    
    return count;
  }
  
  private analyzeSimulationResults(result: SimulationResult): Record<string, any> {
    const analysis: Record<string, any> = {};
    
    if (result.trajectory.length === 0) {
      return { error: 'No trajectory data to analyze' };
    }
    
    // Find trends in key variables
    const firstState = result.trajectory[0];
    const lastState = result.trajectory[result.trajectory.length - 1];
    
    analysis.trends = {};
    for (const key of Object.keys(firstState)) {
      if (typeof firstState[key] === 'number' && key !== 'time') {
        const initial = firstState[key];
        const final = lastState[key];
        const change = final - initial;
        const percentChange = initial !== 0 ? (change / initial) * 100 : 0;
        
        analysis.trends[key] = {
          change,
          percentChange,
          direction: change > 0 ? 'increasing' : change < 0 ? 'decreasing' : 'stable'
        };
      }
    }
    
    // Identify equilibrium
    analysis.equilibrium = this.checkEquilibrium(result.trajectory);
    
    // Find peaks and valleys
    analysis.extremes = this.findExtremes(result.trajectory);
    
    return analysis;
  }
  
  private checkEquilibrium(trajectory: Array<Record<string, number>>): Record<string, boolean> {
    const equilibrium: Record<string, boolean> = {};
    
    if (trajectory.length < 10) return equilibrium;
    
    const lastTenStates = trajectory.slice(-10);
    
    for (const key of Object.keys(trajectory[0])) {
      if (typeof trajectory[0][key] === 'number' && key !== 'time') {
        const values = lastTenStates.map(state => state[key]);
        const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
        const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
        
        // Consider equilibrium if variance is very small
        equilibrium[key] = variance < mean * 0.01;
      }
    }
    
    return equilibrium;
  }
  
  private findExtremes(trajectory: Array<Record<string, number>>): Record<string, any> {
    const extremes: Record<string, any> = {};
    
    for (const key of Object.keys(trajectory[0])) {
      if (typeof trajectory[0][key] === 'number' && key !== 'time') {
        const values = trajectory.map(state => state[key]);
        extremes[key] = {
          min: Math.min(...values),
          max: Math.max(...values),
          minTime: trajectory[values.indexOf(Math.min(...values))].time,
          maxTime: trajectory[values.indexOf(Math.max(...values))].time
        };
      }
    }
    
    return extremes;
  }
  
  private generateInsights(result: SimulationResult, simulationType: string): string[] {
    const insights: string[] = [];
    
    if (result.trajectory.length === 0) {
      insights.push('Simulation produced no data to analyze');
      return insights;
    }
    
    const analysis = this.analyzeSimulationResults(result);
    
    // General insights
    if (analysis.equilibrium) {
      const equilibriumVars = Object.entries(analysis.equilibrium)
        .filter(([, isEquilibrium]) => isEquilibrium)
        .map(([key]) => key);
      
      if (equilibriumVars.length > 0) {
        insights.push(`Variables reaching equilibrium: ${equilibriumVars.join(', ')}`);
      }
    }
    
    // Type-specific insights
    switch (simulationType) {
      case 'system-dynamics':
        insights.push('System dynamics simulation shows long-term behavior patterns');
        break;
      case 'agent-based':
        insights.push('Agent-based simulation reveals emergent collective behavior');
        break;
      case 'monte-carlo':
        insights.push('Monte Carlo simulation provides uncertainty estimates');
        break;
      case 'cellular-automata':
        insights.push('Cellular automata simulation shows spatial pattern evolution');
        break;
    }
    
    return insights;
  }
  
  private generateRecommendations(result: SimulationResult, simulationType: string): string[] {
    const recommendations: string[] = [];
    
    recommendations.push('Validate simulation results against real-world data if available');
    recommendations.push('Consider sensitivity analysis by varying key parameters');
    
    if (result.steps < 100) {
      recommendations.push('Consider running longer simulations to observe long-term behavior');
    }
    
    switch (simulationType) {
      case 'monte-carlo':
        recommendations.push('Increase number of iterations for more stable estimates');
        break;
      case 'agent-based':
        recommendations.push('Experiment with different agent behaviors and interaction rules');
        break;
      case 'system-dynamics':
        recommendations.push('Examine feedback loops and their stability');
        break;
    }
    
    return recommendations;
  }
}

export default new SimulationOperation();