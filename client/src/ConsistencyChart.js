import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

function ConsistencyChart({ habits }) {
  // --- 1. 30-DAY LINE GRAPH LOGIC ---
  const last30Days = [];
  const completionsPerDay = [];

  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateString = `${d.getMonth() + 1}/${d.getDate()}`;
    last30Days.push(dateString);

    let count = 0;
    habits.forEach(habit => {
      habit.completedDates.forEach(completedDate => {
        const cd = new Date(completedDate);
        if (cd.getDate() === d.getDate() && cd.getMonth() === d.getMonth() && cd.getFullYear() === d.getFullYear()) {
          count++;
        }
      });
    });
    completionsPerDay.push(count);
  }

  const lineData = {
    labels: last30Days,
    datasets: [
      {
        label: 'Habits Completed',
        data: completionsPerDay,
        borderColor: '#f1c40f',
        backgroundColor: 'rgba(241, 196, 15, 0.2)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#e74c3c',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#e74c3c',
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Last 30 Days Consistency', color: '#bdc3c7' },
    },
    scales: {
      y: { beginAtZero: true, ticks: { stepSize: 1, color: '#bdc3c7' }, grid: { color: 'rgba(255,255,255,0.05)' } },
      x: { ticks: { color: '#bdc3c7', maxTicksLimit: 10 }, grid: { display: false } }
    },
  };

  // --- 2. GITHUB-STYLE YEARLY HEATMAP LOGIC ---
  const heatmapDays = [];
  for (let i = 364; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    
    let count = 0;
    habits.forEach(habit => {
      habit.completedDates.forEach(completedDate => {
        const cd = new Date(completedDate);
        if (cd.getDate() === d.getDate() && cd.getMonth() === d.getMonth() && cd.getFullYear() === d.getFullYear()) {
          count++;
        }
      });
    });
    
    // Determine color intensity based on completions
    let intensityClass = "heatmap-level-0"; // empty
    if (count === 1) intensityClass = "heatmap-level-1"; // light green
    if (count === 2) intensityClass = "heatmap-level-2"; // medium green
    if (count >= 3) intensityClass = "heatmap-level-3";  // dark green

    heatmapDays.push({ date: d.toDateString(), count, intensityClass });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 30-Day Line Chart */}
      <div style={{ backgroundColor: '#2c3e50', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', height: '250px' }}>
        <Line data={lineData} options={lineOptions} />
      </div>

      {/* GitHub-Style Yearly Heatmap */}
      <div style={{ backgroundColor: '#2c3e50', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', overflowX: 'auto' }}>
        <h4 style={{ margin: '0 0 15px 0', color: '#bdc3c7', textAlign: 'center' }}>Yearly Contribution Heatmap</h4>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(52, 1fr)', 
          gridTemplateRows: 'repeat(7, 1fr)', 
          gap: '4px',
          gridAutoFlow: 'column',
          minWidth: '800px' // Ensures it scrolls on small screens instead of squishing
        }}>
          {heatmapDays.map((day, index) => (
            <div 
              key={index} 
              title={`${day.count} habits completed on ${day.date}`}
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '2px',
                backgroundColor: 
                  day.intensityClass === 'heatmap-level-0' ? '#1a252f' :
                  day.intensityClass === 'heatmap-level-1' ? '#2ecc71' :
                  day.intensityClass === 'heatmap-level-2' ? '#27ae60' : '#1e8449'
              }}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ConsistencyChart;
