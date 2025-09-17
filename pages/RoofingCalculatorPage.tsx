import React, { useState, useEffect, useRef } from 'react';
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
  baseArea: number;
  totalArea: number;
  wasteAmount: number;
  materials: number;
  originalMaterials: number;
  totalCost: number;
}

const RoofingCalculatorPage: React.FC = () => {
  const { t, currentLang } = useOutletContext<PageContext>();
  usePageMetadata(t.seoRoofingTitle, t.seoRoofingDescription);

  const [unitSystem, setUnitSystem] = useState<'metric' | 'imperial'>('metric');
  const [calcMethod, setCalcMethod] = useState<'dimensions' | 'area'>('dimensions');

  const [totalAreaInput, setTotalAreaInput] = useState('');
  const [length, setLength] = useState('10');
  const [width, setWidth] = useState('5');
  const [pitchType, setPitchType] = useState<'ratio' | 'degrees'>('ratio');
  const [pitchInput, setPitchInput] = useState('4:12');
  const [wasteFactor, setWasteFactor] = useState('10');
  const [materialType, setMaterialType] = useState('shingles');
  const [pricePerUnit, setPricePerUnit] = useState('');
  const [roundUp, setRoundUp] = useState(false);

  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState('');
  
  const isInitialMount = useRef(true);

  const MATERIAL_PRICES: Record<string, Record<string, number>> = {
    shingles: { metric: 15, imperial: 140 },
    epdm: { metric: 20, imperial: 190 },
    roofTiles: { metric: 30, imperial: 280 },
    metal: { metric: 25, imperial: 235 },
    custom: { metric: 0, imperial: 0 }
  };

  useEffect(() => {
    if (materialType !== 'custom') {
        const price = MATERIAL_PRICES[materialType][unitSystem];
        setPricePerUnit(String(price));
    } else {
        setPricePerUnit(''); // Clear for custom input
    }
  }, [materialType, unitSystem]);

  useEffect(() => {
    if (isInitialMount.current) {
        isInitialMount.current = false;
        return;
    }
    
    const convertValue = (value: string, factor: number): string => {
        if (!value) return '';
        const numValue = parseFloat(value);
        if (isNaN(numValue)) return '';
        const result = numValue * factor;
        return Math.abs(result - Math.round(result)) < 0.001 ? String(Math.round(result)) : result.toFixed(2);
    };

    const toMetricFactorLinear = 1 / 3.28084;
    const toMetricFactorArea = 1 / 10.7639;
    const toImperialFactorLinear = 3.28084;
    const toImperialFactorArea = 10.7639;

    if (unitSystem === 'metric') { // Imperial -> Metric
        setLength(prev => convertValue(prev, toMetricFactorLinear));
        setWidth(prev => convertValue(prev, toMetricFactorLinear));
        setTotalAreaInput(prev => convertValue(prev, toMetricFactorArea));
    } else { // Metric -> Imperial
        setLength(prev => convertValue(prev, toImperialFactorLinear));
        setWidth(prev => convertValue(prev, toImperialFactorLinear));
        setTotalAreaInput(prev => convertValue(prev, toImperialFactorArea));
    }
    
    setResult(null);
    setError('');

  }, [unitSystem]);


  const handleCalculate = () => {
    setError('');
    setResult(null);

    let baseArea = 0;
    const waste = (parseFloat(wasteFactor) || 0) / 100;
    const price = parseFloat(pricePerUnit) || 0;


    if (calcMethod === 'area') {
      const area = parseFloat(totalAreaInput);
      if (isNaN(area) || area <= 0) {
        setError(t.errorNumber || 'Please enter a valid area.');
        return;
      }
      baseArea = area;
    } else {
      const len = parseFloat(length);
      const wid = parseFloat(width);
      if (isNaN(len) || isNaN(wid) || len <= 0 || wid <= 0) {
        setError(t.errorNumber || 'Please enter valid dimensions.');
        return;
      }
      const groundArea = len * wid;
      
      let multiplier = 1; // Default for flat roof
      const pitchVal = pitchInput.trim();

      if (pitchVal !== '' && pitchVal !== '0') {
          if (pitchType === 'degrees') {
              const degrees = parseFloat(pitchVal);
              if (isNaN(degrees) || degrees < 0 || degrees >= 90) {
                  setError(t.errorInvalidPitch || 'Invalid pitch degrees.');
                  return;
              }
              if (degrees > 0) {
                  multiplier = 1 / Math.cos(degrees * Math.PI / 180);
              }
          } else { // ratio
              const parts = pitchVal.split(':').map(Number);
              if (parts.length !== 2 || isNaN(parts[0]) || isNaN(parts[1]) || parts[1] <= 0 || parts[0] < 0) {
                  setError(t.errorInvalidPitch || 'Invalid pitch ratio.');
                  return;
              }
              const [rise, run] = parts;
              if (rise > 0) {
                  multiplier = Math.sqrt(rise * rise + run * run) / run;
              }
          }
      }
      baseArea = groundArea * multiplier;
    }

    const totalAreaWithWaste = baseArea * (1 + waste);
    const wasteAmount = totalAreaWithWaste - baseArea;
    const materials = unitSystem === 'metric' ? totalAreaWithWaste : totalAreaWithWaste / 100; // 1 square = 100 sq ft
    
    let finalMaterials = materials;
    if (roundUp) {
        finalMaterials = Math.ceil(materials);
    }

    const totalCost = finalMaterials * price;

    setResult({
      baseArea,
      totalArea: totalAreaWithWaste,
      wasteAmount,
      materials: finalMaterials,
      originalMaterials: materials,
      totalCost,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleCalculate();
  };
  
  const ResultCard: React.FC<{icon: React.ReactNode, label: string, value: string, subValue?: string, valueClass?: string}> = ({icon, label, value, subValue, valueClass = ''}) => (
      <div className="flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg text-center h-full">
          <div className="text-3xl mb-2 text-blue-500 dark:text-blue-400">{icon}</div>
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{label}</span>
          <span className={`text-2xl font-bold text-gray-800 dark:text-white ${valueClass}`}>{value}</span>
          {subValue && <span className="text-xs text-gray-500 dark:text-gray-400">{subValue}</span>}
      </div>
  );

  const inputClasses = "block w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-900 dark:text-white";
  const labelClasses = "block text-lg font-medium text-gray-700 dark:text-gray-300 mb-2";

  return (
    <>
      <HeaderAdComponent />
      <main className="w-full max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 md:p-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-2 text-center">{t.roofingTitle}</h1>
          <p className="text-md md:text-lg text-gray-500 dark:text-gray-400 mb-8 text-center">{t.roofingSubheading}</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className={labelClasses}>{t.unitSystemLabel}</label>
              <div className="flex space-x-2 rtl:space-x-reverse rounded-md bg-gray-100 dark:bg-gray-900 p-1">
                <button type="button" onClick={() => setUnitSystem('metric')} className={`w-full py-2 font-medium rounded-md ${unitSystem === 'metric' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>{t.metric}</button>
                <button type="button" onClick={() => setUnitSystem('imperial')} className={`w-full py-2 font-medium rounded-md ${unitSystem === 'imperial' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>{t.imperial}</button>
              </div>
            </div>

            <div>
              <label className={labelClasses}>{t.calculationMethodLabel}</label>
              <div className="flex space-x-2 rtl:space-x-reverse rounded-md bg-gray-100 dark:bg-gray-900 p-1">
                <button type="button" onClick={() => setCalcMethod('dimensions')} className={`w-full py-2 font-medium rounded-md ${calcMethod === 'dimensions' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>{t.groundDimensionsMethod}</button>
                <button type="button" onClick={() => setCalcMethod('area')} className={`w-full py-2 font-medium rounded-md ${calcMethod === 'area' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>{t.totalAreaMethod}</button>
              </div>
            </div>

            {calcMethod === 'area' ? (
              <div>
                <label htmlFor="total-area" className={labelClasses}>{t.totalAreaLabel} ({unitSystem === 'metric' ? t.sqmUnit : t.sqftUnit})</label>
                <input id="total-area" type="number" value={totalAreaInput} onChange={e => setTotalAreaInput(e.target.value)} className={inputClasses} required />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="length" className={labelClasses}>{t.buildingLengthLabel} ({unitSystem === 'metric' ? 'm' : 'ft'})</label>
                    <input id="length" type="number" value={length} onChange={e => setLength(e.target.value)} className={inputClasses} required />
                  </div>
                  <div>
                    <label htmlFor="width" className={labelClasses}>{t.buildingWidthLabel} ({unitSystem === 'metric' ? 'm' : 'ft'})</label>
                    <input id="width" type="number" value={width} onChange={e => setWidth(e.target.value)} className={inputClasses} required />
                  </div>
                </div>
                <div>
                    <label className={labelClasses}>{t.roofPitchLabel}</label>
                    <div className="flex items-center gap-2">
                         <div className="flex-grow">
                             <input id="pitch" type="text" value={pitchInput} onChange={e => setPitchInput(e.target.value)} className={inputClasses} placeholder={pitchType === 'ratio' ? t.roofingPitchRatioPlaceholder : t.roofingPitchDegreesPlaceholder} required />
                         </div>
                         <div className="flex-shrink-0 flex rounded-md bg-gray-100 dark:bg-gray-900 p-1">
                            <button type="button" onClick={() => setPitchType('ratio')} className={`px-3 py-2 text-sm font-medium rounded-md ${pitchType === 'ratio' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>{t.pitchRatio}</button>
                            <button type="button" onClick={() => setPitchType('degrees')} className={`px-3 py-2 text-sm font-medium rounded-md ${pitchType === 'degrees' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>{t.pitchDegrees}</button>
                         </div>
                    </div>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="waste" className={labelClasses}>{t.wasteFactorLabel}</label>
                    <input id="waste" type="number" value={wasteFactor} onChange={e => setWasteFactor(e.target.value)} className={inputClasses} min="0" />
                </div>
                 <div>
                    <label htmlFor="material-type" className={labelClasses}>{t.materialTypeLabel}</label>
                    <select id="material-type" value={materialType} onChange={e => setMaterialType(e.target.value)} className={inputClasses}>
                        <option value="shingles">{t.shingles}</option>
                        <option value="epdm">{t.epdm}</option>
                        <option value="roofTiles">{t.roofTiles}</option>
                        <option value="metal">{t.metal}</option>
                        <option value="custom">{t.customPrice}</option>
                    </select>
                </div>
            </div>
             <div>
                <label htmlFor="price" className={labelClasses}>{t.pricePerUnitLabel} ({unitSystem === 'metric' ? `€/${t.sqmUnit}` : `$/${t.squaresUnit}`})</label>
                <input id="price" type="number" value={pricePerUnit} onChange={e => setPricePerUnit(e.target.value)} className={inputClasses} min="0" placeholder={t.customPrice} readOnly={materialType !== 'custom'} />
            </div>
            
            <div className="flex items-center">
              <input id="roundUp" type="checkbox" checked={roundUp} onChange={e => setRoundUp(e.target.checked)} className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
              <label htmlFor="roundUp" className="ml-2 rtl:mr-2 block text-sm text-gray-900 dark:text-gray-300">{t.roundUpLabel}</label>
            </div>


            {error && <p className="text-center text-red-500">{error}</p>}

            <div>
              <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 transition transform hover:scale-105 duration-300 ease-in-out">
                {t.calculateRoofingButton}
              </button>
            </div>
          </form>

          {result && (
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 text-center">
              <div id="print-section">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">{t.resultsTitle}</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <ResultCard 
                    icon={<span>📐</span>}
                    label={t.baseRoofAreaResult || ''}
                    value={`${result.baseArea.toFixed(2)} ${unitSystem === 'metric' ? t.sqmUnit : t.sqftUnit}`}
                  />
                  <ResultCard 
                    icon={<span>➕</span>}
                    label={t.wasteAmountResult || ''}
                    value={`${result.wasteAmount.toFixed(2)} ${unitSystem === 'metric' ? t.sqmUnit : t.sqftUnit}`}
                  />
                  <ResultCard 
                    icon={<span>📦</span>}
                    label={t.materialsNeededResult || ''}
                    value={`${result.materials.toFixed(2)} ${unitSystem === 'metric' ? t.sqmUnit : t.squaresUnit}`}
                    subValue={roundUp && result.materials !== result.originalMaterials ? `(was ${result.originalMaterials.toFixed(2)})` : undefined}
                  />
                  <ResultCard 
                    icon={<span>💶</span>}
                    label={t.totalCostResult || ''}
                    value={result.totalCost > 0 ? (unitSystem === 'metric' ? '€' : '$') + result.totalCost.toFixed(2) : '-'}
                    valueClass={result.totalCost > 0 ? "text-green-600 dark:text-green-400" : ""}
                  />
                </div>
              </div>
               <div className="text-center mt-6">
                  <button onClick={() => window.print()} className="no-print w-full sm:w-auto px-6 py-3 border border-transparent rounded-lg shadow-lg text-lg font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-gray-800">
                      {t.printResults}
                  </button>
              </div>
            </div>
          )}
        </div>
        
        <AdComponent />
        <ShareButtons url={window.location.href} title={t.seoRoofingTitle || ''} t={t} />
      </main>
      {t.seoRoofingSections && <SeoContent sections={t.seoRoofingSections} lang={currentLang} />}
       <style>{`
          @media print {
              body * { visibility: hidden; }
              #print-section, #print-section * { visibility: visible; }
              #print-section { position: absolute; left: 0; top: 0; width: 100%; padding: 2rem; }
              .no-print { display: none !important; }
              #print-section h2 { font-size: 1.5rem; }
              #print-section .grid { display: grid !important; }
          }
      `}</style>
    </>
  );
};

export default RoofingCalculatorPage;