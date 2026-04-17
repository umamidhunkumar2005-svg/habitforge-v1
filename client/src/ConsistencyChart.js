import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const ConsistencyChart = ({ habits }) => {
  // 1. Generate labels for the last 7 days (e.g., "Mon", "Tue")
  const labels = [];
  const dataPoints = [0, 0, 0, 0, 0, 0, 0];

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    labels.push(d.toLocaleDateString('en-US', { weekday: 'short' }));
  }

  // 2. Count how many habits were completed on each of those days
  habits.forEach(habit => {
    habit.completedDates.forEach(dateString => {
      const date = new Date(dateString);
      const today = new Date();
      
      // Calculate how many days ago this was
      const diffTime = today.setUTCHours(0,0,0,0) - date.setUTCHours(0,0,0,0);
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      // If it was within the last 7 days, add it to our graph!
      if (diffDays >= 0 && diffDays < 7) {
        const index = 6 - diffDays;
        dataPoints[index] += 1;
      }
    });
  });

  // 3. Define the Chart visuals
  const data = {
    labels,
    datasets: [
      {
        label: 'Habits Completed',
        data: dataPoints,
        borderColor: '#f1c40f', // Gamified Yellow
        backgroundColor: 'rgba(241, 196, 15, 0.2)',
        pointBackgroundColor: '#d35400',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#d35400',
        fill: true,
        tension: 0.4 // Makes the line curvy and modern
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: 'Last 7 Days Consistency',
        color: '#bdc3c7'
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { color: '#bdc3c7', stepSize: 1 }
      },
      x: {
        ticks: { color: '#bdc3c7' }
      }
    }
  };

  return (
    <div style={{ backgroundColor: '#2c3e50', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
      <Line data={data} options={options} />
    </div>
  );
};

export default ConsistencyChart;
