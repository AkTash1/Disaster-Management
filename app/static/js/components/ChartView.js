// Disaster Intelligence Multimodal Platform - ChartView Component
// Chart.js 4.4.2 wrapper styled for the light operational theme: crisp 1.5px strokes,
// subtle #E1E4E8 dashed gridlines, JetBrains Mono tabular ticks, and sharp tooltips.

(function() {
  const React = window.React;
  const { useEffect, useRef } = React;

  const ChartView = ({
    type = "bar", // 'doughnut', 'line', 'bar'
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

      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }

      const ctx = canvasRef.current.getContext('2d');

      const monoFont = { size: 10, family: '"JetBrains Mono", ui-monospace, monospace' };

      const defaultOptions = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false
        },
        elements: {
          line: { borderWidth: 1.5, tension: 0.15 },
          point: { radius: 2, hoverRadius: 4 }
        },
        plugins: {
          legend: {
            display: true,
            position: 'bottom',
            labels: {
              color: '#3A414D',
              font: monoFont,
              boxWidth: 10,
              boxHeight: 10,
              padding: 10
            }
          },
          tooltip: {
            backgroundColor: '#14171C',
            titleColor: '#FFFFFF',
            bodyColor: '#E1E4E8',
            borderColor: '#3A414D',
            borderWidth: 1,
            padding: 8,
            cornerRadius: 2,
            bodyFont: monoFont,
            titleFont: { ...monoFont, weight: '600' }
          }
        }
      };

      if (type === 'line' || type === 'bar') {
        defaultOptions.scales = {
          x: {
            grid: { color: '#E1E4E8', borderDash: [2, 2], drawBorder: false },
            ticks: { color: '#5E6675', font: monoFont }
          },
          y: {
            grid: { color: '#E1E4E8', borderDash: [2, 2], drawBorder: false },
            ticks: { color: '#5E6675', font: monoFont }
          }
        };
      }

      const mergedOptions = {
        ...defaultOptions,
        ...options,
        plugins: {
          ...defaultOptions.plugins,
          ...(options.plugins || {})
        },
        scales: (type === 'line' || type === 'bar') ? {
          x: { ...defaultOptions.scales.x, ...(options.scales?.x || {}) },
          y: { ...defaultOptions.scales.y, ...(options.scales?.y || {}) }
        } : undefined
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
          <div className="panel-title mb-2 truncate">{title}</div>
        )}
        <div className="relative flex-1 w-full h-full min-h-[140px]">
          <canvas ref={canvasRef} />

          {type === 'doughnut' && (centerText || centerSubtext) && (
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-6">
              {centerText && (
                <span className="font-mono text-lg font-semibold text-ink tracking-tight leading-none">
                  {centerText}
                </span>
              )}
              {centerSubtext && (
                <span className="font-mono text-[10px] text-muted mt-0.5 leading-none uppercase">
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
