/**
 * Optimization Operation
 * 
 * Applies optimization strategies and algorithms to find optimal solutions
 */

import { BaseOperation, type OperationContext, type OperationResult } from '../base.js';
import type { OptimizationResult } from '../../../types/index.js';

export class OptimizationOperation extends BaseOperation {
  name = 'optimization';
  category = 'analysis';
  
  async execute(context: OperationContext): Promise<OperationResult> {
    const { sessionState, prompt, parameters } = context;
    
    const optimizationType = this.getParam(parameters, 'optimizationType', 'gradient-descent') as 'gradient-descent' | 'genetic-algorithm' | 'simulated-annealing' | 'linear-programming' | 'particle-swarm' | 'grid-search';
    const objective = this.getParam(parameters, 'objective', 'maximize');
    const variables = (parameters.variables as string[]) || this.extractVariables(prompt);
    const constraints = (parameters.constraints as string[]) || this.extractConstraints(prompt);
    const bounds = (parameters.bounds as Record<string, [number, number]>) || {};
    const maxIterations = this.getParam(parameters, 'maxIterations', 100);
    
    let result: OptimizationResult;
    
    switch (optimizationType) {
      case 'gradient-descent':
        result = this.gradientDescentOptimization(variables, objective, bounds, maxIterations);
        break;
      case 'genetic-algorithm':
        const populationSize = this.getParam(parameters, 'populationSize', 50);
        result = this.geneticAlgorithmOptimization(variables, objective, bounds, populationSize, maxIterations);
        break;
      case 'simulated-annealing':
        const temperature = this.getParam(parameters, 'temperature', 1000);
        result = this.simulatedAnnealingOptimization(variables, objective, bounds, temperature, maxIterations);
        break;
      case 'linear-programming':
        result = this.linearProgrammingOptimization(variables, constraints, objective, bounds);
        break;
      case 'particle-swarm':
        const swarmSize = this.getParam(parameters, 'swarmSize', 30);
        result = this.particleSwarmOptimization(variables, objective, bounds, swarmSize, maxIterations);
        break;
      case 'grid-search':
        const gridResolution = this.getParam(parameters, 'gridResolution', 10);
        result = this.gridSearchOptimization(variables, objective, bounds, gridResolution);
        break;
      default:
        result = this.gradientDescentOptimization(variables, objective, bounds, maxIterations);
    }
    
    return this.createResult({
      optimizationType,
      objective,
      variables,
      constraints,
      result,
      analysis: this.analyzeOptimizationResult(result, optimizationType),
      recommendations: this.generateRecommendations(result, optimizationType),
      sensitivityAnalysis: this.performSensitivityAnalysis(result, variables),
      sessionContext: {
        sessionId: sessionState.sessionId,
        stats: sessionState.getStats(),
      },
    });
  }
  
  private extractVariables(prompt: string): string[] {
    const variables: string[] = [];
    
    // Look for optimization keywords and associated variables
    const optimizeKeywords = ['optimize', 'maximize', 'minimize', 'best', 'optimal'];
    const sentences = prompt.split(/[.!?]+/);
    
    for (const sentence of sentences) {
      if (optimizeKeywords.some(keyword => sentence.toLowerCase().includes(keyword))) {
        // Extract potential variables (nouns following keywords)
        const words = sentence.split(/\s+/);
        for (let i = 0; i < words.length - 1; i++) {
          if (optimizeKeywords.includes(words[i].toLowerCase())) {
            const nextWord = words[i + 1];
            if (nextWord && nextWord.length > 2) {
              variables.push(nextWord.toLowerCase());
            }
          }
        }
      }
    }
    
    // Default variables if none found
    if (variables.length === 0) {
      variables.push('x', 'y');
    }
    
    return [...new Set(variables)].slice(0, 5); // Remove duplicates, limit to 5
  }
  
  private extractConstraints(prompt: string): string[] {
    const constraints: string[] = [];
    const sentences = prompt.split(/[.!?]+/);
    
    for (const sentence of sentences) {
      const lower = sentence.toLowerCase();
      if (lower.includes('constraint') || lower.includes('limit') || 
          lower.includes('must') || lower.includes('cannot') ||
          lower.includes('<=') || lower.includes('>=') || lower.includes('<') || lower.includes('>')) {
        constraints.push(sentence.trim());
      }
    }
    
    return constraints;
  }
  
