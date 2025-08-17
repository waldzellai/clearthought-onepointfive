# Systems Thinking Examples

## Healthcare System Analysis

### Example Parameters Structure

```json
{
  "prompt": "Analyze the healthcare system",
  "parameters": {
    "components": [
      "patients",
      "doctors", 
      "hospitals",
      "insurance",
      "pharmaceuticals",
      "government"
    ],
    "relationships": [
      {
        "from": "patients",
        "to": "doctors",
        "type": "dependency",
        "strength": 0.9
      },
      {
        "from": "doctors",
        "to": "hospitals",
        "type": "affiliation",
        "strength": 0.7
      },
      {
        "from": "insurance",
        "to": "patients",
        "type": "coverage",
        "strength": 0.8
      },
      {
        "from": "government",
        "to": "insurance",
        "type": "regulation",
        "strength": 0.6
      }
    ],
    "feedbackLoops": [
      {
        "components": ["patients", "insurance", "costs"],
        "type": "negative",
        "description": "Higher costs reduce patient access, reducing insurance claims"
      }
    ],
    "emergentProperties": [
      "healthcare accessibility",
      "system efficiency",
      "cost inflation"
    ],
    "leveragePoints": [
      "insurance reform",
      "preventive care programs"
    ]
  }
}
```

## Software Development System

### Example Parameters Structure

```json
{
  "prompt": "Analyze the software development lifecycle",
  "parameters": {
    "components": [
      "requirements",
      "design",
      "development",
      "testing",
      "deployment",
      "maintenance",
      "users",
      "stakeholders"
    ],
    "relationships": [
      {
        "from": "requirements",
        "to": "design",
        "type": "input",
        "strength": 1.0
      },
      {
        "from": "design",
        "to": "development",
        "type": "specification",
        "strength": 0.9
      },
      {
        "from": "development",
        "to": "testing",
        "type": "validation",
        "strength": 0.8
      },
      {
        "from": "users",
        "to": "requirements",
        "type": "feedback",
        "strength": 0.7
      }
    ],
    "feedbackLoops": [
      {
        "components": ["testing", "development", "design"],
        "type": "positive",
        "description": "Bugs found in testing drive development fixes and design improvements"
      }
    ],
    "emergentProperties": [
      "technical debt",
      "system reliability",
      "user satisfaction"
    ],
    "leveragePoints": [
      "automated testing",
      "continuous integration",
      "user feedback loops"
    ]
  }
}
```