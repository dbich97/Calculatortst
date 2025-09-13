import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import type { Translation, LanguageCode } from '../types';
import { usePageMetadata } from '../lib/hooks';
import ShareButtons from '../components/ShareButtons';
import SeoContent from '../components/SeoContent';
import HeaderAdComponent from '../components/HeaderAdComponent';
import AdComponent from '../components/AdComponent';
import ProgressBar from '../components/ProgressBar';
// FIX: Correctly import Gemini API and types
import { GoogleGenAI, Type as GenaiType } from "@google/genai";

interface PageContext {
  t: Translation;
  currentLang: LanguageCode;
}

const CalorieCalculatorPage: React.FC = () => {
    const { t, currentLang } = useOutletContext<PageContext>();
    usePageMetadata(t.seoCalorieTitle, t.seoCalorieDescription);

    const [step, setStep] = useState(1);
    const totalSteps = 8;

    // Personalia
    const [unitSystem, setUnitSystem] = useState<'metric' | 'imperial'>('metric');
    const [gender, setGender] = useState<'male' | 'female'>('male');
    const [age, setAge] = useState('');
    const [heightCm, setHeightCm] = useState('');
    const [heightFt, setHeightFt] = useState('');
    const [heightIn, setHeightIn] = useState('');
    const [weightKg, setWeightKg] = useState('');
    const [weightLbs, setWeightLbs] = useState('');

    // Activity
    const [activityLevel, setActivityLevel] = useState('sedentary');

    // Goal
    const [goal, setGoal] =useState('maintain');

    // Results
    const [bmr, setBmr] = useState(0);
    const [maintenanceCalories, setMaintenanceCalories] = useState(0);
    const [goalCalories, setGoalCalories] = useState(0);

    // Macros
    const [macroPlan, setMacroPlan] = useState('balanced');
    const [protein, setProtein] = useState(0);
    const [carbs, setCarbs] = useState(0);
    const [fat, setFat] = useState(0);

    // Meal Plan
    const [mealPlan, setMealPlan] = useState<any>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [mealPlanError, setMealPlanError] = useState('');

    const [errors, setErrors] = useState<Record<string, string>>({});

    const stepLabels = [
        t.step1_personalia, t.step2_activity, t.step3_goal, t.step4_results,
        t.step5_macros, t.step6_macro_results, t.step7_meal_plan, t.step8_summary
    ];
    
    useEffect(() => {
        setHeightCm(''); setHeightFt(''); setHeightIn('');
        setWeightKg(''); setWeightLbs('');
        setErrors({});
    }, [unitSystem]);

    const validateStep1 = () => {
        const newErrors: Record<string, string> = {};
        if (!age || +age <= 1 || +age > 120) newErrors.age = t.errorAge;
        if (unitSystem === 'metric') {
            if (!heightCm || +heightCm <= 0) newErrors.height = t.errorHeight;
            if (!weightKg || +weightKg <= 0) newErrors.weight = t.errorWeight;
        } else {
            const totalInches = (+heightFt * 12) + +(heightIn || '0');
            if ((!heightFt && !heightIn) || totalInches <= 0) newErrors.height = t.errorHeight;
            if (!weightLbs || +weightLbs <= 0) newErrors.weight = t.errorWeight;
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    
    const calculateBMR = () => {
        const ageNum = parseInt(age);
        let height = 0, weight = 0;
        if (unitSystem === 'metric') {
            height = parseInt(heightCm);
            weight = parseInt(weightKg);
        } else {
            height = ((parseInt(heightFt) * 12) + parseInt(heightIn || '0')) * 2.54;
            weight = parseInt(weightLbs) * 0.453592;
        }
        let calculatedBmr = (gender === 'male')
            ? 10 * weight + 6.25 * height - 5 * ageNum + 5
            : 10 * weight + 6.25 * height - 5 * ageNum - 161;
        setBmr(Math.round(calculatedBmr));
    };

    const calculateCalories = () => {
        const activityMultipliers: Record<string, number> = {
            sedentary: 1.2, lightlyActive: 1.375, moderatelyActive: 1.55,
            veryActive: 1.725, extraActive: 1.9,
        };
        const maintenance = bmr * activityMultipliers[activityLevel];
        setMaintenanceCalories(Math.round(maintenance));
        const goalModifiers: Record<string, number> = {
            maintain: 0, mildWeightLoss: -250, weightLoss: -500, extremeWeightLoss: -1000,
            mildWeightGain: 250, weightGain: 500, fastWeightGain: 1000,
        };
        setGoalCalories(Math.round(maintenance + goalModifiers[goal]));
    };

    const calculateMacros = () => {
        const macroRatios: Record<string, {p: number, c: number, f: number}> = {
            balanced: { p: 0.30, c: 0.40, f: 0.30 }, lowCarb: { p: 0.40, c: 0.20, f: 0.40 },
            highProtein: { p: 0.50, c: 0.25, f: 0.25 },
        };
        const ratio = macroRatios[macroPlan];
        setProtein(Math.round((goalCalories * ratio.p) / 4));
        setCarbs(Math.round((goalCalories * ratio.c) / 4));
        setFat(Math.round((goalCalories * ratio.f) / 9));
    };
    
    const handleNext = () => {
        if (step === 1 && !validateStep1()) return;
        if (step === 1) calculateBMR();
        if (step === 3) calculateCalories();
        if (step === 5) calculateMacros();
        setStep(s => Math.min(s + 1, totalSteps));
    };
    
    const handleBack = () => setStep(s => Math.max(s - 1, 1));
    const handleRecalculate = () => { setStep(1); setMealPlan(null); };

    const generateMealPlan = async () => {
        setIsGenerating(true); setMealPlanError(''); setMealPlan(null);
        try {
            if (!process.env.API_KEY) throw new Error("API key not found.");
            const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
            const prompt = `Create a one-day meal plan for a person who needs to consume approximately ${goalCalories} calories. The macronutrient breakdown should be around ${protein}g protein, ${carbs}g carbs, and ${fat}g fat. The person is a ${gender}, ${age} years old. Provide options for breakfast, lunch, dinner, and snacks. The response must be in the language with code '${currentLang}'. Do not include any introductory or concluding text, just the JSON.`;
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: GenaiType.OBJECT,
                        properties: {
                            breakfast: { type: GenaiType.ARRAY, items: { type: GenaiType.STRING } },
                            lunch: { type: GenaiType.ARRAY, items: { type: GenaiType.STRING } },
                            dinner: { type: GenaiType.ARRAY, items: { type: GenaiType.STRING } },
                            snacks: { type: GenaiType.ARRAY, items: { type: GenaiType.STRING } }
                        }
                    }
                }
            });
            const data = JSON.parse(response.text.trim());
            setMealPlan(data);
        } catch (error) {
            console.error("Error generating meal plan:", error);
            setMealPlanError(t.mealPlanError);
        } finally {
            setIsGenerating(false);
            handleNext();
        }
    };
    
    const buttonClasses = "w-full sm:w-auto px-6 py-3 border border-transparent rounded-lg shadow-lg text-lg font-medium text-white transition transform hover:scale-105 duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800";
    const backButtonClasses = `${buttonClasses} bg-gray-600 hover:bg-gray-700 focus:ring-gray-500`;
    const nextButtonClasses = `${buttonClasses} bg-blue-600 hover:bg-blue-700 focus:ring-blue-500`;
    const inputClasses = "block w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-900 dark:text-white";
    const labelClasses = "block text-lg font-medium text-gray-700 dark:text-gray-300 mb-2";

    const renderContent = () => {
        switch (step) {
            case 1: // Personalia
                return (
                    <div className="space-y-6">
                        <div>
                            <label className={labelClasses}>{t.unitSystemLabel}</label>
                            <div className="flex space-x-2 rtl:space-x-reverse rounded-md bg-gray-100 dark:bg-gray-900 p-1">
                                <button onClick={() => setUnitSystem('metric')} className={`w-full py-2 font-medium rounded-md ${unitSystem === 'metric' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>{t.metric}</button>
                                <button onClick={() => setUnitSystem('imperial')} className={`w-full py-2 font-medium rounded-md ${unitSystem === 'imperial' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>{t.imperial}</button>
                            </div>
                        </div>
                        <div>
                            <label className={labelClasses}>{t.genderLabel}</label>
                            <div className="flex space-x-2 rtl:space-x-reverse rounded-md bg-gray-100 dark:bg-gray-900 p-1">
                                <button onClick={() => setGender('male')} className={`w-full py-2 font-medium rounded-md ${gender === 'male' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>{t.male}</button>
                                <button onClick={() => setGender('female')} className={`w-full py-2 font-medium rounded-md ${gender === 'female' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>{t.female}</button>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="age" className={labelClasses}>{t.ageLabel}</label>
                            <input type="number" id="age" value={age} onChange={e => setAge(e.target.value)} className={inputClasses} placeholder={t.ageUnit} />
                            {errors.age && <p className="mt-1 text-red-500">{errors.age}</p>}
                        </div>
                        <div>
                            <label className={labelClasses}>{t.heightLabel}</label>
                            {unitSystem === 'metric' ? (
                                <input type="number" value={heightCm} onChange={e => setHeightCm(e.target.value)} className={inputClasses} placeholder={t.cm} />
                            ) : (
                                <div className="flex gap-4">
                                    <input type="number" value={heightFt} onChange={e => setHeightFt(e.target.value)} className={inputClasses} placeholder={t.ft} />
                                    <input type="number" value={heightIn} onChange={e => setHeightIn(e.target.value)} className={inputClasses} placeholder={t.in} />
                                </div>
                            )}
                            {errors.height && <p className="mt-1 text-red-500">{errors.height}</p>}
                        </div>
                        <div>
                            <label className={labelClasses}>{t.weightLabel}</label>
                            <input type="number" value={unitSystem === 'metric' ? weightKg : weightLbs} onChange={e => unitSystem === 'metric' ? setWeightKg(e.target.value) : setWeightLbs(e.target.value)} className={inputClasses} placeholder={unitSystem === 'metric' ? t.kg : t.lbs} />
                            {errors.weight && <p className="mt-1 text-red-500">{errors.weight}</p>}
                        </div>
                    </div>
                );
            case 2: // Activity
                // FIX: Use 'as const' to ensure 'level' is a specific string literal, not a generic string. This allows TypeScript to correctly infer the type of t[level] as string.
                const activities = ['sedentary', 'lightlyActive', 'moderatelyActive', 'veryActive', 'extraActive'] as const;
                return (
                    <div className="space-y-4">
                        <label className={labelClasses}>{t.activityLevelLabel}</label>
                        {activities.map(level => (
                             <button key={level} onClick={() => setActivityLevel(level)} className={`w-full text-left p-4 rounded-lg border-2 transition ${activityLevel === level ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/50' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'}`}>
                                <span className="font-bold text-gray-800 dark:text-white">{t[level]}</span>
                             </button>
                        ))}
                    </div>
                );
            case 3: // Goal
                // FIX: Use 'as const' to ensure 'g' is a specific string literal, not a generic string. This allows TypeScript to correctly infer the type of t[g] as string.
                const goals = ['maintainWeight', 'mildWeightLoss', 'weightLoss', 'extremeWeightLoss', 'mildWeightGain', 'weightGain', 'fastWeightGain'] as const;
                const goalMap: Record<string, string> = { maintainWeight: 'maintain', mildWeightLoss: 'mildWeightLoss', weightLoss: 'weightLoss', extremeWeightLoss: 'extremeWeightLoss', mildWeightGain: 'mildWeightGain', weightGain: 'weightGain', fastWeightGain: 'fastWeightGain'};
                return (
                    <div className="space-y-4">
                        <label className={labelClasses}>{t.goalLabel}</label>
                        {goals.map(g => (
                            <button key={g} onClick={() => setGoal(goalMap[g])} className={`w-full text-left p-4 rounded-lg border-2 transition ${goal === goalMap[g] ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/50' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'}`}>
                               <span className="font-bold text-gray-800 dark:text-white">{t[g]}</span>
                            </button>
                        ))}
                    </div>
                );
            case 4: // Results
                return (
                    <div className="text-center space-y-4">
                        <h3 className="text-2xl font-bold">{t.goalResultText[goal]}</h3>
                        <div className="p-6 bg-blue-50 dark:bg-blue-900/50 rounded-xl">
                            <p className="text-lg text-gray-600 dark:text-gray-300">{t.caloriesPerDay}</p>
                            <p className="text-5xl font-extrabold text-blue-600 dark:text-blue-400">{goalCalories.toLocaleString()}</p>
                        </div>
                        <div className="pt-4 space-y-2 text-lg">
                           <p><span className="font-semibold">{t.yourBMR}:</span> {bmr.toLocaleString()} {t.caloriesPerDay}</p>
                           <p><span className="font-semibold">{t.maintenanceCalories}:</span> {maintenanceCalories.toLocaleString()} {t.caloriesPerDay}</p>
                        </div>
                    </div>
                );
            case 5: // Macros
                 // FIX: Use 'as const' to ensure 'p' is a specific string literal, not a generic string. This allows TypeScript to correctly infer the type of t[p] as string.
                 const plans = ['balanced', 'lowCarb', 'highProtein'] as const;
                 return (
                    <div className="space-y-4">
                        <label className={labelClasses}>{t.macronutrientPlan}</label>
                        {plans.map(p => (
                            <button key={p} onClick={() => setMacroPlan(p)} className={`w-full text-left p-4 rounded-lg border-2 transition ${macroPlan === p ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/50' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'}`}>
                                <span className="font-bold text-gray-800 dark:text-white">{t[p]}</span>
                            </button>
                        ))}
                    </div>
                 );
            case 6: // Macro Results
                return(
                    <div className="text-center space-y-6">
                        <h3 className="text-2xl font-bold">{t.macronutrients}</h3>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="p-4 bg-green-50 dark:bg-green-900/50 rounded-xl"><p className="font-bold text-lg">{t.protein}</p><p className="text-3xl font-bold text-green-600">{protein}{t.grams}</p></div>
                            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/50 rounded-xl"><p className="font-bold text-lg">{t.carbs}</p><p className="text-3xl font-bold text-yellow-600">{carbs}{t.grams}</p></div>
                            <div className="p-4 bg-red-50 dark:bg-red-900/50 rounded-xl"><p className="font-bold text-lg">{t.fat}</p><p className="text-3xl font-bold text-red-600">{fat}{t.grams}</p></div>
                        </div>
                    </div>
                );
            case 7: // Meal Plan
                return (
                    <div className="text-center">
                        <h3 className="text-2xl font-bold mb-4">{t.getMealPlan}</h3>
                        <p className="mb-6 text-gray-600 dark:text-gray-400">Let AI generate a personalized meal plan for you based on your results.</p>
                        <button onClick={generateMealPlan} disabled={isGenerating} className={`${nextButtonClasses} w-full sm:w-auto`}>
                            {isGenerating ? t.generatingMealPlan : t.getMealPlan}
                        </button>
                    </div>
                );
            case 8: // Summary
                return (
                    <div className="space-y-8">
                        <h3 className="text-3xl font-bold text-center">{t.summaryTitle}</h3>
                        {mealPlanError && <p className="text-center text-red-500">{mealPlanError}</p>}
                        {mealPlan && (
                            <div id="print-section">
                                <div className="space-y-6">
                                    <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                        <h4 className="text-xl font-semibold mb-2">{t.summaryYourProfile}</h4>
                                        {/* FIX: Remove incorrect 'as keyof Translation' cast. The 'gender' state is already typed as 'male' | 'female', allowing TypeScript to correctly infer t[gender] as a string. */}
                                        <p>{t.genderLabel}: {t[gender]}, {t.ageLabel}: {age} {t.ageUnit}, {t.goalLabel}: {t.goalResultText[goal]}</p>
                                    </div>
                                    <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                        <h4 className="text-xl font-semibold mb-2">{t.summaryYourResults}</h4>
                                        <p>{t.caloriesPerDay}: <strong>{goalCalories.toLocaleString()}</strong></p>
                                        <p>{t.protein}: {protein}g, {t.carbs}: {carbs}g, {t.fat}: {fat}g</p>
                                    </div>
                                    <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                        <h4 className="text-xl font-semibold mb-2">{t.mealPlanTitle}</h4>
                                        <div className="space-y-4">
                                            <div><strong>{t.breakfast}:</strong><ul>{mealPlan.breakfast.map((item:string, i:number) => <li key={i}>- {item}</li>)}</ul></div>
                                            <div><strong>{t.lunch}:</strong><ul>{mealPlan.lunch.map((item:string, i:number) => <li key={i}>- {item}</li>)}</ul></div>
                                            <div><strong>{t.dinner}:</strong><ul>{mealPlan.dinner.map((item:string, i:number) => <li key={i}>- {item}</li>)}</ul></div>
                                            <div><strong>{t.snacks}:</strong><ul>{mealPlan.snacks.map((item:string, i:number) => <li key={i}>- {item}</li>)}</ul></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                         <div className="text-center mt-6">
                            <button onClick={() => window.print()} className="no-print w-full sm:w-auto px-6 py-3 border border-transparent rounded-lg shadow-lg text-lg font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-gray-800">
                                {t.printResults}
                            </button>
                        </div>
                    </div>
                );
            default: return null;
        }
    };
    
    return (
        <>
            <HeaderAdComponent />
            <main className="w-full max-w-2xl mx-auto px-4 py-8">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 md:p-10">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-2 text-center">{t.calorieTitle}</h1>
                    <p className="text-md md:text-lg text-gray-500 dark:text-gray-400 mb-8 text-center">{t.calorieSubheading}</p>
                    <ProgressBar currentStep={step} totalSteps={totalSteps} label={`${t.step} ${step} ${t.stepOf} ${totalSteps}: ${stepLabels[step - 1]}`} />
                    <div className="min-h-[300px]">
                        {renderContent()}
                    </div>
                    <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-4">
                        {step > 1 && step < totalSteps && (
                            <button onClick={handleBack} className={backButtonClasses}>{t.backButton}</button>
                        )}
                        {step < 7 && (
                            <button onClick={handleNext} className={nextButtonClasses}>{t.nextButton}</button>
                        )}
                        {step === totalSteps && (
                            <button onClick={handleRecalculate} className={backButtonClasses}>{t.recalculate}</button>
                        )}
                        <div className="sm:flex-grow"></div>
                    </div>
                </div>
                <AdComponent />
                <ShareButtons url={window.location.href} title={t.calorieShareResultTitle.replace('{calories}', goalCalories.toString())} t={t} />
            </main>
            <SeoContent sections={t.seoCalorieSections} lang={currentLang} />
            <style>{`
                @media print {
                    body * { visibility: hidden; }
                    #print-section, #print-section * { visibility: visible; }
                    #print-section { position: absolute; left: 0; top: 0; width: 100%; }
                    .no-print { display: none !important; }
                }
            `}</style>
        </>
    );
};

export default CalorieCalculatorPage;