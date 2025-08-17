# Causal Analysis Examples

## Project Delays Analysis

### Causal Graph with Intervention

```json
{
  "prompt": "Analyze causes of project delays",
  "parameters": {
    "graph": {
      "nodes": [
        "scope_creep",
        "resource_shortage",
        "poor_planning",
        "delays",
        "budget_overrun",
        "team_morale",
        "quality_issues"
      ],
      "edges": [
        {
          "from": "scope_creep",
          "to": "delays",
          "weight": 0.8
        },
        {
          "from": "resource_shortage",
          "to": "delays",
          "weight": 0.7
        },
        {
          "from": "poor_planning",
          "to": "scope_creep",
          "weight": 0.6
        },
        {
          "from": "poor_planning",
          "to": "resource_shortage",
          "weight": 0.5
        },
        {
          "from": "delays",
          "to": "budget_overrun",
          "weight": 0.9
        },
        {
          "from": "delays",
          "to": "team_morale",
          "weight": -0.6
        },
        {
          "from": "team_morale",
          "to": "quality_issues",
          "weight": -0.7
        }
      ]
    },
    "intervention": {
      "variable": "poor_planning",
      "change": -0.5
    }
  }
}
```

## Economic System Analysis

### Supply and Demand Dynamics

```json
{
  "prompt": "Analyze economic factors affecting product pricing",
  "parameters": {
    "graph": {
      "nodes": [
        "supply",
        "demand",
        "price",
        "competition",
        "production_cost",
        "consumer_income",
        "market_share"
      ],
      "edges": [
        {
          "from": "supply",
          "to": "price",
          "weight": -0.8
        },
        {
          "from": "demand",
          "to": "price",
          "weight": 0.9
        },
        {
          "from": "price",
          "to": "demand",
          "weight": -0.6
        },
        {
          "from": "competition",
          "to": "price",
          "weight": -0.5
        },
        {
          "from": "production_cost",
          "to": "supply",
          "weight": -0.7
        },
        {
          "from": "consumer_income",
          "to": "demand",
          "weight": 0.8
        },
        {
          "from": "price",
          "to": "market_share",
          "weight": -0.4
        }
      ]
    },
    "intervention": {
      "variable": "production_cost",
      "change": -0.3
    }
  }
}
```

## Climate Impact Analysis

### Environmental Cause-Effect Chain

```json
{
  "prompt": "Analyze climate change causal relationships",
  "parameters": {
    "graph": {
      "nodes": [
        "greenhouse_gases",
        "temperature",
        "ice_melt",
        "sea_level",
        "extreme_weather",
        "agriculture",
        "migration"
      ],
      "edges": [
        {
          "from": "greenhouse_gases",
          "to": "temperature",
          "weight": 0.9
        },
        {
          "from": "temperature",
          "to": "ice_melt",
          "weight": 0.8
        },
        {
          "from": "ice_melt",
          "to": "sea_level",
          "weight": 0.9
        },
        {
          "from": "temperature",
          "to": "extreme_weather",
          "weight": 0.7
        },
        {
          "from": "extreme_weather",
          "to": "agriculture",
          "weight": -0.8
        },
        {
          "from": "sea_level",
          "to": "migration",
          "weight": 0.6
        },
        {
          "from": "agriculture",
          "to": "migration",
          "weight": 0.5
        }
      ]
    },
    "intervention": {
      "variable": "greenhouse_gases",
      "change": -0.2
    }
  }
}
```