  private gradientDescentOptimization(
    variables: string[],
    objective: string,
    bounds: Record<string, [number, number]>,
    maxIterations: number
  ): OptimizationResult {
    const dim = variables.length;
    let solution = new Array(dim).fill(0).map(() => Math.random() * 10 - 5);
    const learningRate = 0.01;
    
    for (let iter = 0; iter < maxIterations; iter++) {
      const gradient = this.calculateNumericalGradient(solution, objective);
      
      // Update solution
      for (let i = 0; i < dim; i++) {
        if (objective === 'maximize') {
          solution[i] += learningRate * gradient[i];
        } else {
          solution[i] -= learningRate * gradient[i];
        }
        
        // Apply bounds
        const varName = variables[i];
        if (bounds[varName]) {
          solution[i] = Math.max(bounds[varName][0], Math.min(bounds[varName][1], solution[i]));
        }
      }
    }
    
    const finalObjective = this.evaluateObjectiveFunction(solution, objective);
    
    return {
      bestDecisionVector: solution,
      bestObjective: finalObjective,
      iterations: maxIterations,
      constraintsSatisfied: this.checkConstraints(solution, bounds)
    };
  }
  
  private geneticAlgorithmOptimization(
    variables: string[],
    objective: string,
    bounds: Record<string, [number, number]>,
    populationSize: number,
    maxIterations: number
  ): OptimizationResult {
    const dim = variables.length;
    let population = this.initializePopulation(populationSize, dim, bounds, variables);
    
    for (let generation = 0; generation < maxIterations; generation++) {
      // Evaluate fitness
      const fitness = population.map(individual => 
        this.evaluateObjectiveFunction(individual, objective)
      );
      
      // Selection (tournament selection)
      const newPopulation: number[][] = [];
      for (let i = 0; i < populationSize; i++) {
        const parent1 = this.tournamentSelection(population, fitness, objective);
        const parent2 = this.tournamentSelection(population, fitness, objective);
        
        // Crossover
        const offspring = this.crossover(parent1, parent2);
        
        // Mutation
        this.mutate(offspring, bounds, variables, 0.1);
        
        newPopulation.push(offspring);
      }
      
      population = newPopulation;
    }
    
    // Find best solution
    const finalFitness = population.map(individual => 
      this.evaluateObjectiveFunction(individual, objective)
    );
    
    const bestIndex = objective === 'maximize' 
      ? finalFitness.indexOf(Math.max(...finalFitness))
      : finalFitness.indexOf(Math.min(...finalFitness));
    
    return {
      bestDecisionVector: population[bestIndex],
      bestObjective: finalFitness[bestIndex],
      iterations: maxIterations,
      constraintsSatisfied: this.checkConstraints(population[bestIndex], bounds)
    };
  }
  
  private simulatedAnnealingOptimization(
    variables: string[],
    objective: string,
    bounds: Record<string, [number, number]>,
    initialTemperature: number,
    maxIterations: number
  ): OptimizationResult {
    const dim = variables.length;
    let currentSolution = new Array(dim).fill(0).map(() => Math.random() * 10 - 5);
    let currentObjective = this.evaluateObjectiveFunction(currentSolution, objective);
    
    let bestSolution = [...currentSolution];
    let bestObjective = currentObjective;
    
    for (let iter = 0; iter < maxIterations; iter++) {
      const temperature = initialTemperature * (1 - iter / maxIterations);
      
      // Generate neighbor solution
      const neighborSolution = currentSolution.map(x => x + (Math.random() - 0.5) * 2);
      
      // Apply bounds
      for (let i = 0; i < dim; i++) {
        const varName = variables[i];
        if (bounds[varName]) {
          neighborSolution[i] = Math.max(bounds[varName][0], Math.min(bounds[varName][1], neighborSolution[i]));
        }
      }
      
      const neighborObjective = this.evaluateObjectiveFunction(neighborSolution, objective);
      
      // Accept or reject neighbor
      const delta = objective === 'maximize' 
        ? neighborObjective - currentObjective
        : currentObjective - neighborObjective;
      
      if (delta > 0 || Math.exp(delta / temperature) > Math.random()) {
        currentSolution = neighborSolution;
        currentObjective = neighborObjective;
        
        // Update best solution
        const isBetter = objective === 'maximize' 
          ? neighborObjective > bestObjective
          : neighborObjective < bestObjective;
        
        if (isBetter) {
          bestSolution = [...neighborSolution];
          bestObjective = neighborObjective;
        }
      }
    }
    
    return {
      bestDecisionVector: bestSolution,
      bestObjective: bestObjective,
      iterations: maxIterations,
      constraintsSatisfied: this.checkConstraints(bestSolution, bounds)
    };
  }
  
