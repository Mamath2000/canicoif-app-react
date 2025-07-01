import React, { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import UserManagement from './UserManagement';

export default function SettingsDialog({ open, onClose }) {
  const [selected, setSelected] = useState('users');

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Paramètres</DialogTitle>
      <DialogContent style={{ display: 'flex', minHeight: 400, padding: 0 }}>
        <div style={{ width: 260, borderRight: '1px solid #eee', background: '#fafafa', paddingTop: 16 }}>
          <List>
            <ListItem disablePadding>
              <ListItemButton selected={selected === 'users'} onClick={() => setSelected('users')}>
                <ListItemText primary="Gestion des utilisateurs" />
              </ListItemButton>
            </ListItem>
            {/* D'autres options ici plus tard */}
          </List>
        </div>
        <div style={{ flex: 1, padding: 24 }}>
          {selected === 'users' && <UserManagement />}
        </div>
      </DialogContent>
    </Dialog>
  );
}
