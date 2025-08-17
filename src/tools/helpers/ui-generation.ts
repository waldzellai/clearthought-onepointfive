/**
 * UI Generation Helper Functions
 * 
 * Utilities for generating dashboard HTML and remote DOM scripts
 */

/**
 * Generate dashboard HTML content
 */
export function generateDashboardHTML(options: {
  title: string;
  visualizationType: string;
  data: any;
  panels: any[];
  layout: string;
  interactive: boolean;
}): string {
  const { title, visualizationType, data, panels, layout, interactive } = options;
  
  // Generate HTML with embedded Chart.js or D3.js visualization
  const chartScript = visualizationType === "chart" ? `
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script>
      const ctx = document.getElementById('mainChart').getContext('2d');
      const chart = new Chart(ctx, {
        type: '${data.chartType || "bar"}',
        data: ${JSON.stringify(data.chartData || {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
          datasets: [{
            label: 'Dataset',
            data: [12, 19, 3, 5, 2],
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
          }]
        })},
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: true },
            tooltip: { enabled: ${interactive} }
          }
        }
      });
    </script>
  ` : "";
  
  const panelsHTML = panels.map((panel, index) => `
    <div class="panel" style="
      padding: 15px;
      margin: 10px;
      border: 1px solid #ddd;
      border-radius: 8px;
      background: white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    ">
      <h3>${panel.title || `Panel ${index + 1}`}</h3>
      <div class="panel-content">
        ${panel.content || `<p>Panel content for ${panel.type || 'metric'}</p>`}
        ${panel.value ? `<div class="metric-value" style="font-size: 2em; font-weight: bold; color: #2196F3;">${panel.value}</div>` : ''}
      </div>
    </div>
  `).join('');
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${title}</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          margin: 0;
          padding: 20px;
          background: #f5f5f5;
        }
        .dashboard {
          max-width: 1200px;
          margin: 0 auto;
        }
        .header {
          background: white;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 20px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .panels-container {
          display: ${layout === 'grid' ? 'grid' : 'flex'};
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
          flex-wrap: ${layout === 'flex' ? 'wrap' : 'nowrap'};
        }
        .chart-container {
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          height: 400px;
          margin-bottom: 20px;
        }
        canvas {
          width: 100% !important;
          height: 100% !important;
        }
      </style>
    </head>
    <body>
      <div class="dashboard">
        <div class="header">
          <h1>${title}</h1>
          <p>Interactive Dashboard - ${new Date().toLocaleString()}</p>
        </div>
        ${visualizationType === 'chart' ? `
          <div class="chart-container">
            <canvas id="mainChart"></canvas>
          </div>
        ` : ''}
        <div class="panels-container">
          ${panelsHTML}
        </div>
      </div>
      ${chartScript}
      ${interactive ? `
        <script>
          // Enable interactive features
          window.parent.postMessage({
            type: 'ui-lifecycle-iframe-ready',
            payload: { ready: true }
          }, '*');
          
          // Handle clicks on panels
          document.querySelectorAll('.panel').forEach((panel, index) => {
            panel.style.cursor = 'pointer';
            panel.addEventListener('click', () => {
              window.parent.postMessage({
                type: 'notify',
                payload: { 
                  message: 'Panel ' + (index + 1) + ' clicked'
                }
              }, '*');
            });
          });
        </script>
      ` : ''}
    </body>
    </html>
  `;
}

/**
 * Generate remote DOM script for dynamic content
 */
export function generateRemoteDomScript(options: {
  visualizationType: string;
  data: any;
  panels: any[];
  interactive: boolean;
}): string {
  const { visualizationType, data, panels, interactive } = options;
  
  return `
    // Create dashboard container
    const container = document.createElement('ui-container');
    container.style.padding = '20px';
    
    // Add title
    const title = document.createElement('ui-text');
    title.textContent = 'Dynamic Dashboard';
    title.style.fontSize = '24px';
    title.style.fontWeight = 'bold';
    title.style.marginBottom = '20px';
    container.appendChild(title);
    
    // Add panels
    ${panels.map((panel, index) => `
      const panel${index} = document.createElement('ui-panel');
      panel${index}.style.padding = '15px';
      panel${index}.style.margin = '10px';
      panel${index}.style.border = '1px solid #ddd';
      panel${index}.style.borderRadius = '8px';
      
      const panelTitle${index} = document.createElement('ui-text');
      panelTitle${index}.textContent = '${panel.title || `Panel ${index + 1}`}';
      panelTitle${index}.style.fontWeight = 'bold';
      panel${index}.appendChild(panelTitle${index});
      
      ${panel.value ? `
        const panelValue${index} = document.createElement('ui-text');
        panelValue${index}.textContent = '${panel.value}';
        panelValue${index}.style.fontSize = '2em';
        panelValue${index}.style.color = '#2196F3';
        panel${index}.appendChild(panelValue${index});
      ` : ''}
      
      ${interactive ? `
        panel${index}.style.cursor = 'pointer';
        panel${index}.onclick = () => {
          window.parent.postMessage({
            type: 'tool',
            payload: {
              toolName: 'handlePanelClick',
              params: { panelId: ${index} }
            }
          }, '*');
        };
      ` : ''}
      
      container.appendChild(panel${index});
    `).join('\n')}
    
    // Append to root
    root.appendChild(container);
    
    // Send ready signal
    window.parent.postMessage({
      type: 'ui-lifecycle-iframe-ready',
      payload: { ready: true }
    }, '*');
  `;
}