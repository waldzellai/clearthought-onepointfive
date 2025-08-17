# Simulation Examples

## Population Growth Model

### Basic Exponential Growth

```json
{
  "prompt": "Simulate population growth over time",
  "parameters": {
    "initial": {
      "population": 1000,
      "growth_rate": 0.02,
      "carrying_capacity": 10000
    },
    "updateRules": [
      {
        "target": "population",
        "rule": "population * (1 + growth_rate * (1 - population / carrying_capacity))"
      },
      {
        "target": "growth_rate",
        "rule": "growth_rate * 0.99"
      }
    ],
    "steps": 50
  }
}
```

## Economic Model

### Supply and Demand Dynamics

```json
{
  "prompt": "Simulate market equilibrium",
  "parameters": {
    "initial": {
      "price": 100,
      "supply": 500,
      "demand": 600,
      "elasticity": 0.8
    },
    "updateRules": [
      {
        "target": "price",
        "rule": "price + 0.1 * (demand - supply)"
      },
      {
        "target": "demand",
        "rule": "600 - elasticity * price"
      },
      {
        "target": "supply",
        "rule": "400 + 0.5 * price"
      }
    ],
    "steps": 30
  }
}
```

## Disease Spread Model

### SIR Epidemic Model

```json
{
  "prompt": "Simulate disease spread in population",
  "parameters": {
    "initial": {
      "susceptible": 9900,
      "infected": 100,
      "recovered": 0,
      "transmission_rate": 0.3,
      "recovery_rate": 0.1
    },
    "updateRules": [
      {
        "target": "susceptible",
        "rule": "susceptible - (transmission_rate * susceptible * infected / 10000)"
      },
      {
        "target": "infected",
        "rule": "infected + (transmission_rate * susceptible * infected / 10000) - (recovery_rate * infected)"
      },
      {
        "target": "recovered",
        "rule": "recovered + (recovery_rate * infected)"
      }
    ],
    "steps": 100
  }
}
```