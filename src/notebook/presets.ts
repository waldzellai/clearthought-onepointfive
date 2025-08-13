/**
 * Notebook Presets for Reasoning Patterns
 * 
 * Pre-configured notebook templates for each reasoning pattern
 * based on research implementations.
 */

export interface NotebookPreset {
  name: string;
  description: string;
  cells: Array<{
    type: 'markdown' | 'code';
    source: string;
    language?: 'javascript';
  }>;
}

export const TREE_OF_THOUGHT_PRESET: NotebookPreset = {
  name: 'Tree of Thought',
  description: 'Systematic exploration of multiple reasoning paths',
  cells: [
    {
      type: 'markdown',
      source: `# Tree of Thought Reasoning

This notebook implements Tree of Thought (ToT) reasoning for systematic exploration of solution paths.

## Problem Statement
Define your problem here...`
    },
    {
      type: 'code',
      source: `// Tree of Thought Implementation
class TreeNode {
  constructor(state, thought, value = null) {
    this.state = state;
    this.thought = thought;
    this.value = value;
    this.children = [];
    this.parent = null;
  }
  
  addChild(childNode) {
    childNode.parent = this;
    this.children.push(childNode);
    return childNode;
  }
  
  evaluate() {
    // Placeholder for evaluation logic
    return Math.random();
  }
}

class TreeOfThought {
  constructor(rootPrompt, maxDepth = 3, branchFactor = 3) {
    this.root = new TreeNode('', rootPrompt);
    this.maxDepth = maxDepth;
    this.branchFactor = branchFactor;
    this.bestPath = [];
  }
  
  explore(node, depth = 0) {
    if (depth >= this.maxDepth) {
      return node.evaluate();
    }
    
    // Generate child thoughts
    for (let i = 0; i < this.branchFactor; i++) {
      const childThought = \`Branch \${i + 1} from: \${node.thought.substring(0, 20)}...\`;
      const childNode = node.addChild(new TreeNode(
        node.state + '\\n' + childThought,
        childThought
      ));
      
      // Recursively explore
      childNode.value = this.explore(childNode, depth + 1);
    }
    
    // Select best child
    if (node.children.length > 0) {
      const bestChild = node.children.reduce((best, child) => 
        child.value > best.value ? child : best
      );
      node.value = bestChild.value;
    }
    
    return node.value;
  }
  
  solve() {
    this.explore(this.root);
    return this.extractBestPath(this.root);
  }
  
  extractBestPath(node) {
    const path = [node.thought];
    
    while (node.children.length > 0) {
      node = node.children.reduce((best, child) => 
        child.value > best.value ? child : best
      );
      path.push(node.thought);
    }
    
    return path;
  }
}

// Example usage
const problem = "How to optimize database queries?";
const tot = new TreeOfThought(problem, 3, 2);
const solution = tot.solve();
console.log("Best solution path:", solution);`,
      language: 'javascript'
    },
    {
      type: 'markdown',
      source: `## Visualization

\`\`\`mermaid
graph TD
    A[Root: Problem] --> B[Branch 1]
    A --> C[Branch 2]
    B --> D[Sub-branch 1.1]
    B --> E[Sub-branch 1.2]
    C --> F[Sub-branch 2.1]
    C --> G[Sub-branch 2.2]
    style B fill:#90EE90
    style D fill:#90EE90
\`\`\`

Green nodes indicate the selected path.`
    }
  ]
};

export const BEAM_SEARCH_PRESET: NotebookPreset = {
  name: 'Beam Search',
  description: 'Parallel exploration with periodic pruning',
  cells: [
    {
      type: 'markdown',
      source: `# Beam Search Reasoning

Maintains multiple promising paths simultaneously, exploring them in parallel with periodic pruning.`
    },
    {
      type: 'code',
      source: `// Beam Search Implementation
class BeamSearchPath {
  constructor(thoughts = [], score = 0) {
    this.thoughts = thoughts;
    this.score = score;
    this.status = 'active';
  }
  
  expand(newThought, scoreIncrement) {
    return new BeamSearchPath(
      [...this.thoughts, newThought],
      this.score + scoreIncrement
    );
  }
}

class BeamSearch {
  constructor(problem, beamWidth = 3, maxIterations = 5) {
    this.problem = problem;
    this.beamWidth = beamWidth;
    this.maxIterations = maxIterations;
    this.beam = [new BeamSearchPath([problem], 0)];
  }
  
  generateCandidates(path) {
    // Generate next steps from current path
    const candidates = [];
    for (let i = 0; i < 3; i++) {
      const thought = \`Step \${path.thoughts.length}: Option \${i + 1}\`;
      const score = Math.random(); // Placeholder scoring
      candidates.push(path.expand(thought, score));
    }
    return candidates;
  }
  
  iterate() {
    const allCandidates = [];
    
    // Generate candidates for each path in beam
    for (const path of this.beam) {
      const candidates = this.generateCandidates(path);
      allCandidates.push(...candidates);
    }
    
    // Sort by score and keep top beamWidth
    allCandidates.sort((a, b) => b.score - a.score);
    this.beam = allCandidates.slice(0, this.beamWidth);
    
    // Log current beam
    console.log(\`Beam after iteration:\`);
    this.beam.forEach((path, i) => {
      console.log(\`  Path \${i + 1} (score: \${path.score.toFixed(2)}):\`,
        path.thoughts[path.thoughts.length - 1]);
    });
  }
  
  search() {
    for (let i = 0; i < this.maxIterations; i++) {
      console.log(\`\\nIteration \${i + 1}:\`);
      this.iterate();
    }
    
    return this.beam[0]; // Return best path
  }
}

// Example usage
const beamSearch = new BeamSearch(
  "Design a distributed cache system",
  3, // beam width
  4  // iterations
);

const bestPath = beamSearch.search();
console.log("\\nBest path found:", bestPath.thoughts);`,
      language: 'javascript'
    }
  ]
};

