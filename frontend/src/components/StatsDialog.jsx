import React, { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import StatsChart from './StatsChart';

export default function StatsDialog({ open, onClose }) {
  const [selected, setSelected] = useState('rdv_week');

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
            <ListItem disablePadding>
              <ListItemButton selected={selected === 'rdv_month'} onClick={() => setSelected('rdv_month')}>
                <ListItemText primary="RDV par mois (2 ans)" />
              </ListItemButton>
            </ListItem>
          </List>
        </div>  
        <div style={{ flex: 1, padding: 24, minWidth: 0 }}>
          {selected === 'rdv_week' && (
            <StatsChart
              endpoint="/api/stats/rdv-per-week"
              title="Nombre de RDV par semaine (année courante vs précédente)"
              xLabel="Semaine"
              yLabel="Nombre de RDV"
            />
          )}
          {selected === 'rdv_month' && (
            <StatsChart
              endpoint="/api/stats/rdv-per-month"
              title="Nombre de RDV par mois (année courante vs précédente)"
              xLabel="Mois"
              yLabel="Nombre de RDV"
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