  private linearProgrammingOptimization(
    variables: string[],
    constraints: string[],
    objective: string,
    bounds: Record<string, [number, number]>
  ): OptimizationResult {
    // Simplified linear programming using trial points
    const dim = variables.length;
    const numTrialPoints = 1000;
    let bestSolution: number[] = [];
    let bestObjective = objective === 'maximize' ? -Infinity : Infinity;
    
    for (let trial = 0; trial < numTrialPoints; trial++) {
      const solution = new Array(dim).fill(0).map(() => Math.random() * 20 - 10);
      
      // Apply bounds
      for (let i = 0; i < dim; i++) {
        const varName = variables[i];
        if (bounds[varName]) {
          solution[i] = Math.max(bounds[varName][0], Math.min(bounds[varName][1], solution[i]));
        }
      }
      
      // Check if solution satisfies constraints (simplified)
      if (this.satisfiesLinearConstraints(solution, constraints)) {
        const objectiveValue = this.evaluateLinearObjective(solution, objective);
        
        const isBetter = objective === 'maximize' 
          ? objectiveValue > bestObjective
          : objectiveValue < bestObjective;
        
        if (isBetter) {
          bestSolution = [...solution];
          bestObjective = objectiveValue;
        }
      }
    }
    
    return {
      bestDecisionVector: bestSolution,
      bestObjective: bestObjective,
      iterations: numTrialPoints,
      constraintsSatisfied: bestSolution.length > 0
    };
  }
  
  private particleSwarmOptimization(
    variables: string[],
    objective: string,
    bounds: Record<string, [number, number]>,
    swarmSize: number,
    maxIterations: number
  ): OptimizationResult {
    const dim = variables.length;
    
    // Initialize particles
    const particles = Array.from({ length: swarmSize }, () => ({
      position: new Array(dim).fill(0).map(() => Math.random() * 10 - 5),
      velocity: new Array(dim).fill(0).map(() => (Math.random() - 0.5) * 2),
      bestPosition: new Array(dim).fill(0),
      bestFitness: objective === 'maximize' ? -Infinity : Infinity
    }));
    
    let globalBestPosition = new Array(dim).fill(0);
    let globalBestFitness = objective === 'maximize' ? -Infinity : Infinity;
    
    // Initialize personal and global bests
    for (const particle of particles) {
      const fitness = this.evaluateObjectiveFunction(particle.position, objective);
      particle.bestPosition = [...particle.position];
      particle.bestFitness = fitness;
      
      const isBetter = objective === 'maximize' ? fitness > globalBestFitness : fitness < globalBestFitness;
      if (isBetter) {
        globalBestPosition = [...particle.position];
        globalBestFitness = fitness;
      }
    }
    
    const w = 0.729; // Inertia weight
    const c1 = 1.49445; // Cognitive component
    const c2 = 1.49445; // Social component
    
    for (let iter = 0; iter < maxIterations; iter++) {
      for (const particle of particles) {
        // Update velocity
        for (let d = 0; d < dim; d++) {
          const r1 = Math.random();
          const r2 = Math.random();
          
          particle.velocity[d] = w * particle.velocity[d] +
            c1 * r1 * (particle.bestPosition[d] - particle.position[d]) +
            c2 * r2 * (globalBestPosition[d] - particle.position[d]);
        }
        
        // Update position
        for (let d = 0; d < dim; d++) {
          particle.position[d] += particle.velocity[d];
          
          // Apply bounds
          const varName = variables[d];
          if (bounds[varName]) {
            particle.position[d] = Math.max(bounds[varName][0], Math.min(bounds[varName][1], particle.position[d]));
          }
        }
        
        // Evaluate fitness
        const fitness = this.evaluateObjectiveFunction(particle.position, objective);
        
        // Update personal best
        const isBetterPersonal = objective === 'maximize' 
          ? fitness > particle.bestFitness 
          : fitness < particle.bestFitness;
        
        if (isBetterPersonal) {
          particle.bestPosition = [...particle.position];
          particle.bestFitness = fitness;
          
          // Update global best
          const isBetterGlobal = objective === 'maximize' 
            ? fitness > globalBestFitness 
            : fitness < globalBestFitness;
          
          if (isBetterGlobal) {
            globalBestPosition = [...particle.position];
            globalBestFitness = fitness;
          }
        }
      }
    }
    
    return {
      bestDecisionVector: globalBestPosition,
      bestObjective: globalBestFitness,
      iterations: maxIterations,
      constraintsSatisfied: this.checkConstraints(globalBestPosition, bounds)
    };
  }
  
