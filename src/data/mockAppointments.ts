export interface Appointment {
  id: number;
  clientId: number;
  serviceId: number;
  employeeId: number;
  start: Date;
  end: Date;
  paymentStatus: 'pago' | 'pendente';
  appointmentStatus: 'agendado' | 'cancelado' | 'concluido';
}

let appointments: Appointment[] = [
    { id: 1, clientId: 1, serviceId: 1, employeeId: 1, start: new Date('2025-08-10T10:00:00'), end: new Date('2025-08-10T10:30:00'), paymentStatus: 'pago', appointmentStatus: 'agendado' },
    { id: 2, clientId: 2, serviceId: 2, employeeId: 2, start: new Date('2025-08-10T11:30:00'), end: new Date('2025-08-10T12:30:00'), paymentStatus: 'pendente', appointmentStatus: 'agendado' },
    { id: 3, clientId: 3, serviceId: 3, employeeId: 1, start: new Date('2025-08-11T14:00:00'), end: new Date('2025-08-11T14:45:00'), paymentStatus: 'pendente', appointmentStatus: 'cancelado' },
    { id: 4, clientId: 4, serviceId: 5, employeeId: 2, start: new Date('2025-08-11T10:00:00'), end: new Date('2025-08-11T11:00:00'), paymentStatus: 'pago', appointmentStatus: 'concluido' },
    { id: 5, clientId: 2, serviceId: 3, employeeId: 1, start: new Date('2025-08-12T15:00:00'), end: new Date('2025-08-12T15:45:00'), paymentStatus: 'pendente', appointmentStatus: 'agendado' },
];

// Simulating a small API layer to interact with the data
export const appointmentApi = {
  getAppointments: (): Promise<Appointment[]> => {
    return Promise.resolve(appointments);
  },

  addAppointment: (newAppointmentData: Omit<Appointment, 'id'>): Promise<Appointment> => {
    const newAppointment: Appointment = {
      id: Date.now(),
      ...newAppointmentData,
    };
    appointments = [newAppointment, ...appointments];
    return Promise.resolve(newAppointment);
  },

  updateAppointment: (updatedAppointment: Appointment): Promise<Appointment> => {
    appointments = appointments.map(apt => apt.id === updatedAppointment.id ? updatedAppointment : apt);
    return Promise.resolve(updatedAppointment);
  },
};
