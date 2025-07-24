import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

Chart.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const data = {
    labels: ['15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25'],
    datasets: [
        {
            label: 'Activity Report',
            data: [75, 89, 50, 60, 70, 55, 65, 75, 85, 95, 100],
            fill: false,
            backgroundColor: 'red',
            borderColor: 'rgba(255, 99, 132, 1)',
        },
    ],
};

const options = {
    maintainAspectRatio: false,
    scales: {
        y: {
            beginAtZero: true,
        },
    },
};

const ActivityReport: React.FC = () => {
    return (
            <Line data={data} options={options} />
    );
};

export default ActivityReport;