  private gridSearchOptimization(
    variables: string[],
    objective: string,
    bounds: Record<string, [number, number]>,
    gridResolution: number
  ): OptimizationResult {
    const dim = variables.length;
    let bestSolution: number[] = [];
    let bestObjective = objective === 'maximize' ? -Infinity : Infinity;
    let totalEvaluations = 0;
    
    const generateGridPoints = (dimension: number, currentPoint: number[]): void => {
      if (dimension === dim) {
        const objectiveValue = this.evaluateObjectiveFunction(currentPoint, objective);
        totalEvaluations++;
        
        const isBetter = objective === 'maximize' 
          ? objectiveValue > bestObjective
          : objectiveValue < bestObjective;
        
        if (isBetter) {
          bestSolution = [...currentPoint];
          bestObjective = objectiveValue;
        }
        return;
      }
      
      const varName = variables[dimension];
      const [min, max] = bounds[varName] || [-10, 10];
      
      for (let i = 0; i < gridResolution; i++) {
        const value = min + (max - min) * i / (gridResolution - 1);
        currentPoint[dimension] = value;
        generateGridPoints(dimension + 1, currentPoint);
      }
    };
    
    generateGridPoints(0, new Array(dim));
    
    return {
      bestDecisionVector: bestSolution,
      bestObjective: bestObjective,
      iterations: totalEvaluations,
      constraintsSatisfied: true
    };
  }
  
  // Helper methods
  private evaluateObjectiveFunction(solution: number[], objective: string): number {
    // Simple test function (sphere function)
    const value = solution.reduce((sum, x) => sum + x * x, 0);
    return objective === 'maximize' ? -value : value;
  }
  
  private evaluateLinearObjective(solution: number[], objective: string): number {
    // Simple linear objective: sum of variables
    const value = solution.reduce((sum, x) => sum + x, 0);
    return objective === 'maximize' ? value : -value;
  }
  
  private calculateNumericalGradient(solution: number[], objective: string): number[] {
    const gradient: number[] = [];
    const h = 1e-5;
    
    for (let i = 0; i < solution.length; i++) {
      const solutionPlus = [...solution];
      const solutionMinus = [...solution];
      
      solutionPlus[i] += h;
      solutionMinus[i] -= h;
      
      const fPlus = this.evaluateObjectiveFunction(solutionPlus, objective);
      const fMinus = this.evaluateObjectiveFunction(solutionMinus, objective);
      
      gradient[i] = (fPlus - fMinus) / (2 * h);
    }
    
    return gradient;
  }
  
  private initializePopulation(
    populationSize: number,
    dim: number,
    bounds: Record<string, [number, number]>,
    variables: string[]
  ): number[][] {
    const population: number[][] = [];
    
    for (let i = 0; i < populationSize; i++) {
      const individual: number[] = [];
      for (let j = 0; j < dim; j++) {
        const varName = variables[j];
        const [min, max] = bounds[varName] || [-10, 10];
        individual.push(Math.random() * (max - min) + min);
      }
      population.push(individual);
    }
    
    return population;
  }
  
  private tournamentSelection(population: number[][], fitness: number[], objective: string): number[] {
    const tournamentSize = 3;
    let bestIndex = Math.floor(Math.random() * population.length);
    
    for (let i = 1; i < tournamentSize; i++) {
      const candidateIndex = Math.floor(Math.random() * population.length);
      const isBetter = objective === 'maximize' 
        ? fitness[candidateIndex] > fitness[bestIndex]
        : fitness[candidateIndex] < fitness[bestIndex];
      
      if (isBetter) {
        bestIndex = candidateIndex;
      }
    }
    
    return [...population[bestIndex]];
  }
  
