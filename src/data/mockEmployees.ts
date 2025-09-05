interface WorkingHour {
  day: string;
  start: string;
  end: string;
  active: boolean;
  hasBreak: boolean;
  breakStart: string;
  breakEnd: string;
}

export interface Employee {
  id: number;
  name: string;
  phone: string;
  email: string;
  serviceCommission: string;
  productCommission: string;
  active: boolean;
  workingHours: WorkingHour[];
  serviceIds: number[];
}

const defaultWorkingHours = (): WorkingHour[] => [
  { day: 'Segunda-feira', start: '08:00', end: '18:00', active: true, hasBreak: true, breakStart: '12:00', breakEnd: '13:00' },
  { day: 'Terça-feira', start: '08:00', end: '18:00', active: true, hasBreak: true, breakStart: '12:00', breakEnd: '13:00' },
  { day: 'Quarta-feira', start: '08:00', end: '18:00', active: true, hasBreak: true, breakStart: '12:00', breakEnd: '13:00' },
  { day: 'Quinta-feira', start: '08:00', end: '18:00', active: true, hasBreak: true, breakStart: '12:00', breakEnd: '13:00' },
  { day: 'Sexta-feira', start: '08:00', end: '18:00', active: true, hasBreak: true, breakStart: '12:00', breakEnd: '13:00' },
  { day: 'Sábado', start: '09:00', end: '16:00', active: true, hasBreak: false, breakStart: '12:00', breakEnd: '13:00' },
  { day: 'Domingo', start: '10:00', end: '14:00', active: false, hasBreak: false, breakStart: '12:00', breakEnd: '13:00' }
];

export const initialEmployees: Employee[] = [
    { id: 1, name: 'João Pereira', phone: '(11) 99999-8888', email: 'joao.p@example.com', serviceCommission: '50', productCommission: '10', active: true, workingHours: defaultWorkingHours(), serviceIds: [1, 3] },
    { id: 2, name: 'Maria Oliveira', phone: '(21) 98888-7777', email: 'maria.o@example.com', serviceCommission: '60', productCommission: '15', active: true, workingHours: defaultWorkingHours(), serviceIds: [2, 4, 5] },
    { id: 3, name: 'Ricardo Santos', phone: '(31) 97777-6666', email: 'ricardo.s@example.com', serviceCommission: '45', productCommission: '10', active: true, workingHours: defaultWorkingHours(), serviceIds: [1, 3, 5] },
    { id: 4, name: 'Fernanda Lima', phone: '(41) 96666-5555', email: 'fernanda.l@example.com', serviceCommission: '55', productCommission: '12', active: false, workingHours: defaultWorkingHours(), serviceIds: [2, 4] },
];
