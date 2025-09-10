import React, { useReducer, useEffect, useRef } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import type { Translation, LanguageCode } from '../types';
import { usePageMetadata } from '../lib/hooks';
import { languagesWithHoursCalculator } from '../lib/i18n';

interface PageContext {
  t: Translation;
  currentLang: LanguageCode;
}

// Calculator state and actions
interface CalculatorState {
  currentOperand: string;
  previousOperand: string | null;
  operation: string | null;
  overwrite: boolean;
  error: string | null;
}

const initialState: CalculatorState = {
  currentOperand: '0',
  previousOperand: null,
  operation: null,
  overwrite: true,
  error: null,
};

type Action =
  | { type: 'ADD_DIGIT'; payload: string }
  | { type: 'CHOOSE_OPERATION'; payload: string }
  | { type: 'CLEAR' }
  | { type: 'DELETE_DIGIT' }
  | { type: 'EVALUATE' };


function evaluate({ currentOperand, previousOperand, operation }: CalculatorState): string {
  const prev = parseFloat(previousOperand!);
  const current = parseFloat(currentOperand);
  if (isNaN(prev) || isNaN(current)) return '';
  let computation: number = 0;
  switch (operation) {
    case '+':
      computation = prev + current;
      break;
    case '-':
      computation = prev - current;
      break;
    case '×':
      computation = prev * current;
      break;
    case '÷':
      if (current === 0) return 'Error';
      computation = prev / current;
      break;
  }
  return computation.toString();
}

function reducer(state: CalculatorState, action: Action): CalculatorState {
  if (state.error && action.type !== 'CLEAR') {
    return state;
  }
  switch (action.type) {
    case 'ADD_DIGIT':
      if (state.overwrite) {
        return {
          ...state,
          currentOperand: action.payload,
          overwrite: false,
          error: null,
        };
      }
      if (action.payload === '0' && state.currentOperand === '0') return state;
      if (action.payload === '.' && state.currentOperand.includes('.')) return state;
      return {
        ...state,
        currentOperand: `${state.currentOperand}${action.payload}`,
      };

    case 'CHOOSE_OPERATION':
      if (state.currentOperand === '0' && state.previousOperand === null) {
        return state;
      }
      if (state.previousOperand === null) {
        return {
          ...state,
          operation: action.payload,
          previousOperand: state.currentOperand,
          currentOperand: '0',
          overwrite: true,
        };
      }
      if (state.currentOperand === '0') {
         return { ...state, operation: action.payload };
      }
      
      const evalResult = evaluate(state);
       if (evalResult === 'Error') {
          return { ...initialState, error: 'Error', currentOperand: 'Error' };
      }

      return {
        ...state,
        previousOperand: evalResult,
        operation: action.payload,
        currentOperand: '0',
        overwrite: true,
      };

    case 'CLEAR':
      return initialState;

    case 'DELETE_DIGIT':
      if (state.overwrite) {
        return {
          ...state,
          currentOperand: '0',
          overwrite: true,
        };
      }
      if (state.currentOperand.length === 1) {
        return { ...state, currentOperand: '0', overwrite: true };
      }
      return {
        ...state,
        currentOperand: state.currentOperand.slice(0, -1),
      };

    case 'EVALUATE':
      if (
        state.operation === null ||
        state.previousOperand === null
      ) {
        return state;
      }

      const result = evaluate(state);
      if (result === 'Error') {
        return { ...initialState, error: 'Error', currentOperand: 'Error' };
      }
      
      return {
        ...state,
        overwrite: true,
        previousOperand: null,
        operation: null,
        currentOperand: result,
      };

    default:
      return state;
  }
}

const formatOperand = (operand: string | null) => {
    if (operand == null) return null;
    if (operand === 'Error') return 'Error';
    const [integer, decimal] = operand.split('.');
    if (integer === '' && decimal != null) return `0.${decimal}`;
    if(integer == null) return null;
    const formattedInteger = new Intl.NumberFormat('en-US', {maximumFractionDigits: 0}).format(parseFloat(integer));
    if (decimal != null) {
        return `${formattedInteger}.${decimal}`;
    }
    return formattedInteger;
}

const CalculatorCard: React.FC<{ to: string; title: string; description: string; icon: string; }> = ({ to, title, description, icon }) => (
    <Link to={to} className="block bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 ease-in-out h-full">
        <div className="text-4xl mb-4 text-blue-500">{icon}</div>
        <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">{title}</h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm">{description}</p>
    </Link>
);


