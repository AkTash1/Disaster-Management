// Disaster Intelligence Multimodal Platform - ChartView Component
// Chart.js 4.4.2 wrapper for Doughnut, Line, and Stacked Bar charts with Dark Theme styling

(function() {
  const React = window.React;
  const { useEffect, useRef } = React;

  const ChartView = ({
    type = "doughnut", // 'doughnut', 'line', 'bar'
    data = null,
    options = {},
    title = "",
    centerText = "",
    centerSubtext = "",
    height = 200,
    className = ""
  }) => {
    const canvasRef = useRef(null);
    const chartInstanceRef = useRef(null);

    useEffect(() => {
      if (!canvasRef.current || !data) return;
      if (typeof window.Chart === "undefined") {
        console.warn("Chart.js library not loaded yet.");
        return;
      }

      // Destroy previous chart instance
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }

      const ctx = canvasRef.current.getContext('2d');

      // Base default options for dark theme
      const defaultOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: type !== 'line' && type !== 'bar',
            position: 'bottom',
            labels: {
              color: '#94a3b8',
              font: { size: 10, family: '-apple-system, BlinkMacSystemFont, sans-serif' },
              boxWidth: 10,
              padding: 10
            }
          },
          tooltip: {
            backgroundColor: '#1e293b',
            titleColor: '#f8fafc',
            bodyColor: '#e2e8f0',
            borderColor: '#334155',
            borderWidth: 1,
            padding: 8,
            cornerRadius: 6,
            bodyFont: { size: 11 },
            titleFont: { size: 12, weight: 'bold' }
          }
        }
      };

      // Add scale configuration for Cartesian charts (line, bar)
      if (type === 'line' || type === 'bar') {
        defaultOptions.scales = {
          x: {
            grid: { color: 'rgba(51, 65, 85, 0.3)', drawBorder: false },
            ticks: { color: '#94a3b8', font: { size: 10 } }
          },
          y: {
            grid: { color: 'rgba(51, 65, 85, 0.3)', drawBorder: false },
            ticks: { color: '#94a3b8', font: { size: 10 } }
          }
        };
      }

      // Merge user options with default options
      const mergedOptions = {
        ...defaultOptions,
        ...options,
        plugins: {
          ...defaultOptions.plugins,
          ...(options.plugins || {})
        }
      };

      try {
        chartInstanceRef.current = new window.Chart(ctx, {
          type: type,
          data: data,
          options: mergedOptions
        });
      } catch (err) {
        console.error("Failed to render Chart.js instance:", err);
      }

      return () => {
        if (chartInstanceRef.current) {
          chartInstanceRef.current.destroy();
          chartInstanceRef.current = null;
        }
      };
    }, [type, data, JSON.stringify(options)]);

    return (
      <div className={`relative flex flex-col justify-between ${className}`} style={{ height }}>
        {title && (
          <div className="text-xs font-semibold text-slate-300 mb-2 truncate">{title}</div>
        )}
        <div className="relative flex-1 w-full h-full min-h-[140px]">
          <canvas ref={canvasRef} />

          {/* Center text overlay for Donuts */}
          {type === 'doughnut' && (centerText || centerSubtext) && (
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-5">
              {centerText && (
                <span className="text-lg font-bold text-slate-100 tracking-tight leading-none">
                  {centerText}
                </span>
              )}
              {centerSubtext && (
                <span className="text-[10px] text-slate-400 mt-0.5 leading-none">
                  {centerSubtext}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  window.DisasterComponents = window.DisasterComponents || {};
  window.DisasterComponents.ChartView = ChartView;
  window.ChartView = ChartView;
})();
