import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarProps {
  currentDate: Date;
  onDateChange: (newDate: Date) => void;
  renderDay: (day: Date) => React.ReactNode;
  headerControl?: React.ReactNode;
}

const Calendar: React.FC<CalendarProps> = ({ currentDate, onDateChange, renderDay, headerControl }) => {
  const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const startDate = new Date(startOfMonth);
  startDate.setDate(startDate.getDate() - startOfMonth.getDay());

  const days = [];
  let currentDatePointer = new Date(startDate);

  // Ensure calendar grid always has 6 rows (42 days) for consistent height
  while (days.length < 42) {
    days.push(new Date(currentDatePointer));
    currentDatePointer.setDate(currentDatePointer.getDate() + 1);
  }

  const handlePrevMonth = () => {
    onDateChange(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    onDateChange(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <button onClick={handlePrevMonth} className="p-2 rounded-lg hover:bg-gray-700">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h2 className="text-lg font-semibold text-white">
          {currentDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' }).replace(/^\w/, c => c.toUpperCase())}
        </h2>
        <button onClick={handleNextMonth} className="p-2 rounded-lg hover:bg-gray-700">
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {daysOfWeek.map(day => (
          <div key={day} className="text-center text-xs font-medium text-gray-400 py-2">
            {day}
          </div>
        ))}
        {days.map((day, index) => (
          <div key={index} className="relative">
            {renderDay(day)}
          </div>
        ))}
      </div>
      {headerControl && (
        <div className="flex justify-center mt-4">
            {headerControl}
        </div>
      )}
    </div>
  );
};

export default Calendar;
