import React from 'react';
import type { LanguageCode, Translation } from '../types';
import { languages } from '../lib/i18n';

interface LanguageSelectorProps {
  currentLang: LanguageCode;
  onLanguageChange: (newLang: LanguageCode) => void;
  t: Translation;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ currentLang, onLanguageChange, t }) => {
  return (
    <div className="relative">
      <select
        aria-label={t.selectLanguage}
        value={currentLang}
        onChange={(e) => onLanguageChange(e.target.value as LanguageCode)}
        className="appearance-none w-full md:w-auto bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 py-2 px-4 pr-8 rtl:pl-8 rtl:pr-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.name}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 rtl:right-auto rtl:left-0 flex items-center px-2 text-gray-700 dark:text-gray-200">
        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
        </svg>
      </div>
    </div>
  );
};

export default LanguageSelector;