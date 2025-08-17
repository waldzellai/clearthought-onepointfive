/**
 * Example structured data for Clear Thought operations
 * These serve as reference templates for models using the MCP server
 */

export const operationExamples = {
  // ============================================================================
  // Core Thinking Operations
  // ============================================================================
  
  sequential_thinking: {
    description: "Step-by-step reasoning with optional pattern selection",
    examples: [
      {
        prompt: "How can we reduce carbon emissions in urban transportation?",
        parameters: {
          pattern: "tree",
          thoughtNumber: 1,
          totalThoughts: 5,
          nextThoughtNeeded: true,
          patternParams: {
            depth: 3,
            breadth: 2
          }
        }
      },
      {
        prompt: "Analyze the implications of this decision",
        parameters: {
          pattern: "chain",
          thoughtNumber: 2,
          totalThoughts: 3,
          isRevision: false,
          needsMoreThoughts: true
        }
      }
    ]
  },

  systems_thinking: {
    description: "Analyze complex systems with components and relationships",
    examples: [
      {
        prompt: "Analyze the healthcare system",
        parameters: {
          components: ["patients", "doctors", "hospitals", "insurance", "pharmaceuticals", "government"],
          relationships: [
            { from: "patients", to: "doctors", type: "dependency", strength: 0.9 },
            { from: "doctors", to: "hospitals", type: "affiliation", strength: 0.7 },
            { from: "insurance", to: "patients", type: "coverage", strength: 0.8 },
            { from: "government", to: "insurance", type: "regulation", strength: 0.6 }
          ],
          feedbackLoops: [
            {
              components: ["patients", "insurance", "costs"],
              type: "negative",
              description: "Higher costs reduce patient access, reducing insurance claims"
            }
          ],
          emergentProperties: ["healthcare accessibility", "system efficiency", "cost inflation"],
          leveragePoints: ["insurance reform", "preventive care programs"]
        }
      }
    ]
  },

  causal_analysis: {
    description: "Build causal graphs and analyze interventions",
    examples: [
      {
        prompt: "Analyze causes of project delays",
        parameters: {
          graph: {
            nodes: ["scope_creep", "resource_shortage", "poor_planning", "delays", "budget_overrun"],
            edges: [
              { from: "scope_creep", to: "delays", weight: 0.8 },
              { from: "resource_shortage", to: "delays", weight: 0.7 },
              { from: "poor_planning", to: "scope_creep", weight: 0.6 },
              { from: "poor_planning", to: "resource_shortage", weight: 0.5 },
              { from: "delays", to: "budget_overrun", weight: 0.9 }
            ]
          },
          intervention: {
            variable: "poor_planning",
            change: -0.5
          }
        }
      }
    ]
  },

  creative_thinking: {
    description: "Generate creative ideas using various techniques",
    examples: [
      {
        prompt: "Design a new mobile app for elderly users",
        parameters: {
          techniques: ["SCAMPER", "brainstorming", "lateral_thinking"],
          numIdeas: 10,
          ideas: [
            "Voice-first interface with large buttons",
            "Medication reminder with family notifications",
            "Simplified video calling with one-touch access",
            "Health monitoring integration with wearables",
            "Emergency contact speed dial with location sharing"
          ]
        }
      }
    ]
  },

  // ============================================================================
  // Analytical Operations
  // ============================================================================

  decision_framework: {
    description: "Multi-criteria decision analysis",
    examples: [
      {
        prompt: "Choose the best cloud provider for our startup",
        parameters: {
          options: [
            { id: "aws", name: "Amazon Web Services", attributes: { cost: 7, features: 10, support: 8, ease: 6 } },
            { id: "gcp", name: "Google Cloud Platform", attributes: { cost: 8, features: 9, support: 7, ease: 8 } },
            { id: "azure", name: "Microsoft Azure", attributes: { cost: 7, features: 9, support: 9, ease: 7 } }
          ],
          criteria: [
            { name: "cost", weight: 0.3, type: "maximize" },
            { name: "features", weight: 0.3, type: "maximize" },
            { name: "support", weight: 0.2, type: "maximize" },
            { name: "ease", weight: 0.2, type: "maximize" }
          ],
          analysisType: "multi-criteria"
        }
      },
      {
        prompt: "Evaluate investment options",
        parameters: {
          options: [
            { id: "stocks", name: "Stock Portfolio" },
            { id: "bonds", name: "Bond Portfolio" },
            { id: "real_estate", name: "Real Estate" }
          ],
          possibleOutcomes: [
            { option: "stocks", probability: 0.6, value: 15000 },
            { option: "stocks", probability: 0.4, value: -5000 },
            { option: "bonds", probability: 0.8, value: 5000 },
            { option: "bonds", probability: 0.2, value: 1000 },
            { option: "real_estate", probability: 0.7, value: 8000 },
            { option: "real_estate", probability: 0.3, value: 2000 }
          ],
          analysisType: "expected-utility"
        }
      }
    ]
  },

  simulation: {
    description: "Run discrete-time simulations",
    examples: [
      {
        prompt: "Simulate population growth",
        parameters: {
          initial: { population: 1000, growth_rate: 0.02 },
          updateRules: [
            { target: "population", rule: "population * (1 + growth_rate)" },
            { target: "growth_rate", rule: "growth_rate * 0.99" }
          ],
          steps: 20
        }
      }
    ]
  },

  optimization: {
    description: "Find optimal solutions",
    examples: [
      {
        prompt: "Optimize resource allocation",
        parameters: {
          variables: {
            engineering: { min: 0, max: 100, step: 10 },
            marketing: { min: 0, max: 100, step: 10 },
            sales: { min: 0, max: 100, step: 10 }
          },
          objective: "engineering * 2 + marketing * 1.5 + sales * 1.8",
          constraints: "engineering + marketing + sales <= 100",
          method: "grid",
          iterations: 100
        }
      }
    ]
  },

  // ============================================================================
  // Reasoning Methods
  // ============================================================================

  scientific_method: {
    description: "Structure scientific inquiry",
    examples: [
      {
        prompt: "Does remote work increase productivity?",
        parameters: {
          stage: "hypothesis",
          hypothesis: "Remote work increases productivity by 15% due to reduced commute stress and flexible hours",
          experiment: "A/B test with control group in office and test group remote for 3 months",
          observations: [
            "Remote group completed 18% more tasks",
            "Remote group reported 25% higher satisfaction",
            "In-office group had better collaboration scores"
          ],
          analysis: "Statistical significance achieved (p<0.05) for productivity increase",
          conclusion: "Remote work does increase individual productivity but may impact team collaboration"
        }
      }
    ]
  },

  socratic_method: {
    description: "Question-based reasoning",
    examples: [
      {
        prompt: "Is artificial intelligence truly intelligent?",
        parameters: {
          claim: "AI systems demonstrate intelligence through problem-solving",
          premises: [
            "Intelligence requires understanding, not just pattern matching",
            "Current AI systems use statistical patterns without comprehension",
            "Problem-solving can be achieved through brute force computation"
          ],
          stage: "assumptions",
          argumentType: "deductive"
        }
      }
    ]
  },

  structured_argumentation: {
    description: "Build formal arguments",
    examples: [
      {
        prompt: "We should invest in renewable energy",
        parameters: {
          premises: [
            "Climate change poses existential risks",
            "Fossil fuels are finite resources",
            "Renewable technology costs are declining rapidly",
            "Energy independence improves national security"
          ],
          conclusion: "Investing in renewable energy is both economically and environmentally imperative",
          argumentType: "inductive",
          strengths: ["Multiple supporting premises", "Empirical evidence available"],
          weaknesses: ["Initial capital costs high", "Storage technology limitations"]
        }
      }
    ]
  },

  // ============================================================================
  // Collaborative Operations
  // ============================================================================

  collaborative_reasoning: {
    description: "Multi-persona collaborative analysis",
    examples: [
      {
        prompt: "How should we approach the product launch?",
        parameters: {
          personas: [
            { id: "engineer", name: "Alex Engineer", expertise: ["technical", "scalability"] },
            { id: "marketer", name: "Morgan Marketer", expertise: ["branding", "customer_acquisition"] },
            { id: "designer", name: "Dana Designer", expertise: ["user_experience", "visual_design"] }
          ],
          contributions: [
            { personaId: "engineer", content: "We need load testing before launch", type: "concern", confidence: 0.9 },
            { personaId: "marketer", content: "Soft launch with beta users first", type: "suggestion", confidence: 0.8 },
            { personaId: "designer", content: "UI needs accessibility review", type: "observation", confidence: 0.85 }
          ],
          stage: "exploration"
        }
      }
    ]
  },

  // ============================================================================
  // Meta-cognitive Operations
  // ============================================================================

  metacognitive_monitoring: {
    description: "Monitor and assess thinking processes",
    examples: [
      {
        prompt: "Solving a complex algorithmic problem",
        parameters: {
          stage: "monitoring",
          uncertaintyAreas: ["time complexity analysis", "edge case handling"],
          overallConfidence: 0.7,
          recommendedApproach: "Break down into smaller subproblems and test incrementally"
        }
      }
    ]
  },

  // ============================================================================
  // Analysis Operations
  // ============================================================================

  ethical_analysis: {
    description: "Analyze ethical implications",
    examples: [
      {
        prompt: "Implementing facial recognition in public spaces",
        parameters: {
          framework: "rights",
          findings: [
            "Enhances security and crime prevention",
            "Enables finding missing persons quickly"
          ],
          risks: [
            "Privacy violations without consent",
            "Potential for surveillance state",
            "Bias in recognition algorithms"
          ],
          mitigations: [
            "Require explicit consent and opt-out options",
            "Regular algorithm audits for bias",
            "Strict data retention limits",
            "Transparent usage policies"
          ]
        }
      }
    ]
  },

  research: {
    description: "Structure research inquiries",
    examples: [
      {
        prompt: "What are the latest advances in quantum computing?",
        parameters: {
          subqueries: [
            "Recent quantum supremacy achievements",
            "Error correction breakthroughs",
            "Commercial quantum computing applications",
            "Major players and their approaches"
          ]
        }
      }
    ]
  },

  analogical_reasoning: {
    description: "Map concepts between domains",
    examples: [
      {
        prompt: "Compare the brain to a computer",
        parameters: {
          sourceDomain: "computer",
          targetDomain: "brain",
          mappings: [
            { source: "CPU", target: "prefrontal cortex", type: "processing", confidence: 0.7 },
            { source: "RAM", target: "working memory", type: "temporary storage", confidence: 0.8 },
            { source: "hard drive", target: "long-term memory", type: "permanent storage", confidence: 0.6 },
            { source: "network card", target: "nervous system", type: "communication", confidence: 0.7 }
          ],
          inferredInsights: [
            "Both systems process information in parallel and serial modes",
            "Both have hierarchical organization of components",
            "Brain has more plasticity than computer architecture"
          ]
        }
      }
    ]
  },

  visual_reasoning: {
    description: "Work with visual representations",
    examples: [
      {
        prompt: "Create a flowchart for the login process",
        parameters: {
          operation: "create",
          diagramType: "flowchart",
          elements: [
            { id: "start", type: "terminal", properties: { label: "Start", position: { x: 0, y: 0 } } },
            { id: "input", type: "process", properties: { label: "Enter credentials", position: { x: 0, y: 100 } } },
            { id: "validate", type: "decision", properties: { label: "Valid?", position: { x: 0, y: 200 } } },
            { id: "success", type: "terminal", properties: { label: "Login successful", position: { x: 100, y: 300 } } },
            { id: "error", type: "process", properties: { label: "Show error", position: { x: -100, y: 300 } } }
          ]
        }
      }
    ]
  }
};

// Export individual operation examples for easier access
export const getExampleForOperation = (operation: string) => {
  return operationExamples[operation as keyof typeof operationExamples] || null;
};

// Export a function to get all examples as a flat array
export const getAllExamples = () => {
  return Object.entries(operationExamples).map(([operation, data]) => ({
    operation,
    ...data
  }));
};