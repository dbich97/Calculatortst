import React from 'react';
import type { Translation } from '../types';

type Calendar = 'gregorian' | 'hijri';

interface CalendarSelectorProps {
  currentCalendar: Calendar;
  onCalendarChange: (newCalendar: Calendar) => void;
  t: Translation;
}

const CalendarSelector: React.FC<CalendarSelectorProps> = ({ currentCalendar, onCalendarChange, t }) => {
  const buttonBaseClasses = "w-full px-4 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 transition-colors duration-200";
  const activeClasses = "bg-blue-600 text-white shadow";
  const inactiveClasses = "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600";

  return (
    <div className="mb-6">
      <label className="block text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
        {t.calendarType}
      </label>
      <div className="flex space-x-2 rtl:space-x-reverse rounded-md bg-gray-100 dark:bg-gray-900 p-1">
        <button
          onClick={() => onCalendarChange('gregorian')}
          className={`${buttonBaseClasses} ${currentCalendar === 'gregorian' ? activeClasses : inactiveClasses}`}
          aria-pressed={currentCalendar === 'gregorian'}
        >
          {t.gregorian}
        </button>
        <button
          onClick={() => onCalendarChange('hijri')}
          className={`${buttonBaseClasses} ${currentCalendar === 'hijri' ? activeClasses : inactiveClasses}`}
           aria-pressed={currentCalendar === 'hijri'}
        >
          {t.hijri}
        </button>
      </div>
    </div>
  );
};

export default CalendarSelector;