export const MCTS_PRESET: NotebookPreset = {
  name: 'Monte Carlo Tree Search',
  description: 'Balances exploration and exploitation through simulations',
  cells: [
    {
      type: 'markdown',
      source: `# Monte Carlo Tree Search (MCTS)

MCTS combines tree search with random sampling for decision-making under uncertainty.

## Four Phases:
1. **Selection**: Navigate to promising leaf using UCB
2. **Expansion**: Add new child node
3. **Simulation**: Random rollout to terminal state
4. **Backpropagation**: Update values up the tree`
    },
    {
      type: 'code',
      source: `// MCTS Implementation for Reasoning
class MCTSNode {
  constructor(state, parent = null) {
    this.state = state;
    this.parent = parent;
    this.children = [];
    this.visits = 0;
    this.value = 0;
    this.untried_actions = this.getPossibleActions();
  }
  
  getPossibleActions() {
    // Return possible next thoughts/actions
    return ['Action A', 'Action B', 'Action C'];
  }
  
  ucb1(c = 1.414) {
    if (this.visits === 0) return Infinity;
    
    const exploitation = this.value / this.visits;
    const exploration = c * Math.sqrt(Math.log(this.parent.visits) / this.visits);
    return exploitation + exploration;
  }
  
  selectChild() {
    return this.children.reduce((best, child) => 
      child.ucb1() > best.ucb1() ? child : best
    );
  }
  
  expand() {
    const action = this.untried_actions.pop();
    const childState = this.state + ' -> ' + action;
    const child = new MCTSNode(childState, this);
    this.children.push(child);
    return child;
  }
  
  simulate() {
    // Random rollout from this node
    let score = Math.random(); // Placeholder evaluation
    
    // Simulate random decisions
    for (let depth = 0; depth < 3; depth++) {
      score *= Math.random();
    }
    
    return score;
  }
  
  backpropagate(value) {
    this.visits++;
    this.value += value;
    
    if (this.parent) {
      this.parent.backpropagate(value);
    }
  }
}

class MCTS {
  constructor(rootState, simulations = 100) {
    this.root = new MCTSNode(rootState);
    this.simulations = simulations;
  }
  
  runSimulation() {
    let node = this.root;
    
    // Selection
    while (node.children.length > 0 && node.untried_actions.length === 0) {
      node = node.selectChild();
    }
    
    // Expansion
    if (node.untried_actions.length > 0) {
      node = node.expand();
    }
    
    // Simulation
    const value = node.simulate();
    
    // Backpropagation
    node.backpropagate(value);
  }
  
  search() {
    for (let i = 0; i < this.simulations; i++) {
      this.runSimulation();
      
      if ((i + 1) % 20 === 0) {
        console.log(\`Completed \${i + 1} simulations\`);
      }
    }
    
    // Select best action from root
    const bestChild = this.root.children.reduce((best, child) => 
      child.visits > best.visits ? child : best
    );
    
    return bestChild.state;
  }
}

// Example usage
const mcts = new MCTS("Optimize resource allocation", 50);
const bestAction = mcts.search();
console.log("Best action:", bestAction);

// Display statistics
console.log("\\nRoot children statistics:");
mcts.root.children.forEach(child => {
  console.log(\`  "\${child.state}": visits=\${child.visits}, avg_value=\${(child.value/child.visits).toFixed(3)}\`);
});`,
      language: 'javascript'
    }
  ]
};

