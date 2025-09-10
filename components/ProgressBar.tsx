import React from 'react';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  label: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ currentStep, totalSteps, label }) => {
  const percentage = (currentStep / totalSteps) * 100;

  return (
    <div className="w-full mb-8">
      <div className="flex justify-between mb-1">
        <span className="text-base font-medium text-blue-700 dark:text-white">{label}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
        <div 
          className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-out" 
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={currentStep}
          aria-valuemin={1}
          aria-valuemax={totalSteps}
          aria-label={label}
        ></div>
      </div>
    </div>
  );
};

export default ProgressBar;