const HomePage: React.FC = () => {
  const { t, currentLang } = useOutletContext<PageContext>();
  usePageMetadata(t.homeTitle, t.homeDescription);

  const [{ currentOperand, previousOperand, operation, error }, dispatch] = useReducer(reducer, initialState);
  const buttonsRef = useRef<Record<string, HTMLButtonElement | null>>({});

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      let key = e.key;
      
      const keyMap: { [key: string]: () => void } = {
        '0': () => dispatch({ type: 'ADD_DIGIT', payload: '0' }), '1': () => dispatch({ type: 'ADD_DIGIT', payload: '1' }),
        '2': () => dispatch({ type: 'ADD_DIGIT', payload: '2' }), '3': () => dispatch({ type: 'ADD_DIGIT', payload: '3' }),
        '4': () => dispatch({ type: 'ADD_DIGIT', payload: '4' }), '5': () => dispatch({ type: 'ADD_DIGIT', payload: '5' }),
        '6': () => dispatch({ type: 'ADD_DIGIT', payload: '6' }), '7': () => dispatch({ type: 'ADD_DIGIT', payload: '7' }),
        '8': () => dispatch({ type: 'ADD_DIGIT', payload: '8' }), '9': () => dispatch({ type: 'ADD_DIGIT', payload: '9' }),
        '.': () => dispatch({ type: 'ADD_DIGIT', payload: '.' }), '+': () => dispatch({ type: 'CHOOSE_OPERATION', payload: '+' }),
        '-': () => dispatch({ type: 'CHOOSE_OPERATION', payload: '-' }), '*': () => dispatch({ type: 'CHOOSE_OPERATION', payload: '×' }),
        '/': () => dispatch({ type: 'CHOOSE_OPERATION', payload: '÷' }), 'Enter': () => dispatch({ type: 'EVALUATE' }),
        '=': () => dispatch({ type: 'EVALUATE' }), 'Backspace': () => dispatch({ type: 'DELETE_DIGIT' }),
        'Escape': () => dispatch({ type: 'CLEAR' }), 'c': () => dispatch({ type: 'CLEAR' }),
      };

      const action = keyMap[key.toLowerCase()];
      if (action) {
        action();
        let buttonKey = key;
        if (key === '*') buttonKey = '×'; if (key === '/') buttonKey = '÷'; if (key === 'Enter' || key === '=') buttonKey = '=';
        if (key === 'Backspace') buttonKey = 'DEL'; if (key === 'Escape' || key.toLowerCase() === 'c') buttonKey = 'AC';
        flashButton(buttonKey);
      }
    };
    
    const flashButton = (key: string) => {
        const button = buttonsRef.current[key];
        if (button) {
            button.classList.add('ring-4', 'ring-blue-400', 'dark:ring-blue-600', 'scale-105');
            setTimeout(() => {
                button.classList.remove('ring-4', 'ring-blue-400', 'dark:ring-blue-600', 'scale-105');
            }, 150);
        }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [dispatch]);


  const CalculatorButton = ({
    value,
    onClick,
    className = '',
    gridSpan = 1,
  }: {
    value: string;
    onClick: () => void;
    className?: string;
    gridSpan?: number;
  }) => {
    const spanClass = gridSpan > 1 ? `col-span-${gridSpan}` : 'col-span-1';
    
    return (
        <button
            ref={el => { buttonsRef.current[value] = el; }}
            onClick={onClick}
            disabled={error !== null && value !== 'AC'}
            aria-label={value}
            className={`
                py-4 rounded-lg text-2xl md:text-3xl font-bold transition-all duration-150 ease-in-out
                focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 focus:ring-blue-500
                disabled:opacity-50 disabled:cursor-not-allowed
                shadow-md hover:shadow-lg active:shadow-sm transform active:scale-95
                ${className} ${spanClass}
            `}
        >
            {value}
        </button>
    );
  };
  
  return (
    <main className="w-full">
      {/* Hero and Basic Calculator Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row lg:rtl:flex-row-reverse gap-16 items-center">
                {/* Hero Text */}
                <div className="lg:w-1/2 text-center lg:text-left rtl:lg:text-right">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white mb-4 leading-tight">
                        {t.homeTitle}
                    </h1>
                    <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-lg mx-auto lg:mx-0">
                        {t.homeDescription}
                    </p>
                </div>

                {/* Basic Calculator */}
                <div className="lg:w-1/2">
                    <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-6">
                        {t.homeBasicCalculatorTitle}
                    </h2>
                    <div className="max-w-xs sm:max-w-sm mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-4 md:p-6 space-y-4">
                        {/* Display */}
                        <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-4 text-right break-words shadow-inner min-h-[110px] flex flex-col justify-end">
                            <div className="text-gray-500 dark:text-gray-400 text-xl h-7">
                                {formatOperand(previousOperand)} {operation}
                            </div>
                            <div className="text-gray-900 dark:text-white text-4xl md:text-5xl font-bold" id="display">
                                {formatOperand(currentOperand)}
                            </div>
                        </div>

                        {/* Keypad */}
                        <div className="grid grid-cols-4 gap-2 md:gap-4">
                            <CalculatorButton value="AC" onClick={() => dispatch({ type: 'CLEAR' })} className="bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-900 dark:text-white" />
                            <CalculatorButton value="DEL" onClick={() => dispatch({ type: 'DELETE_DIGIT' })} className="bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-900 dark:text-white" />
                            <CalculatorButton value="%" onClick={() => alert('Feature not implemented')} className="bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-900 dark:text-white" />
                            <CalculatorButton value="÷" onClick={() => dispatch({ type: 'CHOOSE_OPERATION', payload: '÷' })} className="bg-blue-500 hover:bg-blue-600 text-white" />
                            
                            <CalculatorButton value="7" onClick={() => dispatch({ type: 'ADD_DIGIT', payload: '7' })} className="bg-gray-50 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white" />
                            <CalculatorButton value="8" onClick={() => dispatch({ type: 'ADD_DIGIT', payload: '8' })} className="bg-gray-50 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white" />
                            <CalculatorButton value="9" onClick={() => dispatch({ type: 'ADD_DIGIT', payload: '9' })} className="bg-gray-50 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white" />
                            <CalculatorButton value="×" onClick={() => dispatch({ type: 'CHOOSE_OPERATION', payload: '×' })} className="bg-blue-500 hover:bg-blue-600 text-white" />

                            <CalculatorButton value="4" onClick={() => dispatch({ type: 'ADD_DIGIT', payload: '4' })} className="bg-gray-50 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white" />
                            <CalculatorButton value="5" onClick={() => dispatch({ type: 'ADD_DIGIT', payload: '5' })} className="bg-gray-50 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white" />
                            <CalculatorButton value="6" onClick={() => dispatch({ type: 'ADD_DIGIT', payload: '6' })} className="bg-gray-50 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white" />
                            <CalculatorButton value="-" onClick={() => dispatch({ type: 'CHOOSE_OPERATION', payload: '-' })} className="bg-blue-500 hover:bg-blue-600 text-white" />

                            <CalculatorButton value="1" onClick={() => dispatch({ type: 'ADD_DIGIT', payload: '1' })} className="bg-gray-50 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white" />
                            <CalculatorButton value="2" onClick={() => dispatch({ type: 'ADD_DIGIT', payload: '2' })} className="bg-gray-50 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white" />
                            <CalculatorButton value="3" onClick={() => dispatch({ type: 'ADD_DIGIT', payload: '3' })} className="bg-gray-50 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white" />
                            <CalculatorButton value="+" onClick={() => dispatch({ type: 'CHOOSE_OPERATION', payload: '+' })} className="bg-blue-500 hover:bg-blue-600 text-white" />
                            
                            <CalculatorButton value="0" onClick={() => dispatch({ type: 'ADD_DIGIT', payload: '0' })} className="bg-gray-50 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white" gridSpan={2} />
                            <CalculatorButton value="." onClick={() => dispatch({ type: 'ADD_DIGIT', payload: '.' })} className="bg-gray-50 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white" />
                            <CalculatorButton value="=" onClick={() => dispatch({ type: 'EVALUATE' })} className="bg-green-500 hover:bg-green-600 text-white" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* Health Calculators Section */}
      <section className="py-12 md:py-16 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-8">{t.homeHealthCalculatorsTitle}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                <CalculatorCard to={`/${currentLang}/age-calculator`} title={t.navCalculator} description={t.seoDescription.split('.')[0]} icon="🎂" />
                <CalculatorCard to={`/${currentLang}/Pregnancy-Due-Date-Calculator`} title={t.navPregnancyCalculator} description={t.homePregnancyCalculatorDescription} icon="🤰" />
                <CalculatorCard to={`/${currentLang}/ovulation-calculator`} title={t.navOvulationCalculator} description={t.homeOvulationCalculatorDescription} icon="🗓️" />
                <CalculatorCard to={`/${currentLang}/Menstrual-Cycle-Calculator`} title={t.navMenstrualCycleCalculator} description={t.homeMenstrualCycleCalculatorDescription} icon="🩸" />
                <CalculatorCard to={`/${currentLang}/Calorie-Calculator`} title={t.navCalorieCalculator} description={t.homeCalorieCalculatorDescription} icon="🔥" />
                <CalculatorCard to={`/${currentLang}/time-Calculator`} title={t.navTimeCalculator} description={t.homeTimeCalculatorDescription} icon="⏱️" />
                {languagesWithHoursCalculator.includes(currentLang) && t.navHoursCalculator && t.homeHoursCalculatorDescription && (
                    <CalculatorCard to={`/${currentLang}/hours-calculator`} title={t.navHoursCalculator} description={t.homeHoursCalculatorDescription} icon="🕰️" />
                )}
            </div>
        </div>
      </section>

    </main>
  );
};

export default HomePage;