export const GRAPH_OF_THOUGHT_PRESET: NotebookPreset = {
  name: 'Graph of Thought',
  description: 'Non-hierarchical connections between thoughts',
  cells: [
    {
      type: 'markdown',
      source: `# Graph of Thought Reasoning

Graph of Thought allows arbitrary connections between reasoning nodes, enabling complex relationships and feedback loops.`
    },
    {
      type: 'code',
      source: `// Graph of Thought Implementation
class GraphNode {
  constructor(id, content, nodeType = 'thought') {
    this.id = id;
    this.content = content;
    this.nodeType = nodeType; // thought, evidence, conclusion
    this.edges = new Map(); // id -> edge
    this.strength = 1.0;
  }
}

class GraphEdge {
  constructor(source, target, edgeType = 'relates', weight = 1.0) {
    this.source = source;
    this.target = target;
    this.edgeType = edgeType; // relates, supports, contradicts, leads-to
    this.weight = weight;
  }
}

class GraphOfThought {
  constructor(problem) {
    this.nodes = new Map();
    this.edges = [];
    this.nodeIdCounter = 0;
    
    // Add root node
    this.addNode(problem, 'thought');
  }
  
  addNode(content, nodeType = 'thought') {
    const id = \`node_\${this.nodeIdCounter++}\`;
    const node = new GraphNode(id, content, nodeType);
    this.nodes.set(id, node);
    return id;
  }
  
  addEdge(sourceId, targetId, edgeType = 'relates', weight = 1.0) {
    const edge = new GraphEdge(sourceId, targetId, edgeType, weight);
    this.edges.push(edge);
    
    const sourceNode = this.nodes.get(sourceId);
    if (sourceNode) {
      sourceNode.edges.set(targetId, edge);
    }
    
    return edge;
  }
  
  findPaths(startId, endId, maxDepth = 5) {
    const paths = [];
    const visited = new Set();
    
    const dfs = (nodeId, currentPath, depth) => {
      if (depth > maxDepth) return;
      if (nodeId === endId) {
        paths.push([...currentPath]);
        return;
      }
      
      visited.add(nodeId);
      const node = this.nodes.get(nodeId);
      
      if (node) {
        for (const [targetId, edge] of node.edges) {
          if (!visited.has(targetId)) {
            currentPath.push(edge);
            dfs(targetId, currentPath, depth + 1);
            currentPath.pop();
          }
        }
      }
      
      visited.delete(nodeId);
    };
    
    dfs(startId, [], 0);
    return paths;
  }
  
  analyze() {
    // Calculate node centrality
    const centrality = new Map();
    
    for (const [id, node] of this.nodes) {
      const incomingEdges = this.edges.filter(e => e.target === id).length;
      const outgoingEdges = node.edges.size;
      centrality.set(id, incomingEdges + outgoingEdges);
    }
    
    // Find most central nodes
    const sortedNodes = Array.from(centrality.entries())
      .sort((a, b) => b[1] - a[1]);
    
    return {
      centralNodes: sortedNodes.slice(0, 3),
      totalNodes: this.nodes.size,
      totalEdges: this.edges.length
    };
  }
}

// Example usage
const got = new GraphOfThought("Climate change impacts");

// Add nodes
const agricultureId = got.addNode("Impact on agriculture", "evidence");
const economyId = got.addNode("Economic consequences", "thought");
const policyId = got.addNode("Policy interventions needed", "conclusion");
const tempId = got.addNode("Rising temperatures", "evidence");

// Add edges
got.addEdge("node_0", agricultureId, "leads-to", 0.9);
got.addEdge("node_0", economyId, "leads-to", 0.8);
got.addEdge(agricultureId, economyId, "supports", 0.7);
got.addEdge(economyId, policyId, "leads-to", 0.9);
got.addEdge(tempId, agricultureId, "supports", 0.95);
got.addEdge("node_0", tempId, "relates", 1.0);

// Analyze graph
const analysis = got.analyze();
console.log("Graph Analysis:", analysis);

// Find paths
const paths = got.findPaths("node_0", policyId);
console.log(\`\\nFound \${paths.length} paths from root to policy node\`);`,
      language: 'javascript'
    },
    {
      type: 'markdown',
      source: `## Graph Visualization

\`\`\`mermaid
graph LR
    A[Climate Change] --> B[Rising Temperatures]
    A --> C[Agriculture Impact]
    A --> D[Economic Impact]
    B --> C
    C --> D
    D --> E[Policy Needed]
    
    style A fill:#FFE4B5
    style E fill:#90EE90
\`\`\``
    }
  ]
};

