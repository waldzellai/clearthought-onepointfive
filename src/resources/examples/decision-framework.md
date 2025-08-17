# Decision Framework Examples

## Multi-Criteria Decision Analysis

### Cloud Provider Selection

```json
{
  "prompt": "Choose the best cloud provider for our startup",
  "parameters": {
    "options": [
      {
        "id": "aws",
        "name": "Amazon Web Services",
        "attributes": {
          "cost": 7,
          "features": 10,
          "support": 8,
          "ease": 6
        }
      },
      {
        "id": "gcp",
        "name": "Google Cloud Platform",
        "attributes": {
          "cost": 8,
          "features": 9,
          "support": 7,
          "ease": 8
        }
      },
      {
        "id": "azure",
        "name": "Microsoft Azure",
        "attributes": {
          "cost": 7,
          "features": 9,
          "support": 9,
          "ease": 7
        }
      }
    ],
    "criteria": [
      {
        "name": "cost",
        "weight": 0.3,
        "type": "maximize"
      },
      {
        "name": "features",
        "weight": 0.3,
        "type": "maximize"
      },
      {
        "name": "support",
        "weight": 0.2,
        "type": "maximize"
      },
      {
        "name": "ease",
        "weight": 0.2,
        "type": "maximize"
      }
    ],
    "analysisType": "multi-criteria"
  }
}
```

## Expected Utility Analysis

### Investment Portfolio Decision

```json
{
  "prompt": "Evaluate investment options",
  "parameters": {
    "options": [
      {
        "id": "stocks",
        "name": "Stock Portfolio"
      },
      {
        "id": "bonds",
        "name": "Bond Portfolio"
      },
      {
        "id": "real_estate",
        "name": "Real Estate"
      }
    ],
    "possibleOutcomes": [
      {
        "option": "stocks",
        "probability": 0.6,
        "value": 15000
      },
      {
        "option": "stocks",
        "probability": 0.4,
        "value": -5000
      },
      {
        "option": "bonds",
        "probability": 0.8,
        "value": 5000
      },
      {
        "option": "bonds",
        "probability": 0.2,
        "value": 1000
      },
      {
        "option": "real_estate",
        "probability": 0.7,
        "value": 8000
      },
      {
        "option": "real_estate",
        "probability": 0.3,
        "value": 2000
      }
    ],
    "analysisType": "expected-utility"
  }
}
```

## Hiring Decision

### Technical Role Evaluation

```json
{
  "prompt": "Select the best candidate for senior developer position",
  "parameters": {
    "options": [
      {
        "id": "candidate_a",
        "name": "Alice",
        "attributes": {
          "technical_skills": 9,
          "experience": 7,
          "cultural_fit": 8,
          "communication": 7,
          "leadership": 6
        }
      },
      {
        "id": "candidate_b",
        "name": "Bob",
        "attributes": {
          "technical_skills": 8,
          "experience": 9,
          "cultural_fit": 7,
          "communication": 8,
          "leadership": 8
        }
      },
      {
        "id": "candidate_c",
        "name": "Carol",
        "attributes": {
          "technical_skills": 7,
          "experience": 6,
          "cultural_fit": 9,
          "communication": 9,
          "leadership": 7
        }
      }
    ],
    "criteria": [
      {
        "name": "technical_skills",
        "weight": 0.25,
        "type": "maximize"
      },
      {
        "name": "experience",
        "weight": 0.20,
        "type": "maximize"
      },
      {
        "name": "cultural_fit",
        "weight": 0.20,
        "type": "maximize"
      },
      {
        "name": "communication",
        "weight": 0.20,
        "type": "maximize"
      },
      {
        "name": "leadership",
        "weight": 0.15,
        "type": "maximize"
      }
    ],
    "analysisType": "multi-criteria"
  }
}
```