import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { GoogleGenAI, Type } from "@google/genai";
import type { Translation, LanguageCode } from '../types';
import SeoContent from '../components/SeoContent';
import ProgressBar from '../components/ProgressBar';
import { usePageMetadata } from '../lib/hooks';

interface PageContext {
  t: Translation;
  currentLang: LanguageCode;
}

type UnitSystem = 'metric' | 'imperial';
type Gender = 'male' | 'female';
type ActivityLevel = 'sedentary' | 'lightlyActive' | 'moderatelyActive' | 'veryActive' | 'extraActive';
type Goal = 'maintainWeight' | 'mildWeightLoss' | 'weightLoss' | 'extremeWeightLoss' | 'mildWeightGain' | 'weightGain' | 'fastWeightGain';
type MacroPlan = 'balanced' | 'lowCarb' | 'highProtein';

interface CalorieResult {
  bmr: number;
  maintenance: number;
  goalCalories: number;
}
interface MacroResult {
  protein: number;
  carbs: number;
  fat: number;
}
interface MealPlan {
    breakfast: string[];
    lunch: string[];
    dinner: string[];
    snacks: string[];
}

const TOTAL_STEPS = 8;

const CalorieCalculatorPage: React.FC = () => {
    const { t, currentLang } = useOutletContext<PageContext>();
    usePageMetadata(t.seoCalorieTitle, t.seoCalorieDescription);

    const [step, setStep] = useState(1);
    const [unitSystem, setUnitSystem] = useState<UnitSystem>('metric');
    const [gender, setGender] = useState<Gender>('male');
    const [age, setAge] = useState<string>('25');
    const [weightKg, setWeightKg] = useState<string>('70');
    const [weightLbs, setWeightLbs] = useState<string>('155');
    const [heightCm, setHeightCm] = useState<string>('175');
    const [heightFt, setHeightFt] = useState<string>('5');
    const [heightIn, setHeightIn] = useState<string>('9');
    const [activityLevel, setActivityLevel] = useState<ActivityLevel>('lightlyActive');
    const [goal, setGoal] = useState<Goal>('maintainWeight');
    const [macroPlan, setMacroPlan] = useState<MacroPlan>('balanced');
    
    const [calorieResult, setCalorieResult] = useState<CalorieResult | null>(null);
    const [macroResult, setMacroResult] = useState<MacroResult | null>(null);
    const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
    const [isMealPlanLoading, setIsMealPlanLoading] = useState(false);
    const [mealPlanError, setMealPlanError] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});

    const resetForm = () => {
        setStep(1);
        setUnitSystem('metric');
        setGender('male');
        setAge('25');
        setWeightKg('70');
        setWeightLbs('155');
        setHeightCm('175');
        setHeightFt('5');
        setHeightIn('9');
        setActivityLevel('lightlyActive');
        setGoal('maintainWeight');
        setMacroPlan('balanced');
        setCalorieResult(null);
        setMacroResult(null);
        setMealPlan(null);
        setIsMealPlanLoading(false);
        setMealPlanError('');
        setErrors({});
    };

    useEffect(resetForm, [t, currentLang]);

    const validateStep1 = (): boolean => {
        const newErrors: Record<string, string> = {};
        const ageNum = parseInt(age);
        if (isNaN(ageNum) || ageNum < 15 || ageNum > 80) newErrors.age = t.errorAge;

        if (unitSystem === 'metric') {
            const weightNum = parseFloat(weightKg);
            if (isNaN(weightNum) || weightNum < 20) newErrors.weight = t.errorWeight;
            const heightNum = parseFloat(heightCm);
            if (isNaN(heightNum) || heightNum < 100) newErrors.height = t.errorHeight;
        } else {
            const weightNum = parseFloat(weightLbs);
            if (isNaN(weightNum) || weightNum < 45) newErrors.weight = t.errorWeight;
            const heightFtNum = parseInt(heightFt);
            const heightInNum = parseInt(heightIn);
            if (isNaN(heightFtNum) || isNaN(heightInNum) || (heightFtNum * 12 + heightInNum) < 39) newErrors.height = t.errorHeight;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    
    const handleNext = () => setStep(s => Math.min(s + 1, TOTAL_STEPS));
    const handleBack = () => setStep(s => Math.max(s - 1, 1));
    
    const calculateCalories = () => {
        if (!validateStep1()) return;

        let weightInKg: number;
        let heightInCm: number;

        if (unitSystem === 'metric') {
            weightInKg = parseFloat(weightKg);
            heightInCm = parseFloat(heightCm);
        } else {
            weightInKg = parseFloat(weightLbs) * 0.453592;
            heightInCm = (parseInt(heightFt) * 12 + parseInt(heightIn)) * 2.54;
        }

        const ageNum = parseInt(age);
        
        const bmr = (gender === 'male')
            ? (10 * weightInKg + 6.25 * heightInCm - 5 * ageNum + 5)
            : (10 * weightInKg + 6.25 * heightInCm - 5 * ageNum - 161);

        const activityMultipliers: Record<ActivityLevel, number> = {
            sedentary: 1.2,
            lightlyActive: 1.375,
            moderatelyActive: 1.55,
            veryActive: 1.725,
            extraActive: 1.9,
        };
        const maintenance = bmr * activityMultipliers[activityLevel];

        const goalAdjustments: Record<Goal, number> = {
            maintainWeight: 0,
            mildWeightLoss: -250,
            weightLoss: -500,
            extremeWeightLoss: -1000,
            mildWeightGain: 250,
            weightGain: 500,
            fastWeightGain: 1000,
        };
        const goalCalories = maintenance + goalAdjustments[goal];

        setCalorieResult({
            bmr: Math.round(bmr),
            maintenance: Math.round(maintenance),
            goalCalories: Math.round(goalCalories),
        });
        handleNext();
    };

    const calculateMacros = () => {
      if (!calorieResult) return;
      
      const macroRatios: Record<MacroPlan, {p: number, c: number, f: number}> = {
          balanced:      { p: 0.30, c: 0.40, f: 0.30 },
          lowCarb:       { p: 0.40, c: 0.20, f: 0.40 },
          highProtein:   { p: 0.45, c: 0.30, f: 0.25 },
      };

      const ratios = macroRatios[macroPlan];
      const protein = (calorieResult.goalCalories * ratios.p) / 4;
      const carbs = (calorieResult.goalCalories * ratios.c) / 4;
      const fat = (calorieResult.goalCalories * ratios.f) / 9;

      setMacroResult({
        protein: Math.round(protein),
        carbs: Math.round(carbs),
        fat: Math.round(fat),
      });
      handleNext();
    };

    const handleGetMealPlan = async () => {
        if (!calorieResult || !macroResult) return;
        setIsMealPlanLoading(true);
        setMealPlanError('');
        setMealPlan(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const prompt = `Create a one-day sample meal plan for a person who needs to consume approximately ${calorieResult.goalCalories} calories, ${macroResult.protein}g of protein, ${macroResult.carbs}g of carbohydrates, and ${macroResult.fat}g of fat. Provide distinct options for breakfast, lunch, dinner, and snacks.`;
            
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            breakfast: { type: Type.ARRAY, items: { type: Type.STRING } },
                            lunch: { type: Type.ARRAY, items: { type: Type.STRING } },
                            dinner: { type: Type.ARRAY, items: { type: Type.STRING } },
                            snacks: { type: Type.ARRAY, items: { type: Type.STRING } },
                        },
                        required: ["breakfast", "lunch", "dinner", "snacks"]
                    },
                },
            });
            
            const jsonText = response.text.trim();
            const plan = JSON.parse(jsonText);
            setMealPlan(plan);
            handleNext();

        } catch (error) {
            console.error("Error generating meal plan:", error);
            setMealPlanError(t.mealPlanError);
        } finally {
            setIsMealPlanLoading(false);
        }
    };

    const handlePrint = () => window.print();

    const stepLabels: Record<number, string> = {
        1: t.step1_personalia, 2: t.step2_activity, 3: t.step3_goal, 4: t.step4_results,
        5: t.step5_macros, 6: t.step6_macro_results, 7: t.step7_meal_plan, 8: t.step8_summary,
    };
    
    const inputClasses = "block w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-900 dark:text-white";
    const buttonBaseClasses = "w-full text-left p-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 transition-all duration-200 flex items-center space-x-4 rtl:space-x-reverse";
    const activeClasses = "bg-blue-600 text-white shadow-lg scale-105";
    const inactiveClasses = "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600";
    const segmentButtonBase = "w-full px-4 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 transition-colors duration-200";
    
    const renderStepContent = () => {
        switch (step) {
            case 1:
                return (<>
                    <div className="space-y-6">
                        <div>
                            <label className="block text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">{t.genderLabel}</label>
                            <div className="grid grid-cols-2 gap-4">
                                <button type="button" onClick={() => setGender('male')} className={`${buttonBaseClasses} ${gender === 'male' ? activeClasses : inactiveClasses}`}>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
                                    <span className="font-semibold text-lg">{t.male}</span>
                                </button>
                                <button type="button" onClick={() => setGender('female')} className={`${buttonBaseClasses} ${gender === 'female' ? activeClasses : inactiveClasses}`}>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
                                    <span className="font-semibold text-lg">{t.female}</span>
                                </button>
                            </div>
                        </div>
                         <div>
                            <label htmlFor="age" className="block text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">{t.ageLabel}</label>
                            <div className="relative">
                                <input type="number" id="age" value={age} onChange={(e) => setAge(e.target.value)} className={`${inputClasses} ${errors.age ? 'border-red-500' : ''}`} />
                                <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-gray-500">{t.ageUnit}</span>
                            </div>
                             {errors.age && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.age}</p>}
                        </div>
                        <div>
                            <label className="block text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">{t.unitSystemLabel}</label>
                            <div className="flex space-x-2 rtl:space-x-reverse rounded-md bg-gray-100 dark:bg-gray-900 p-1">
                                <button type="button" onClick={() => setUnitSystem('metric')} className={`${segmentButtonBase} ${unitSystem === 'metric' ? 'bg-blue-600 text-white shadow' : inactiveClasses}`}>{t.metric}</button>
                                <button type="button" onClick={() => setUnitSystem('imperial')} className={`${segmentButtonBase} ${unitSystem === 'imperial' ? 'bg-blue-600 text-white shadow' : inactiveClasses}`}>{t.imperial}</button>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">{t.heightLabel}</label>
                                {unitSystem === 'metric' ? (
                                    <div className="relative"><input type="number" value={heightCm} onChange={e => setHeightCm(e.target.value)} className={`${inputClasses} ${errors.height ? 'border-red-500' : ''}`} /><span className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-gray-500">{t.cm}</span></div>
                                ) : (
                                    <div className="flex gap-2">
                                        <div className="relative w-1/2"><input type="number" value={heightFt} onChange={e => setHeightFt(e.target.value)} className={`${inputClasses} ${errors.height ? 'border-red-500' : ''}`} /><span className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-gray-500">{t.ft}</span></div>
                                        <div className="relative w-1/2"><input type="number" value={heightIn} onChange={e => setHeightIn(e.target.value)} className={`${inputClasses} ${errors.height ? 'border-red-500' : ''}`} /><span className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-gray-500">{t.in}</span></div>
                                    </div>
                                )}
                                {errors.height && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.height}</p>}
                            </div>
                            <div>
                                <label className="block text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">{t.weightLabel}</label>
                                <div className="relative">
                                {unitSystem === 'metric' ? (
                                    <><input type="number" value={weightKg} onChange={e => setWeightKg(e.target.value)} className={`${inputClasses} ${errors.weight ? 'border-red-500' : ''}`} /><span className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-gray-500">{t.kg}</span></>
                                ) : (
                                    <><input type="number" value={weightLbs} onChange={e => setWeightLbs(e.target.value)} className={`${inputClasses} ${errors.weight ? 'border-red-500' : ''}`} /><span className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-gray-500">{t.lbs}</span></>
                                )}
                                </div>
                                {errors.weight && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.weight}</p>}
                            </div>
                        </div>
                    </div>
                </>);
            case 2:
                return (
                     <div>
                        <label className="block text-lg font-medium text-gray-700 dark:text-gray-300 mb-4 text-center">{t.activityLevelLabel}</label>
                        <div className="space-y-3">
                            {Object.entries(t.goalResultText).filter(([key, _]) => ['sedentary', 'lightlyActive', 'moderatelyActive', 'veryActive', 'extraActive'].includes(key)).map(([key, label]) => (
                                 <button key={key} type="button" onClick={() => setActivityLevel(key as ActivityLevel)} className={`${buttonBaseClasses} ${activityLevel === key ? activeClasses : inactiveClasses}`}>
                                    <span className="text-2xl">{['🧘', '🚶', '🏃', '🏋️', '🚴'][['sedentary', 'lightlyActive', 'moderatelyActive', 'veryActive', 'extraActive'].indexOf(key)]}</span>
                                    <span className="font-medium">{label as string}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                );
            case 3:
                 return (
                     <div>
                        <label className="block text-lg font-medium text-gray-700 dark:text-gray-300 mb-4 text-center">{t.goalLabel}</label>
                         <div className="space-y-3">
                         {Object.entries(t.goalResultText).filter(([key, _]) => !['sedentary', 'lightlyActive', 'moderatelyActive', 'veryActive', 'extraActive'].includes(key)).map(([key, label]) => (
                            <button key={key} type="button" onClick={() => setGoal(key as Goal)} className={`${buttonBaseClasses} ${goal === key ? activeClasses : inactiveClasses}`}>
                                <span className="text-2xl">{['⚖️', '📉', '📉📉', '🔥', '📈', '📈📈', '🚀'][['maintainWeight', 'mildWeightLoss', 'weightLoss', 'extremeWeightLoss', 'mildWeightGain', 'weightGain', 'fastWeightGain'].indexOf(key)]}</span>
                                <span className="font-medium">{label as string}</span>
                            </button>
                         ))}
                         </div>
                    </div>
                );
            case 4:
                if (!calorieResult) return null;
                return (
                    <div aria-live="polite">
                        <div className="text-center p-6 bg-blue-50 dark:bg-gray-700/50 rounded-2xl mb-6 shadow-inner">
                            <p className="text-lg font-medium text-gray-700 dark:text-gray-200">{t.goalResultText[goal] as string}</p>
                            <p className="text-6xl font-extrabold text-blue-600 dark:text-blue-400 my-2 tracking-tight">{calorieResult.goalCalories.toLocaleString()}</p>
                            <p className="text-lg text-gray-600 dark:text-gray-300">{t.caloriesPerDay}</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
                            <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                                <p className="text-sm text-gray-500 dark:text-gray-400">{t.yourBMR}</p>
                                <p className="text-2xl font-bold text-gray-800 dark:text-white">{calorieResult.bmr.toLocaleString()}</p>
                            </div>
                             <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                                <p className="text-sm text-gray-500 dark:text-gray-400">{t.maintenanceCalories}</p>
                                <p className="text-2xl font-bold text-gray-800 dark:text-white">{calorieResult.maintenance.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                );
            case 5:
                const macroPlans: { key: MacroPlan, label: string }[] = [ { key: 'balanced', label: t.balanced }, { key: 'lowCarb', label: t.lowCarb }, { key: 'highProtein', label: t.highProtein }, ];
                return (
                    <div>
                        <label className="block text-lg font-medium text-gray-700 dark:text-gray-300 mb-4 text-center">{t.macronutrientPlan}</label>
                        <div className="space-y-3">
                        {macroPlans.map(plan => (
                            <button key={plan.key} type="button" onClick={() => setMacroPlan(plan.key)} className={`${buttonBaseClasses} ${macroPlan === plan.key ? activeClasses : inactiveClasses}`}>
                                <span className="text-2xl">{ {balanced: '🥗', lowCarb: '🥩', highProtein: '🍗'}[plan.key] }</span>
                                <span className="font-medium">{plan.label}</span>
                            </button>
                        ))}
                        </div>
                    </div>
                );
            case 6:
                if (!macroResult) return null;
                const MacroCard: React.FC<{title: string; value: number; color: string; icon: React.ReactNode}> = ({title, value, color, icon}) => (
                    <div className={`p-4 rounded-xl shadow-lg ${color}`}>
                         <div className="flex items-center space-x-3 rtl:space-x-reverse">
                            <div className="text-3xl opacity-80">{icon}</div>
                            <p className="text-lg font-semibold">{title}</p>
                        </div>
                        <p className="text-4xl font-bold mt-2">{value}{t.grams}</p>
                    </div>
                );
                return (
                    <div className="space-y-4" aria-live="polite">
                         <h3 className="text-xl font-bold text-center text-gray-800 dark:text-white">{t.macronutrients}</h3>
                        <MacroCard title={t.protein} value={macroResult.protein} color="bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200" icon={<span>🍗</span>} />
                        <MacroCard title={t.carbs} value={macroResult.carbs} color="bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200" icon={<span>🍞</span>} />
                        <MacroCard title={t.fat} value={macroResult.fat} color="bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200" icon={<span>🥑</span>} />
                    </div>
                );
            case 7:
                 if (isMealPlanLoading) return <div className="text-center py-10"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div><p className="mt-4">{t.generatingMealPlan}...</p></div>;
                 if (mealPlanError) return <div className="text-center text-red-500 py-10">{mealPlanError}</div>;
                 if (!mealPlan) return null;
                 const MealSection: React.FC<{title: string; items: string[]; icon: string; borderColor: string}> = ({title, items, icon, borderColor}) => (
                    <div className={`p-4 rounded-lg border-l-4 ${borderColor} bg-gray-50 dark:bg-gray-700/50`}>
                        <h4 className="flex items-center text-lg font-semibold text-gray-800 dark:text-white mb-2">
                            <span className="mr-3 rtl:ml-3 text-2xl">{icon}</span>
                            {title}
                        </h4>
                        <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300 pl-4">
                            {items.map((item, i) => <li key={i}>{item}</li>)}
                        </ul>
                    </div>
                 );
                 return (
                     <div className="space-y-4" aria-live="polite">
                         <h3 className="text-2xl font-bold text-center text-gray-800 dark:text-white mb-6">{t.mealPlanTitle}</h3>
                         <MealSection title={t.breakfast} items={mealPlan.breakfast} icon="☕" borderColor="border-yellow-400" />
                         <MealSection title={t.lunch} items={mealPlan.lunch} icon="🥪" borderColor="border-green-400" />
                         <MealSection title={t.dinner} items={mealPlan.dinner} icon="🍝" borderColor="border-red-400" />
                         <MealSection title={t.snacks} items={mealPlan.snacks} icon="🍎" borderColor="border-purple-400" />
                     </div>
                 );
            case 8:
                const InfoRow: React.FC<{label: string; value: string | number}> = ({label, value}) => (
                    <div className="flex justify-between py-2.5 border-b border-gray-200 dark:border-gray-700"><span className="text-gray-600 dark:text-gray-300">{label}</span><span className="font-semibold text-gray-800 dark:text-white text-right">{value}</span></div>
                );
                return (
                    <div className="summary-content space-y-8">
                        <div>
                            <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 pb-2 border-b-2 border-blue-500">{t.summaryYourProfile}</h3>
                            <div className="space-y-1">
                                <InfoRow label={t.genderLabel} value={t[gender]} />
                                <InfoRow label={t.ageLabel} value={`${age} ${t.ageUnit}`} />
                                <InfoRow label={t.heightLabel} value={unitSystem === 'metric' ? `${heightCm} ${t.cm}`: `${heightFt}' ${heightIn}"`} />
                                <InfoRow label={t.weightLabel} value={unitSystem === 'metric' ? `${weightKg} ${t.kg}`: `${weightLbs} ${t.lbs}`} />
                                <InfoRow label={t.activityLevelLabel.split(':')[0]} value={(t.goalResultText[activityLevel] as string).split(':')[1]} />
                                <InfoRow label={t.goalLabel.split('?')[0]} value={t.goalResultText[goal] as string} />
                            </div>
                        </div>
                         <div>
                            <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 pb-2 border-b-2 border-blue-500">{t.summaryYourResults}</h3>
                            <div className="space-y-1">
                                <InfoRow label={t.goalResultText[goal] as string} value={`${calorieResult?.goalCalories.toLocaleString()} ${t.caloriesPerDay}`} />
                                <InfoRow label={t.maintenanceCalories} value={`${calorieResult?.maintenance.toLocaleString()} ${t.caloriesPerDay}`} />
                                <InfoRow label={t.yourBMR} value={`${calorieResult?.bmr.toLocaleString()} ${t.caloriesPerDay}`} />
                                <InfoRow label={`${t.protein} (${t.grams})`} value={macroResult?.protein ?? ''} />
                                <InfoRow label={`${t.carbs} (${t.grams})`} value={macroResult?.carbs ?? ''} />
                                <InfoRow label={`${t.fat} (${t.grams})`} value={macroResult?.fat ?? ''} />
                            </div>
                        </div>
                        {mealPlan && (
                             <div>
                                <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 pb-2 border-b-2 border-blue-500">{t.summaryCalculatedMealPlan}</h3>
                                 <div className="space-y-4">
                                     <div><h4 className="font-semibold text-blue-600 dark:text-blue-400 text-lg">{t.breakfast}</h4><p className="text-gray-700 dark:text-gray-300 pl-2">{mealPlan.breakfast.join(', ')}</p></div>
                                     <div><h4 className="font-semibold text-blue-600 dark:text-blue-400 text-lg">{t.lunch}</h4><p className="text-gray-700 dark:text-gray-300 pl-2">{mealPlan.lunch.join(', ')}</p></div>
                                     <div><h4 className="font-semibold text-blue-600 dark:text-blue-400 text-lg">{t.dinner}</h4><p className="text-gray-700 dark:text-gray-300 pl-2">{mealPlan.dinner.join(', ')}</p></div>
                                     <div><h4 className="font-semibold text-blue-600 dark:text-blue-400 text-lg">{t.snacks}</h4><p className="text-gray-700 dark:text-gray-300 pl-2">{mealPlan.snacks.join(', ')}</p></div>
                                 </div>
                             </div>
                        )}
                    </div>
                );
            default: return null;
        }
    };

    const renderNavButtons = () => {
        const primaryButtonClasses = "py-3 px-8 border border-transparent rounded-lg shadow-md text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 transition-all transform hover:scale-105";
        const secondaryButtonClasses = "py-3 px-8 border border-gray-300 rounded-lg shadow-md text-lg font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all";

        return (
            <div className="mt-8 flex justify-between items-center">
                
                <button onClick={handleBack} className={`${secondaryButtonClasses} ${step === 1 ? 'opacity-0' : ''}`} disabled={step === 1}>
                    {t.backButton}
                </button>
                
                <div>
                    {step === 1 && <button onClick={handleNext} className={primaryButtonClasses}>{t.nextButton}</button>}
                    {step === 2 && <button onClick={handleNext} className={primaryButtonClasses}>{t.nextButton}</button>}
                    {step === 3 && <button onClick={calculateCalories} className={primaryButtonClasses}>{t.calculateCaloriesButton}</button>}
                    {step === 4 && <button onClick={handleNext} className={primaryButtonClasses}>{t.nextButton}</button>}
                    {step === 5 && <button onClick={calculateMacros} className={primaryButtonClasses}>{t.nextButton}</button>}
                    {step === 6 && <button onClick={handleGetMealPlan} className={primaryButtonClasses} disabled={isMealPlanLoading}>{isMealPlanLoading ? t.generatingMealPlan + '...' : t.getMealPlan}</button>}
                    {step === 7 && <button onClick={handleNext} className={primaryButtonClasses}>{t.nextButton}</button>}
                    {step === 8 && <button onClick={resetForm} className={secondaryButtonClasses}>{t.recalculate}</button>}
                </div>

                 {step === 8 && <button onClick={handlePrint} className={primaryButtonClasses}>{t.printResults}</button>}

            </div>
        );
    };

    return (
        <main className="w-full max-w-2xl mx-auto px-4 py-8 md:py-12">
            <style>{`
                @media print {
                    body * { visibility: hidden; }
                    .print-container, .print-container * { visibility: visible; }
                    .print-container { position: absolute; left: 0; top: 0; width: 100%; padding: 2rem; }
                    .no-print { display: none; }
                    .summary-content { color: #000 !important; }
                    .summary-content h3 { color: #111827 !important; border-color: #3b82f6 !important;}
                    .summary-content div { color: #374151 !important; }
                    .summary-content span { color: #1f2937 !important; }
                    .bg-white { background-color: #fff !important; }
                    .shadow-2xl { box-shadow: none !important; }
                }
            `}</style>
            <div className="print-container">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white text-center mb-4">{t.calorieTitle}</h1>
                <p className="text-center text-gray-600 dark:text-gray-400 mb-8 no-print">{t.calorieSubheading}</p>

                <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 md:p-8 transition-all duration-300">
                    <div className="no-print">
                       {step < TOTAL_STEPS && <ProgressBar currentStep={step} totalSteps={TOTAL_STEPS} label={`${t.step} ${step} ${t.stepOf} ${TOTAL_STEPS}: ${stepLabels[step]}`} />}
                    </div>
                    {renderStepContent()}
                    <div className="no-print">
                        {renderNavButtons()}
                    </div>
                </section>
            </div>
            
            {t.seoCalorieSections && t.seoCalorieSections.length > 0 && (
                <div className="no-print">
                    <SeoContent sections={t.seoCalorieSections} lang={currentLang} />
                </div>
            )}
        </main>
    );
};

export default CalorieCalculatorPage;