

export enum LanguageCode {
  EN = 'en',
  ES = 'es',
  FR = 'fr',
  DE = 'de',
  PT = 'pt',
  IT = 'it',
  HI = 'hi',
  RU = 'ru',
  JA = 'ja',
  ZH = 'zh',
  PL = 'pl',
  FA = 'fa',
  NL = 'nl',
  KO = 'ko',
  TH = 'th',
  TR = 'tr',
  VI = 'vi',
  AR = 'ar',
}

export interface Language {
  code: LanguageCode;
  name: string;
}

export interface Age {
  years: number;
  months: number;
  days: number;
}

export interface TimeDuration {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export interface AdditionalInfo {
  dayOfWeek: string;
  season: string;
  nextBirthday: number;
}

export interface SeoSection {
  heading: string;
  paragraphs: string[];
  list?: string[];
}

export interface PrivacySection {
  heading: string;
  paragraphs: string[];
}

export interface Translation {
  // Common
  title: string;
  selectLanguage: string;
  days: string;
  weeks: string;
  
  // Layout
  navHome: string;
  navCalculator: string;
  navTimeAndDate: string;
  navHealthCalculators: string;
  navPregnancyCalculator: string;
  navOvulationCalculator: string;
  navMenstrualCycleCalculator: string;
  navCalorieCalculator: string;
  navTimeCalculator: string;
  navAbout: string;
  footerRights: string;
  footerPrivacyPolicy: string;
  footerContactUs: string;

  // HomePage
  homeTitle: string;
  homeDescription: string;
  homeCTAText: string;
  homeBasicCalculatorTitle: string;
  homeHealthCalculatorsTitle: string;
  homePregnancyCalculatorDescription: string;
  homeOvulationCalculatorDescription: string;
  homeMenstrualCycleCalculatorDescription: string;
  homeCalorieCalculatorDescription: string;
  homeTimeCalculatorDescription: string;
  
  // Age Calculator
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  h1: string;
  h2: string;
  dateOfBirthLabel: string;
  dayLabel: string;
  monthLabel: string;
  yearLabel: string;
  calculateButton: string;
  errorInvalidDate: string;
  errorFutureDate: string;
  resultPrefix: string;
  resultSuffix: string;
  ageInGregorian?: string;
  years: string;
  months: string;
  moreInfoTitle: string;
  dayOfWeekLabel: string;
  seasonLabel: string;
  nextBirthdayLabel: string;
  shareResultTitle: string;
  shareResultText: string;
  copyResultButton: string;
  resultCopiedTooltip: string;
  calendarType: string;
  gregorian: string;
  hijri: string;
  monthsArray: string[];
  hijriMonthsArray: string[];
  daysOfWeekArray: string[];
  seasonsArray: string[];
  seoSections: SeoSection[];
  
  // Share Buttons
  shareTitle: string;
  copyLinkButton: string;
  copiedTooltip: string;

  // About Page
  aboutTitle: string;
  aboutHeading: string;
  aboutContent: string[];

  // Privacy Page
  privacyTitle: string;
  privacyHeading: string;
  privacyContent: PrivacySection[];

  // Contact Page
  contactTitle: string;
  contactHeading: string;
  contactIntro: string;
  contactEmail: string;

  // Pregnancy Calculator
  seoPregnancyTitle: string;
  seoPregnancyDescription: string;
  pregnancyTitle: string;
  pregnancySubheading: string;
  calculationMethodLabel: string;
  lmpMethod: string;
  conceptionMethod: string;
  ivfMethod: string;
  lmpDateLabel: string;
  conceptionDateLabel: string;
  transferDateLabel: string;
  ivfCycleTypeLabel: string;
  day3Transfer: string;
  day5Transfer: string;
  calculateDueDateButton: string;
  pregnancyHeading: string;
  dueDateResultLabel: string;
  gestationalAgeResultLabel: string;
  trimesterResultLabel: string;
  trimester1: string;
  trimester2: string;
  trimester3: string;
  seoPregnancySections: SeoSection[];

