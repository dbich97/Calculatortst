import React, { useState, useEffect, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import type { Translation, LanguageCode } from '../types';
import { usePageMetadata } from '../lib/hooks';
import ShareButtons from '../components/ShareButtons';
import SeoContent from '../components/SeoContent';
import HeaderAdComponent from '../components/HeaderAdComponent';
import AdComponent from '../components/AdComponent';

interface PageContext {
  t: Translation;
  currentLang: LanguageCode;
}

interface Result {
  volume: number;
  bags: number;
  sand: number;
  gravel: number;
  cementCost: number;
  sandCost: number;
  gravelCost: number;
  transportationCost: number;
  totalCost: number;
}

// Material densities (loose bulk density)
const DENSITIES = {
    cement: { metric: 1440, imperial: 2427.3 }, // kg/m³, lbs/yd³
    sand:   { metric: 1600, imperial: 2697 },   // kg/m³, lbs/yd³
    gravel: { metric: 1500, imperial: 2528.5 }  // kg/m³, lbs/yd³
};

// Standard factor for converting wet volume to required dry volume
const DRY_VOLUME_FACTOR = 1.54;

type Shape = 'slab' | 'footing' | 'column' | 'circularColumn' | 'stairs';

const ConcreteCalculatorPage: React.FC = () => {
  const { t, currentLang } = useOutletContext<PageContext>();
  usePageMetadata(t.seoConcreteTitle, t.seoConcreteDescription);

  const [formState, setFormState] = useState(() => {
    const savedState = localStorage.getItem('concreteCalculatorState');
    if (savedState) {
        try {
            return JSON.parse(savedState);
        } catch (e) {
            console.error("Failed to parse saved state", e);
        }
    }
    return {
        unitSystem: 'metric',
        shape: 'slab',
        inputs: {
            length: '', width: '', thickness: '', depth: '', height: '',
            diameter: '', steps: '', riser: '', tread: ''
        },
        wasteFactor: '10',
        bagSize: '50',
        mixRatio: '1:2:4',
        pricePerBag: '',
        pricePerSand: '',
        pricePerGravel: '',
        transportationCost: '',
        currency: 'USD'
    };
  });

  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    localStorage.setItem('concreteCalculatorState', JSON.stringify(formState));
  }, [formState]);
  
  const handleStateChange = (field: string, value: any) => {
    setFormState((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (parseFloat(value) < 0 && value !== '') return;
    handleStateChange('inputs', { ...formState.inputs, [name]: value });
  };
  
  const resetForm = () => {
    localStorage.removeItem('concreteCalculatorState');
    setFormState({
        unitSystem: 'metric',
        shape: 'slab',
        inputs: { length: '', width: '', thickness: '', depth: '', height: '', diameter: '', steps: '', riser: '', tread: '' },
        wasteFactor: '10',
        bagSize: '50',
        mixRatio: '1:2:4',
        pricePerBag: '', pricePerSand: '', pricePerGravel: '', transportationCost: '', currency: 'USD'
    });
    setResult(null);
    setError('');
  };

  useEffect(() => {
    const newBagSize = formState.unitSystem === 'metric' ? '50' : '94';
    handleStateChange('bagSize', newBagSize);
  }, [formState.unitSystem]);

  const calculateVolume = (): number | null => {
    const parse = (val: string) => parseFloat(val) || 0;
    const { length, width, thickness, depth, height, diameter, steps, riser, tread } = formState.inputs;
    let vol = 0;

    let len = parse(length), wid = parse(width), thick = parse(thickness), dep = parse(depth), hgt = parse(height), dia = parse(diameter);
    let stp = parse(steps), ris = parse(riser), trd = parse(tread);
    
    // Normalize units for calculation
    const isMetric = formState.unitSystem === 'metric';
    const lenUnitFactor = isMetric ? 1 : (1 / 3); // m or ft -> yd
    const smallUnitFactor = isMetric ? (1 / 100) : (1 / 36); // cm/in -> m/yd
    
    len *= lenUnitFactor; wid *= lenUnitFactor; dep *= lenUnitFactor; hgt *= lenUnitFactor;
    thick *= smallUnitFactor; dia *= smallUnitFactor; ris *= smallUnitFactor; trd *= smallUnitFactor;

    switch(formState.shape as Shape) {
      case 'slab': vol = len * wid * thick; break;
      case 'footing': vol = len * wid * dep; break;
      case 'column': vol = len * wid * hgt; break;
      case 'circularColumn': vol = Math.PI * Math.pow(dia / 2, 2) * hgt; break;
      case 'stairs': vol = 0.5 * (stp * trd) * (stp * ris) * wid; break;
    }

    if (isNaN(vol) || vol <= 0 || !isFinite(vol)) {
      setError(t.errorPositiveNumbers || 'Please enter valid, positive numbers for all dimensions.');
      return null;
    }
    return vol;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const baseVolume = calculateVolume();

    if (baseVolume === null) {
        setResult(null);
        return;
    };
    
    const waste = (parseFloat(formState.wasteFactor) || 0) / 100;
    const totalVolume = baseVolume * (1 + waste);
    
    const ratioParts = formState.mixRatio.split(':').map(Number);
    const totalRatioParts = ratioParts.reduce((a: number, b: number) => a + b, 0);

    const totalDryVolume = totalVolume * DRY_VOLUME_FACTOR;
    const cementVolume = totalDryVolume * (ratioParts[0] / totalRatioParts);
    const sandVolume = totalDryVolume * (ratioParts[1] / totalRatioParts);
    const gravelVolume = totalDryVolume * (ratioParts[2] / totalRatioParts);
    
    const cementWeight = cementVolume * DENSITIES.cement[formState.unitSystem];
    const sandWeight = sandVolume * DENSITIES.sand[formState.unitSystem];
    const gravelWeight = gravelVolume * DENSITIES.gravel[formState.unitSystem];

    const bag = parseFloat(formState.bagSize) || (formState.unitSystem === 'metric' ? 50 : 94);
    const cementBags = Math.ceil(cementWeight / bag);
    
    const pBag = parseFloat(formState.pricePerBag) || 0;
    const pSand = parseFloat(formState.pricePerSand) || 0;
    const pGravel = parseFloat(formState.pricePerGravel) || 0;
    const transCost = parseFloat(formState.transportationCost) || 0;
    
    const sandUnits = formState.unitSystem === 'metric' ? sandWeight / 1000 : sandWeight / 2000; // to tonnes or tons
    const gravelUnits = formState.unitSystem === 'metric' ? gravelWeight / 1000 : gravelWeight / 2000;

    const cementCost = cementBags * pBag;
    const sandCost = sandUnits * pSand;
    const gravelCost = gravelUnits * pGravel;
    const totalCost = cementCost + sandCost + gravelCost + transCost;

    setResult({ 
        volume: totalVolume, 
        bags: cementBags, 
        sand: sandWeight, 
        gravel: gravelWeight, 
        cementCost, 
        sandCost, 
        gravelCost, 
        transportationCost: transCost,
        totalCost 
    });
  };

  const inputClasses = "block w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-900 dark:text-white";
  const labelClasses = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2";

  const renderInputs = () => {
    const { inputs } = formState;
    const lenUnit = formState.unitSystem === 'metric' ? 'm' : 'ft';
    const smallUnit = formState.unitSystem === 'metric' ? 'cm' : 'in';
    
    switch(formState.shape as Shape) {
      case 'slab': return <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div><label htmlFor="length" className={labelClasses}>{t.lengthLabel} ({lenUnit})</label><input id="length" name="length" type="number" value={inputs.length} onChange={handleInputChange} className={inputClasses} required /></div>
        <div><label htmlFor="width" className={labelClasses}>{t.widthLabel} ({lenUnit})</label><input id="width" name="width" type="number" value={inputs.width} onChange={handleInputChange} className={inputClasses} required /></div>
        <div><label htmlFor="thickness" className={labelClasses}>{t.thicknessLabel} ({smallUnit})</label><input id="thickness" name="thickness" type="number" value={inputs.thickness} onChange={handleInputChange} className={inputClasses} required /></div>
      </div>
      case 'footing': return <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div><label htmlFor="length" className={labelClasses}>{t.lengthLabel} ({lenUnit})</label><input id="length" name="length" type="number" value={inputs.length} onChange={handleInputChange} className={inputClasses} required /></div>
        <div><label htmlFor="width" className={labelClasses}>{t.widthLabel} ({lenUnit})</label><input id="width" name="width" type="number" value={inputs.width} onChange={handleInputChange} className={inputClasses} required /></div>
        <div><label htmlFor="depth" className={labelClasses}>{t.depthLabel} ({lenUnit})</label><input id="depth" name="depth" type="number" value={inputs.depth} onChange={handleInputChange} className={inputClasses} required /></div>
      </div>
      case 'column': return <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div><label htmlFor="length" className={labelClasses}>{t.lengthLabel} ({lenUnit})</label><input id="length" name="length" type="number" value={inputs.length} onChange={handleInputChange} className={inputClasses} required /></div>
        <div><label htmlFor="width" className={labelClasses}>{t.widthLabel} ({lenUnit})</label><input id="width" name="width" type="number" value={inputs.width} onChange={handleInputChange} className={inputClasses} required /></div>
        <div><label htmlFor="height" className={labelClasses}>{t.heightLabel} ({lenUnit})</label><input id="height" name="height" type="number" value={inputs.height} onChange={handleInputChange} className={inputClasses} required /></div>
      </div>
      case 'circularColumn': return <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label htmlFor="diameter" className={labelClasses}>{t.diameterLabel} ({smallUnit})</label><input id="diameter" name="diameter" type="number" value={inputs.diameter} onChange={handleInputChange} className={inputClasses} required /></div>
        <div><label htmlFor="height" className={labelClasses}>{t.heightLabel} ({lenUnit})</label><input id="height" name="height" type="number" value={inputs.height} onChange={handleInputChange} className={inputClasses} required /></div>
      </div>
      case 'stairs': return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div><label htmlFor="steps" className={labelClasses}>{t.stepsLabel}</label><input id="steps" name="steps" type="number" value={inputs.steps} onChange={handleInputChange} className={inputClasses} required /></div>
        <div><label htmlFor="tread" className={labelClasses}>{t.treadLabel} ({smallUnit})</label><input id="tread" name="tread" type="number" value={inputs.tread} onChange={handleInputChange} className={inputClasses} required /></div>
        <div><label htmlFor="riser" className={labelClasses}>{t.riserLabel} ({smallUnit})</label><input id="riser" name="riser" type="number" value={inputs.riser} onChange={handleInputChange} className={inputClasses} required /></div>
        <div><label htmlFor="width" className={labelClasses}>{t.widthLabel} ({lenUnit})</label><input id="width" name="width" type="number" value={inputs.width} onChange={handleInputChange} className={inputClasses} required /></div>
      </div>
      default: return null;
    }
  };

  const Tooltip: React.FC<{ text: string }> = ({ text }) => (
    <span className="relative group">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 inline-block text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      <span className="absolute bottom-full mb-2 w-48 p-2 text-xs text-white bg-black rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">{text}</span>
    </span>
  );

  const ResultCard: React.FC<{label: string, value: string}> = ({label, value}) => (
    <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg text-center">
        <span className="block text-sm font-medium text-gray-600 dark:text-gray-400">{label}</span>
        <span className="block text-xl font-bold text-gray-800 dark:text-white">{value}</span>
    </div>
  );
  
  const shapeOptions = useMemo(() => [{ key: 'slab', label: 'slab' }, { key: 'footing', label: 'footing' }, { key: 'column', label: 'column' }, { key: 'circularColumn', label: 'circularColumn' }, { key: 'stairs', label: 'stairs' }] as const, []);
  const mixRatioOptions = useMemo(() => [{ key: '1:1.5:3', label: 'mixRatio_1_1_5_3' }, { key: '1:2:4', label: 'mixRatio_1_2_4' }, { key: '1:3:6', label: 'mixRatio_1_3_6' }] as const, []);

  const currencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'INR'];
  
  const weightUnit = formState.unitSystem === 'metric' ? t.kg : t.lbs;
  const bulkWeightUnit = formState.unitSystem === 'metric' ? 'tonne' : 'ton';
  
  const currencySymbol = useMemo(() => {
    try {
        return (0).toLocaleString(undefined, { style: 'currency', currency: formState.currency, minimumFractionDigits: 0 }).replace(/[0-9]/g, '').trim();
    } catch(e) {
        return '$';
    }
  }, [formState.currency]);

  return (
    <>
      <HeaderAdComponent />
      <main className="w-full max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 md:p-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-2 text-center">{t.concreteTitle}</h1>
          <p className="text-md md:text-lg text-gray-500 dark:text-gray-400 mb-8 text-center">{t.concreteSubheading}</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                <div>
                    <label className={labelClasses}>{t.unitSystemLabel}</label>
                    <div className="flex space-x-2 rtl:space-x-reverse rounded-md bg-gray-100 dark:bg-gray-900 p-1">
                        <button type="button" onClick={() => handleStateChange('unitSystem', 'metric')} className={`w-full py-2 font-medium rounded-md ${formState.unitSystem === 'metric' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>{t.metric}</button>
                        <button type="button" onClick={() => handleStateChange('unitSystem', 'imperial')} className={`w-full py-2 font-medium rounded-md ${formState.unitSystem === 'imperial' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>{t.imperial}</button>
                    </div>
                </div>
                <div>
                    <label htmlFor="shape" className={labelClasses}>{t.shapeLabel}</label>
                    <select id="shape" value={formState.shape} onChange={(e) => handleStateChange('shape', e.target.value)} className={inputClasses}>
                        {shapeOptions.map(opt => <option key={opt.key} value={opt.key}>{t[opt.label]}</option>)}
                    </select>
                </div>
            </div>
            
            <div className="flex flex-col lg:flex-row gap-6 items-center">
                <div className="w-full lg:w-2/3">
                    {renderInputs()}
                </div>
                <div className="w-full lg:w-1/3">
                    {/* SVG diagram would go here */}
                </div>
            </div>
            
            <div className="pt-6 border-t border-gray-200 dark:border-gray-700 space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label htmlFor="waste" className={labelClasses}>{t.wasteFactorLabel}<Tooltip text={t.wasteFactorTooltip || ''} /></label>
                        <input id="waste" type="number" value={formState.wasteFactor} onChange={e => handleStateChange('wasteFactor', e.target.value)} className={inputClasses} min="0" />
                    </div>
                    <div>
                        <label htmlFor="bag-size" className={labelClasses}>{t.bagSizeLabel} ({weightUnit})</label>
                        <input id="bag-size" type="number" value={formState.bagSize} onChange={e => handleStateChange('bagSize', e.target.value)} className={inputClasses} min="0" />
                    </div>
                     <div>
                        <label htmlFor="mixRatio" className={labelClasses}>{t.mixRatioLabel}<Tooltip text={t.mixRatioTooltip || ''} /></label>
                        <select id="mixRatio" value={formState.mixRatio} onChange={(e) => handleStateChange('mixRatio', e.target.value)} className={inputClasses}>
                           {mixRatioOptions.map(opt => <option key={opt.key} value={opt.key}>{t[opt.label]}</option>)}
                        </select>
                    </div>
                </div>
            </div>
            
            <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-semibold text-center mb-4">{t.costBreakdownTitle}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                    <div>
                        <label htmlFor="currency" className={labelClasses}>{t.currencyLabel}</label>
                        <select id="currency" value={formState.currency} onChange={e => handleStateChange('currency', e.target.value)} className={inputClasses}>
                            {currencies.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                     <div>
                         <label htmlFor="pricePerBag" className={labelClasses}>{t.pricePerBagLabel}</label>
                         <input id="pricePerBag" type="number" value={formState.pricePerBag} onChange={e => handleStateChange('pricePerBag', e.target.value)} className={inputClasses} min="0" placeholder="0.00" />
                    </div>
                     <div>
                         <label htmlFor="pricePerSand" className={labelClasses}>{t.pricePerSandLabel?.replace('{unit}', bulkWeightUnit)}</label>
                         <input id="pricePerSand" type="number" value={formState.pricePerSand} onChange={e => handleStateChange('pricePerSand', e.target.value)} className={inputClasses} min="0" placeholder="0.00" />
                    </div>
                     <div>
                         <label htmlFor="pricePerGravel" className={labelClasses}>{t.pricePerGravelLabel?.replace('{unit}', bulkWeightUnit)}</label>
                         <input id="pricePerGravel" type="number" value={formState.pricePerGravel} onChange={e => handleStateChange('pricePerGravel', e.target.value)} className={inputClasses} min="0" placeholder="0.00" />
                    </div>
                </div>
                <div className="mt-4">
                    <label htmlFor="transportationCost" className={labelClasses}>{t.transportationCostLabel}</label>
                    <input id="transportationCost" type="number" value={formState.transportationCost} onChange={e => handleStateChange('transportationCost', e.target.value)} className={inputClasses} min="0" placeholder="0.00" />
                </div>
            </div>

            {error && <p className="text-center text-red-500 mt-4">{error}</p>}
             
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button type="submit" className="w-full sm:flex-1 flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 transition transform hover:scale-105 duration-300 ease-in-out">
                    {t.calculateConcreteButton}
                </button>
                <button type="button" onClick={resetForm} className="w-full sm:w-auto flex justify-center py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg text-lg font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    {t.concreteResetButton}
                </button>
            </div>
          </form>

          {result && (
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 text-center" id="print-section">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">{t.resultsTitle}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                 <ResultCard label={t.concreteWithWasteResult || ''} value={`${result.volume.toFixed(2)} ${formState.unitSystem === 'metric' ? 'm³' : 'yd³'}`} />
                 <ResultCard label={t.cementBagsResult || ''} value={`~${result.bags.toLocaleString()} ${t.bagsUnit}`} />
                 <ResultCard label={t.sandRequiredResult || ''} value={`~${result.sand.toLocaleString(undefined, {maximumFractionDigits: 0})} ${weightUnit}`} />
                 <ResultCard label={t.gravelRequiredResult || ''} value={`~${result.gravel.toLocaleString(undefined, {maximumFractionDigits: 0})} ${weightUnit}`} />
              </div>

              {result.totalCost > 0 && (
                <div className="mt-6 pt-4 border-t border-gray-300 dark:border-gray-600">
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">{t.costBreakdownTitle}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                        <ResultCard label={t.cementCostResult || ''} value={`${currencySymbol}${result.cementCost.toFixed(2)}`} />
                        <ResultCard label={t.sandCostResult || ''} value={`${currencySymbol}${result.sandCost.toFixed(2)}`} />
                        <ResultCard label={t.gravelCostResult || ''} value={`${currencySymbol}${result.gravelCost.toFixed(2)}`} />
                        <ResultCard label={t.transportationCostResult || ''} value={`${currencySymbol}${result.transportationCost.toFixed(2)}`} />
                        <ResultCard label={t.totalCostResult || ''} value={`${currencySymbol}${result.totalCost.toFixed(2)}`} />
                    </div>
                </div>
              )}
               <div className="text-center mt-6 no-print">
                  <button onClick={() => window.print()} className="w-full sm:w-auto px-6 py-3 border border-transparent rounded-lg shadow-lg text-lg font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-gray-800">
                      {t.printResultsButton}
                  </button>
              </div>
            </div>
          )}
        </div>
        
        <AdComponent />
        <ShareButtons url={window.location.href} title={t.seoConcreteTitle || ''} t={t} />
      </main>
      {t.seoConcreteSections && <SeoContent sections={t.seoConcreteSections} lang={currentLang} />}
       <style>{`
          @media print {
              body * { visibility: hidden; }
              #print-section, #print-section * { visibility: visible; }
              #print-section { position: absolute; left: 0; top: 0; width: 100%; padding: 1rem; }
              .no-print { display: none !important; }
              #print-section h2, #print-section h3 { font-size: 1.25rem; }
              #print-section .grid { display: grid !important; gap: 0.5rem; }
          }
      `}</style>
    </>
  );
};

export default ConcreteCalculatorPage;