import { useState, useEffect } from 'react';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import { useSettings } from "./hooks/useSettings";


export default function AppSettings() {
  const [showStats, setShowStats] = useState(false);

  const {
    getSettings,
    setSettings,
  } = useSettings();

  useEffect(() => {
    const fetchSettings = async () => {
      const checked = await getSettings('showStatsFlag');
      setShowStats(!!checked);
    };

    fetchSettings();
  }, []);

  const handleToggle = async (event) => {
    const checked = event.target.checked;
    setShowStats(checked);
    await setSettings({ showStatsFlag: checked });
  };

  return (
    <div style={{ maxWidth: 900, minWidth: 700, margin: 'auto' }}>
      <h2>Paramètres de l'application</h2>
      <FormControlLabel
        control={<Switch checked={!!showStats} onChange={handleToggle} />}
        label="Activer les statistiques"
      />
    </div>
  );
}
