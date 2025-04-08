import React from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

// Enregistrer les composants nécessaires de Chart.js
ChartJS.register(ArcElement, Tooltip, Legend);

const PieChart = ({ totalLits, totalDispo, totalRestant, smallVersion = false }) => {
  // Couleurs personnalisées - rose et jaune
  const colors = {
    available: "#FFD700", // Jaune
    occupied: "#FF69B4",  // Rose
    background: "#f8f9fa" // Fond clair
  };

  const data = {
    labels: ["Lits disponibles", "Lits occupés"],
    datasets: [
      {
        label: "Répartition des lits",
        data: [totalDispo, totalRestant],
        backgroundColor: [colors.available, colors.occupied],
        borderColor: [colors.available, colors.occupied],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: smallVersion ? "bottom" : "right",
        labels: {
          font: {
            size: smallVersion ? 10 : 12,
          },
          padding: smallVersion ? 5 : 10,
          usePointStyle: true,
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.raw || 0;
            const percentage = Math.round((value / totalLits) * 100);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      },
    },
    cutout: smallVersion ? '60%' : '50%', // Trou au centre plus grand pour les petites versions
  };

  return (
    <div style={{ 
      width: smallVersion ? '150px' : '300px', 
      height: smallVersion ? '150px' : '300px',
      margin: '0 auto'
    }}>
      <Pie data={data} options={options} />
    </div>
  );
};

export default PieChart;