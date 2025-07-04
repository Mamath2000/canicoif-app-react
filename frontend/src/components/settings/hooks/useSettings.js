import { useState } from "react";
import axios from "../../../utils/axios";

const emptySettings = {
  showStatsButton: false,
};

export function useSettings() {
  const [allSettings, setAllSettings] = useState(emptySettings);

  const fetchSettings = async () => {
    try {
      const res = await axios.get('/api/settings');
      setAllSettings(res.data);
      return res.data;
    } catch (e) {
      return {};
    }
  };

  const getSettings = async (settingName) => {
    const settings = await fetchSettings();
    return settings?.[settingName];
  };

  const setSettings = async (updatedSettings) => {
    try {
      const currentSettings = await fetchSettings();
      const newSettings = { ...currentSettings, ...updatedSettings };
      await axios.post('/api/settings', newSettings);
      return newSettings;
    } catch (error) {
      console.error('Erreur lors de la mise à jour des paramètres:', error);
    } 
  };

  return {
    getSettings,
    setSettings,
  };
}