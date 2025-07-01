import React, { useEffect, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';
import axios from '../utils/axios';

export default function StatsDialog({ open, onClose }) {
  const [selected, setSelected] = useState('rdv_week');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open && selected === 'rdv_week') {
      fetchRdvStats();
    }
    // eslint-disable-next-line
  }, [open, selected]);

  async function fetchRdvStats() {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get('/api/stats/rdv-per-week');
      setData(res.data);
    } catch (e) {
      setError('Erreur lors du chargement des statistiques');
    }
    setLoading(false);
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth>
      <DialogTitle>Statistiques</DialogTitle>
      <DialogContent style={{ display: 'flex', minHeight: 400, padding: 0 }}>
        <div style={{ width: 270, borderRight: '1px solid #eee', background: '#fafafa', paddingTop: 16 }}>
          <List>
            <ListItem disablePadding>
              <ListItemButton selected={selected === 'rdv_week'} onClick={() => setSelected('rdv_week')}>
                <ListItemText primary="RDV par semaine (2 ans)" />
              </ListItemButton>
            </ListItem>
            {/* D'autres options ici plus tard */}
          </List>
        </div>
        <Box sx={{ flex: 1, p: 3, display: 'flex', flexDirection: 'column', alignItems: 'stretch', justifyContent: 'flex-start' }}>
          {loading && <CircularProgress />}
          {error && <div style={{ color: 'red' }}>{error}</div>}
          {data && selected === 'rdv_week' && Array.isArray(data.labels) && Array.isArray(data.datasets) ? (
            <Bar
              data={data}
              options={{
                responsive: true,
                plugins: {
                  legend: { position: 'top' },
                  title: { display: true, text: 'Nombre de RDV par semaine (année courante vs précédente)' }
                },
                scales: {
                  x: { title: { display: true, text: 'Semaine' } },
                  y: { title: { display: true, text: 'Nombre de RDV' }, beginAtZero: true }
                }
              }}
              style={{ width: '100%', height: '400px' }}
            />
          ) : data && selected === 'rdv_week' && (
            <div style={{ color: 'red' }}>Données statistiques invalides ou absentes.</div>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
}