  private crossover(parent1: number[], parent2: number[]): number[] {
    const offspring: number[] = [];
    for (let i = 0; i < parent1.length; i++) {
      offspring.push(Math.random() < 0.5 ? parent1[i] : parent2[i]);
    }
    return offspring;
  }
  
  private mutate(
    individual: number[],
    bounds: Record<string, [number, number]>,
    variables: string[],
    mutationRate: number
  ): void {
    for (let i = 0; i < individual.length; i++) {
      if (Math.random() < mutationRate) {
        const varName = variables[i];
        const [min, max] = bounds[varName] || [-10, 10];
        individual[i] += (Math.random() - 0.5) * (max - min) * 0.1;
        individual[i] = Math.max(min, Math.min(max, individual[i]));
      }
    }
  }
  
  private checkConstraints(solution: number[], bounds: Record<string, [number, number]>): boolean {
    // Check if solution satisfies bounds
    for (const [varName, [min, max]] of Object.entries(bounds)) {
      const varIndex = Object.keys(bounds).indexOf(varName);
      if (varIndex >= 0 && varIndex < solution.length) {
        if (solution[varIndex] < min || solution[varIndex] > max) {
          return false;
        }
      }
    }
    return true;
  }
  
  private satisfiesLinearConstraints(solution: number[], constraints: string[]): boolean {
    // Simplified constraint checking
    // In a real implementation, this would parse and evaluate constraint expressions
    return true;
  }
  
  private analyzeOptimizationResult(result: OptimizationResult, optimizationType: string): Record<string, any> {
    const analysis: Record<string, any> = {};
    
    analysis.convergence = {
      iterations: result.iterations,
      constraintsSatisfied: result.constraintsSatisfied,
      objectiveValue: result.bestObjective
    };
    
    analysis.solutionQuality = this.assessSolutionQuality(result, optimizationType);
    
    return analysis;
  }
  
  private assessSolutionQuality(result: OptimizationResult, optimizationType: string): string {
    if (!result.constraintsSatisfied) {
      return 'Poor - constraints violated';
    }
    
    // Simple quality assessment based on objective value
    const objectiveValue = Math.abs(result.bestObjective);
    if (objectiveValue < 1) return 'Excellent';
    if (objectiveValue < 10) return 'Good';
    if (objectiveValue < 100) return 'Fair';
    return 'Poor';
  }
  
  private performSensitivityAnalysis(result: OptimizationResult, variables: string[]): Record<string, number> {
    const sensitivity: Record<string, number> = {};
    const baseObjective = result.bestObjective;
    const perturbation = 0.01;
    
    for (let i = 0; i < variables.length && i < result.bestDecisionVector.length; i++) {
      const perturbedSolution = [...result.bestDecisionVector];
      perturbedSolution[i] += perturbation;
      
      const perturbedObjective = this.evaluateObjectiveFunction(perturbedSolution, 'minimize');
      sensitivity[variables[i]] = Math.abs(perturbedObjective - baseObjective) / perturbation;
    }
    
    return sensitivity;
  }
  
  private generateRecommendations(result: OptimizationResult, optimizationType: string): string[] {
    const recommendations: string[] = [];
    
    if (!result.constraintsSatisfied) {
      recommendations.push('Review and relax constraints if possible');
      recommendations.push('Consider penalty methods to handle constraint violations');
    }
    
    if (result.iterations >= 100) {
      recommendations.push('Consider increasing iteration limit for potentially better solutions');
    }
    
    switch (optimizationType) {
      case 'gradient-descent':
        recommendations.push('Try different learning rates or adaptive learning rate schedules');
        break;
      case 'genetic-algorithm':
        recommendations.push('Experiment with different crossover and mutation operators');
        break;
      case 'simulated-annealing':
        recommendations.push('Adjust cooling schedule for better exploration-exploitation balance');
        break;
      case 'particle-swarm':
        recommendations.push('Tune inertia weight and acceleration coefficients');
        break;
    }
    
    recommendations.push('Validate solution with domain experts');
    recommendations.push('Consider multi-objective optimization if trade-offs exist');
    
    return recommendations;
  }
}

export default new OptimizationOperation();