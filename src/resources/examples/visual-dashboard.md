# Visual Dashboard Examples

## Interactive Metrics Dashboard

### Example Parameters Structure

```json
{
  "prompt": "Create a project metrics dashboard",
  "parameters": {
    "visualizationType": "chart",
    "uiType": "rawHtml",
    "layout": "grid",
    "interactive": true,
    "data": {
      "chartType": "line",
      "chartData": {
        "labels": ["Week 1", "Week 2", "Week 3", "Week 4"],
        "datasets": [
          {
            "label": "Tasks Completed",
            "data": [12, 19, 15, 25],
            "borderColor": "rgb(75, 192, 192)",
            "tension": 0.1
          },
          {
            "label": "Bugs Fixed",
            "data": [8, 12, 10, 18],
            "borderColor": "rgb(255, 99, 132)",
            "tension": 0.1
          }
        ]
      }
    },
    "panels": [
      {
        "title": "Sprint Velocity",
        "type": "metric",
        "value": "23.5",
        "content": "<p>Average story points per sprint</p>"
      },
      {
        "title": "Team Productivity",
        "type": "metric", 
        "value": "87%",
        "content": "<p>Current team efficiency rating</p>"
      },
      {
        "title": "Code Coverage",
        "type": "metric",
        "value": "92.3%",
        "content": "<p>Test coverage across all modules</p>"
      }
    ],
    "refreshRate": 30000
  }
}
```

## Remote DOM Interactive Dashboard

### Example with Dynamic Components

```json
{
  "prompt": "Create an interactive team performance dashboard",
  "parameters": {
    "visualizationType": "custom",
    "uiType": "remoteDom",
    "interactive": true,
    "panels": [
      {
        "title": "Team Members",
        "type": "list",
        "items": ["Alice - Frontend", "Bob - Backend", "Charlie - DevOps"]
      },
      {
        "title": "Active Sprints",
        "type": "progress",
        "value": "3/5",
        "progress": 60
      },
      {
        "title": "Deployment Status",
        "type": "status",
        "value": "Healthy",
        "color": "green"
      }
    ]
  }
}
```

## External URL Dashboard

### Example with External Service Integration

```json
{
  "prompt": "Display Grafana monitoring dashboard",
  "parameters": {
    "visualizationType": "metrics",
    "uiType": "externalUrl",
    "externalUrl": "https://grafana.example.com/dashboard/system-metrics",
    "refreshRate": 60000,
    "interactive": false
  }
}
```

## Multi-Panel Analytics Dashboard

### Complex Dashboard with Multiple Visualization Types

```json
{
  "prompt": "Create comprehensive analytics dashboard",
  "parameters": {
    "visualizationType": "chart",
    "uiType": "rawHtml",
    "layout": "grid",
    "interactive": true,
    "data": {
      "chartType": "bar",
      "chartData": {
        "labels": ["Q1", "Q2", "Q3", "Q4"],
        "datasets": [
          {
            "label": "Revenue",
            "data": [150000, 180000, 210000, 250000],
            "backgroundColor": "rgba(54, 162, 235, 0.5)"
          },
          {
            "label": "Expenses", 
            "data": [120000, 140000, 155000, 170000],
            "backgroundColor": "rgba(255, 99, 132, 0.5)"
          }
        ]
      }
    },
    "panels": [
      {
        "title": "Total Revenue",
        "type": "metric",
        "value": "$790,000",
        "trend": "up",
        "change": "+15%"
      },
      {
        "title": "Profit Margin",
        "type": "metric",
        "value": "28.3%",
        "trend": "up",
        "change": "+3.2%"
      },
      {
        "title": "Customer Count",
        "type": "metric",
        "value": "1,245",
        "trend": "up", 
        "change": "+127"
      },
      {
        "title": "Churn Rate",
        "type": "metric",
        "value": "2.8%",
        "trend": "down",
        "change": "-0.5%"
      }
    ]
  }
}
```

## Key Features

### Visualization Types
- **chart**: Line, bar, pie, scatter charts using Chart.js
- **graph**: Network graphs and flow diagrams
- **metrics**: KPI cards and metric displays
- **custom**: Custom HTML or remote DOM components

### UI Types
- **rawHtml**: Inline HTML with embedded visualizations
- **externalUrl**: iframe pointing to external dashboard service
- **remoteDom**: Dynamic JavaScript-generated components

### Interactivity
- Click handlers on panels
- Real-time updates via refreshRate
- postMessage communication with parent frame
- Tool invocation from UI interactions

### Layout Options
- **grid**: Responsive grid layout
- **flex**: Flexible box layout
- **tabs**: Tabbed interface
- **stack**: Vertical stacking