export const ORCHESTRATION_SUGGEST_PRESET: NotebookPreset = {
  name: 'Orchestration Suggest',
  description: 'Multi-agent coordination for complex tasks',
  cells: [
    {
      type: 'markdown',
      source: `# Orchestration Suggestion

This notebook demonstrates how to decompose complex tasks and suggest tool combinations for efficient problem-solving.`
    },
    {
      type: 'code',
      source: `// Task Orchestration Framework
class TaskOrchestrator {
  constructor(mainTask) {
    this.mainTask = mainTask;
    this.subtasks = [];
    this.toolSuggestions = new Map();
    this.dependencies = new Map();
  }
  
  decomposeTask() {
    // Analyze task and break into subtasks
    const keywords = this.extractKeywords(this.mainTask);
    
    if (keywords.includes('analyze')) {
      this.subtasks.push({
        id: 'analyze',
        description: 'Analyze current state',
        priority: 'high'
      });
    }
    
    if (keywords.includes('optimize')) {
      this.subtasks.push({
        id: 'optimize',
        description: 'Optimize solution',
        priority: 'medium'
      });
    }
    
    if (keywords.includes('implement')) {
      this.subtasks.push({
        id: 'implement',
        description: 'Implement solution',
        priority: 'high'
      });
    }
    
    if (keywords.includes('test')) {
      this.subtasks.push({
        id: 'test',
        description: 'Test and validate',
        priority: 'high'
      });
    }
    
    return this.subtasks;
  }
  
  extractKeywords(text) {
    const keywords = [];
    const patterns = ['analyze', 'optimize', 'implement', 'test', 'design', 'build'];
    
    for (const pattern of patterns) {
      if (text.toLowerCase().includes(pattern)) {
        keywords.push(pattern);
      }
    }
    
    return keywords;
  }
  
  suggestTools() {
    const toolMap = {
      'analyze': ['tree_of_thought', 'graph_of_thought'],
      'optimize': ['beam_search', 'mcts'],
      'implement': ['sequential_thinking', 'code_execution'],
      'test': ['debugging_approach', 'statistical_reasoning']
    };
    
    for (const subtask of this.subtasks) {
      const tools = toolMap[subtask.id] || ['sequential_thinking'];
      this.toolSuggestions.set(subtask.id, tools);
    }
    
    return this.toolSuggestions;
  }
  
  createDependencies() {
    // Define dependencies between subtasks
    const depGraph = {
      'implement': ['analyze'],
      'test': ['implement'],
      'optimize': ['test']
    };
    
    for (const [task, deps] of Object.entries(depGraph)) {
      if (this.subtasks.find(s => s.id === task)) {
        this.dependencies.set(task, deps.filter(d => 
          this.subtasks.find(s => s.id === d)
        ));
      }
    }
    
    return this.dependencies;
  }
  
  generatePlan() {
    this.decomposeTask();
    this.suggestTools();
    this.createDependencies();
    
    // Topological sort for execution order
    const executed = new Set();
    const plan = [];
    
    const canExecute = (taskId) => {
      const deps = this.dependencies.get(taskId) || [];
      return deps.every(d => executed.has(d));
    };
    
    while (plan.length < this.subtasks.length) {
      for (const subtask of this.subtasks) {
        if (!executed.has(subtask.id) && canExecute(subtask.id)) {
          plan.push({
            ...subtask,
            tools: this.toolSuggestions.get(subtask.id)
          });
          executed.add(subtask.id);
        }
      }
    }
    
    return plan;
  }
}

// Example usage
const orchestrator = new TaskOrchestrator(
  "Analyze and optimize the database schema, then implement and test the changes"
);

const plan = orchestrator.generatePlan();

console.log("Execution Plan:");
console.log("==============");
plan.forEach((step, index) => {
  console.log(\`\\nStep \${index + 1}: \${step.description}\`);
  console.log(\`  Priority: \${step.priority}\`);
  console.log(\`  Suggested tools: \${step.tools.join(', ')}\`);
  
  const deps = orchestrator.dependencies.get(step.id) || [];
  if (deps.length > 0) {
    console.log(\`  Dependencies: \${deps.join(', ')}\`);
  }
});`,
      language: 'javascript'
    }
  ]
};

// Export all presets
export const NOTEBOOK_PRESETS: Record<string, NotebookPreset> = {
  tree_of_thought: TREE_OF_THOUGHT_PRESET,
  beam_search: BEAM_SEARCH_PRESET,
  mcts: MCTS_PRESET,
  graph_of_thought: GRAPH_OF_THOUGHT_PRESET,
  orchestration_suggest: ORCHESTRATION_SUGGEST_PRESET
};

export function getPresetForPattern(pattern: string): NotebookPreset | undefined {
  return NOTEBOOK_PRESETS[pattern];
}