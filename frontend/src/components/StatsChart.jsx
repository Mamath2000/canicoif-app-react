import React, { useEffect, useState } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import axios from '../utils/axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

import { Bar } from 'react-chartjs-2';

// Enregistrement des composants nécessaires
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

/**
 * Props:
 *   endpoint: string (ex: '/api/stats/rdv-per-week')
 *   title: string (titre du graphique)
 *   xLabel: string
 *   yLabel: string
 */

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <h2>Une erreur s'est produite. Veuillez réessayer plus tard.</h2>;
    }

    return this.props.children;
  }
}

export default function StatsChart({ endpoint, title, xLabel, yLabel }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, [endpoint]);

  async function fetchData() {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(endpoint);
      setData(res.data);
    } catch (e) {
      setError('Erreur lors du chargement des statistiques');
    }
    setLoading(false);
  }

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: title }
    },
    scales: {
      x: { title: { display: true, text: xLabel } },
      y: { title: { display: true, text: yLabel }, beginAtZero: true }
    }
  };

  const StatsChart = ({ data, options }) => {
    const chartKey = JSON.stringify(data); // Utilisez une clé unique basée sur les données
    return <Bar key={chartKey} data={data} options={options} />;
  };

  return (
    <ErrorBoundary>
      <Box
        sx={{
          flex: 1,
          width: '100%',
          minHeight: 400,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          justifyContent: 'flex-start'
        }}
      >
        {loading && <CircularProgress />}
        {error && <div style={{ color: 'red' }}>{error}</div>}
        {data && Array.isArray(data.labels) && Array.isArray(data.datasets) ? (
          <StatsChart
            data={data}
            options={options}
            style={{ width: '100%', height: '400px' }}
          />
        ) : data && <div style={{ color: 'red' }}>Données statistiques invalides ou absentes.</div>}
      </Box>
    </ErrorBoundary>
  );
}