  // Ovulation Calculator
  seoOvulationTitle: string;
  seoOvulationDescription: string;
  ovulationTitle: string;
  ovulationSubheading: string;
  lmpDateLabelOvulation: string;
  cycleLengthLabel: string;
  calculateOvulationButton: string;
  ovulationHeading: string;
  resultOvulationDate: string;
  resultFertileWindow: string;
  fertileWindowDescription: string;
  resultNextPeriod: string;
  seoOvulationSections: SeoSection[];

  // Menstrual Cycle Calculator
  seoMenstrualTitle: string;
  seoMenstrualDescription: string;
  menstrualCycleTitle: string;
  menstrualCycleSubheading: string;
  calculateMenstrualButton: string;
  menstrualCycleHeading: string;
  resultNextPeriod1: string;
  resultNextPeriod2: string;
  seoMenstrualSections: SeoSection[];

  // Calorie Calculator
  seoCalorieTitle: string;
  seoCalorieDescription: string;
  calorieTitle: string;
  calorieSubheading: string;
  step: string;
  stepOf: string;
  step1_personalia: string;
  step2_activity: string;
  step3_goal: string;
  step4_results: string;
  step5_macros: string;
  step6_macro_results: string;
  step7_meal_plan: string;
  step8_summary: string;
  nextButton: string;
  backButton: string;
  calculateCaloriesButton: string;
  recalculate: string;
  unitSystemLabel: string;
  metric: string;
  imperial: string;
  genderLabel: string;
  male: string;
  female: string;
  ageLabel: string;
  ageUnit: string;
  heightLabel: string;
  weightLabel: string;
  cm: string;
  ft: string;
  in: string;
  kg: string;
  lbs: string;
  activityLevelLabel: string;
  sedentary: string;
  lightlyActive: string;
  moderatelyActive: string;
  veryActive: string;
  extraActive: string;
  goalLabel: string;
  maintainWeight: string;
  mildWeightLoss: string;
  weightLoss: string;
  extremeWeightLoss: string;
  mildWeightGain: string;
  weightGain: string;
  fastWeightGain: string;
  goalResultText: Record<string, string>;
  macronutrientPlan: string;
  balanced: string;
  lowCarb: string;
  highProtein: string;
  macronutrients: string;
  protein: string;
  carbs: string;
  fat: string;
  grams: string;
  getMealPlan: string;
  generatingMealPlan: string;
  mealPlanError: string;
  mealPlanTitle: string;

  breakfast: string;
  lunch: string;
  dinner: string;
  snacks: string;

  summaryTitle: string;
  summaryYourProfile: string;
  summaryYourResults: string;
  summaryCalculatedMealPlan: string;
  printResults: string;
  calorieShareResultTitle: string;
  calorieShareResultText: string;
  // FIX: Added missing translation keys for the calorie calculator page.
  caloriesPerDay: string;
  yourBMR: string;
  maintenanceCalories: string;
  
  errorNumber: string;
  errorHeight: string;
  errorWeight: string;
  errorAge: string;
  seoCalorieSections: SeoSection[];

  // Time Calculator
  seoTimeTitle: string;
  seoTimeDescription: string;
  timeTitle: string;
  timeSubheading: string;
  time1Label: string;
  time2Label: string;
  operationLabel: string;
  add: string;
  subtract: string;
  calculateTimeButton: string;
  resetButton: string;
  resultLabel: string;
  hours: string;
  minutes: string;
  seconds: string;
  errorInvalidTime: string;
  seoTimeSections: SeoSection[];

  // Hours Calculator (Arabic only)
  navHoursCalculator?: string;
  homeHoursCalculatorDescription?: string;
  seoHoursTitle?: string;
  seoHoursDescription?: string;
  hoursTitle?: string;
  hoursSubheading?: string;
  startTimeLabel?: string;
  endTimeLabel?: string;
  hourLabel?: string;
  minuteLabel?: string;
  calculateHoursButton?: string;
  resultDurationLabel?: string;
  resultInHours?: string;
  resultInMinutes?: string;
  resultHours?: string;
  resultMinutes?: string;
  seoHoursSections?: SeoSection[];
}