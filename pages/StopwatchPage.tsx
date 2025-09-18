import React, { useState, useRef, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import type { Translation, LanguageCode } from '../types';
import { usePageMetadata } from '../lib/hooks';
import ShareButtons from '../components/ShareButtons';
import HeaderAdComponent from '../components/HeaderAdComponent';
import AdComponent from '../components/AdComponent';
import SeoContent from '../components/SeoContent';

interface PageContext {
  t: Translation;
  currentLang: LanguageCode;
}

const StopwatchPage: React.FC = () => {
  const { t, currentLang } = useOutletContext<PageContext>();
  usePageMetadata(t.seoStopwatchTitle, t.seoStopwatchDescription);

  const [time, setTime] = useState(0); // in milliseconds
  const [isRunning, setIsRunning] = useState(false);
  const [laps, setLaps] = useState<number[]>([]);
  // FIX: Changed NodeJS.Timeout to number, as setInterval in the browser returns a number, not a Timeout object.
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (isRunning) {
      const startTime = Date.now() - time;
      // FIX: Use window.setInterval to ensure the browser's implementation is used, which returns a number. This resolves the TypeScript error where setInterval was inferred as returning a NodeJS.Timeout object.
      timerRef.current = window.setInterval(() => {
        setTime(Date.now() - startTime);
      }, 10); // Update every 10ms for centiseconds
    } else {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }
    }
    
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [isRunning]);

  const handleStartStop = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTime(0);
    setLaps([]);
  };

  const handleLap = () => {
    if (isRunning) {
      setLaps(prevLaps => [...prevLaps, time]);
    }
  };

  const formatTime = (timeInMilliseconds: number) => {
    const minutes = Math.floor(timeInMilliseconds / 60000).toString().padStart(2, '0');
    const seconds = Math.floor((timeInMilliseconds / 1000) % 60).toString().padStart(2, '0');
    const centiseconds = Math.floor((timeInMilliseconds / 10) % 100).toString().padStart(2, '0');
    return `${minutes}:${seconds}.${centiseconds}`;
  };

  const buttonClasses = "w-full min-w-[100px] text-lg font-semibold py-3 px-4 rounded-full transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100";
  const controlButtonClasses = "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 focus:ring-gray-400";
  
  return (
    <>
      <HeaderAdComponent />
      <main className="w-full max-w-md mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 md:p-10 flex flex-col items-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-2 text-center">{t.stopwatchTitle || 'Stopwatch'}</h1>
          <p className="text-md md:text-lg text-gray-500 dark:text-gray-400 mb-8 text-center">{t.stopwatchSubheading || 'Measure elapsed time with precision.'}</p>
          
          <div className="font-mono text-6xl md:text-8xl tracking-tight text-gray-900 dark:text-white my-8 p-4 bg-gray-100 dark:bg-gray-900 rounded-lg w-full text-center">
            {formatTime(time)}
          </div>

          <div className="grid grid-cols-2 gap-4 w-full mb-8">
             <button 
              onClick={isRunning ? handleLap : handleReset}
              disabled={!isRunning && time === 0}
              className={`${buttonClasses} ${controlButtonClasses}`}>
              {isRunning ? (t.lapButton || 'Lap') : (t.resetButton || 'Reset')}
            </button>
             <button 
              onClick={handleStartStop} 
              className={`${buttonClasses} ${isRunning ? 'bg-red-500 hover:bg-red-600 focus:ring-red-400 text-white' : 'bg-green-500 hover:bg-green-600 focus:ring-green-400 text-white'}`}>
              {isRunning ? (t.stopButton || 'Stop') : (t.startButton || 'Start')}
            </button>
          </div>
          
          {laps.length > 0 && (
            <div className="w-full border-t border-gray-200 dark:border-gray-700 pt-6">
              <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
                {laps.slice().reverse().map((lapTime, index) => {
                  const reversedIndex = laps.length - 1 - index;
                  const previousLapTime = reversedIndex > 0 ? laps[reversedIndex - 1] : 0;
                  const lapDuration = lapTime - previousLapTime;
                  return (
                    <div key={laps.length - index} className="flex justify-between items-center font-mono text-lg p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <span className="text-gray-600 dark:text-gray-400">{(t.lapColumnHeader || 'Lap')} {laps.length - index}</span>
                      <span className="font-semibold text-gray-800 dark:text-white">{formatTime(lapDuration)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
        
        <AdComponent />
        
        <ShareButtons url={window.location.href} title={t.seoStopwatchTitle || ''} t={t} />
      </main>
      {t.seoStopwatchSections && <SeoContent sections={t.seoStopwatchSections} lang={currentLang} />}
    </>
  );
};

export default StopwatchPage;