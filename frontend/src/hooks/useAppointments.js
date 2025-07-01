import { useState } from "react";
import axios from "../utils/axios";
import dayjs from "dayjs";

export function useAppointments() {
  const [editAppointment, setEditAppointment] = useState([]);
  const [appointments, setAppointments] = useState([]);

  const fetchAppointments = async (agendaDate) => {
    // Correction : si dimanche, on prend la semaine précédente (lundi précédent)
    const day = dayjs(agendaDate);
    let startOfWeek;
    if (day.day() === 0) { // 0 = dimanche
      // On recule de 6 jours pour tomber sur le lundi précédent
      startOfWeek = day.subtract(6, 'day');
    } else {
      // startOf('week') donne dimanche, donc on ajoute 1 jour pour lundi
      startOfWeek = day.startOf('week').add(1, 'day');
    }
    const endOfWeek = startOfWeek.add(7, 'day'); // Lundi suivant

    const res = await axios.get('/api/appointments', {
      params: {
        start: startOfWeek.format('YYYY-MM-DD'),
        end: endOfWeek.format('YYYY-MM-DD'),
      }
    });
    setAppointments(res.data || []);
  };

  const saveAppointment = async (appointmentData) => {
    if (appointmentData?._id) {
      await axios.put(`/api/appointments/${appointmentData._id}`, {
        ...(appointmentData.animalId ? { animalId: appointmentData.animalId } : {}),
        ...appointmentData,
      });
    } else {
      await axios.post(`/api/appointments`, {
        ...(appointmentData.animalId ? { animalId: appointmentData.animalId } : {}),
        ...appointmentData,
      });
    }
  };

  const updateAppointment = async ({ event, start, end }) => {
    const id = event.id || event._id;
    await axios.put(`/api/appointments/${id}`, {
      ...event,
      start,
      end,
    });
  };

  const deleteAppointment = async (appointment) => {
    await axios.delete(`/api/appointments/${appointment._id || appointment.id}`);
  };

  return {
    editAppointment,
    setEditAppointment,
    appointments,

    fetchAppointments,
    saveAppointment,
    updateAppointment,
    deleteAppointment,
  };
}