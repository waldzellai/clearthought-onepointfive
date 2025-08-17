# Optimization Examples

## Resource Allocation

### Engineering Team Optimization

```json
{
  "prompt": "Optimize team resource allocation across projects",
  "parameters": {
    "variables": {
      "frontend_hours": { "min": 0, "max": 160, "step": 20 },
      "backend_hours": { "min": 0, "max": 160, "step": 20 },
      "testing_hours": { "min": 0, "max": 80, "step": 10 },
      "documentation_hours": { "min": 0, "max": 40, "step": 10 }
    },
    "objective": "(frontend_hours * 1.2) + (backend_hours * 1.5) + (testing_hours * 0.8) + (documentation_hours * 0.5)",
    "constraints": "frontend_hours + backend_hours + testing_hours + documentation_hours <= 300",
    "method": "grid",
    "iterations": 100
  }
}
```

## Portfolio Optimization

### Investment Mix

```json
{
  "prompt": "Optimize investment portfolio allocation",
  "parameters": {
    "variables": {
      "stocks": { "min": 0, "max": 100, "step": 5 },
      "bonds": { "min": 0, "max": 100, "step": 5 },
      "real_estate": { "min": 0, "max": 100, "step": 5 },
      "cash": { "min": 0, "max": 100, "step": 5 }
    },
    "objective": "(stocks * 0.12) + (bonds * 0.04) + (real_estate * 0.08) + (cash * 0.01)",
    "constraints": "stocks + bonds + real_estate + cash = 100",
    "method": "hill",
    "iterations": 200
  }
}
```

## Production Optimization

### Manufacturing Output

```json
{
  "prompt": "Maximize production output with constraints",
  "parameters": {
    "variables": {
      "product_a": { "min": 0, "max": 1000, "step": 50 },
      "product_b": { "min": 0, "max": 800, "step": 50 },
      "product_c": { "min": 0, "max": 600, "step": 50 }
    },
    "objective": "(product_a * 15) + (product_b * 20) + (product_c * 25)",
    "constraints": "(product_a * 2) + (product_b * 3) + (product_c * 4) <= 5000",
    "method": "grid",
    "iterations": 150
  }
}
```