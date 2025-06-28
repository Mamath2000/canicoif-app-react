import { useState } from "react";
import axios from "axios";
import dayjs from "dayjs";

export function useAppointments() {
  const [appointments, setAppointments] = useState([]);

  const fetchAppointments = async (selectedDate) => {
    // Calcule le lundi et le lundi suivant (exclu)
    const day = dayjs(selectedDate);
    const startOfWeek = day.startOf('week').add(1, 'day'); // Lundi
    const endOfWeek = startOfWeek.add(7, 'day'); // Lundi suivant

    const res = await axios.get('/api/appointments', {
      params: {
        start: startOfWeek.format('YYYY-MM-DD'),
        end: endOfWeek.format('YYYY-MM-DD'),
      }
    });
    setAppointments(res.data || []);
  };

  const saveAppointment = async (appointmentData, editAppointmentData, selectedDate) => {
    if (editAppointmentData?._id) {
      await axios.put(`/api/appointments/${editAppointmentData._id}`, {
        ...(appointmentData.animalId ? { animalId: appointmentData.animalId } : {}),
        ...appointmentData,
      });
    } else {
      await axios.post(`/api/appointments`, {
        ...(appointmentData.animalId ? { animalId: appointmentData.animalId } : {}),
        ...appointmentData,
      });
    }
    await fetchAppointments(selectedDate);
  };

  const updateAppointment = async ({ event, start, end }, selectedDate) => {
    const id = event.id || event._id;
    await axios.put(`/api/appointments/${id}`, {
      ...event,
      start,
      end,
    });
    await fetchAppointments(selectedDate);
  };

  const deleteAppointment = async (appointment, selectedDate) => {
    await axios.delete(`/api/appointments/${appointment._id || appointment.id}`);
    await fetchAppointments(selectedDate);
  };

  return {
    appointments,
    fetchAppointments,
    saveAppointment,
    updateAppointment,
    deleteAppointment,
    setAppointments, // si besoin de le setter manuellement
  };
}