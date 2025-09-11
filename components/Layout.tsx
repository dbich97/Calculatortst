import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Outlet, NavLink, Link, useLocation } from 'react-router-dom';
import { LanguageCode, type Translation } from '../types';
import LanguageSelector from './LanguageSelector';
import { languagesWithHoursCalculator } from '../lib/i18n';

const Layout: React.FC = () => {
    const { lang } = useParams<{ lang: string }>();
    const navigate = useNavigate();
    const location = useLocation();

    const [t, setT] = useState<Translation | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isHealthDropdownOpen, setIsHealthDropdownOpen] = useState(false);
    const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const desktopHealthDropdownRef = useRef<HTMLDivElement>(null);
    const desktopTimeDropdownRef = useRef<HTMLDivElement>(null);

    const currentLang = (Object.values(LanguageCode).includes(lang as LanguageCode) ? lang : LanguageCode.EN) as LanguageCode;

    useEffect(() => {
        if (lang !== currentLang) {
            const newPath = location.pathname.replace(/^\/[^/]+/, `/${currentLang}`);
            navigate(newPath, { replace: true });
        }
    }, [lang, currentLang, navigate, location.pathname]);
    
    useEffect(() => {
        const fetchTranslations = async () => {
            setIsLoading(true);
            try {
                // The `./` is important for relative paths in this environment
                const response = await fetch(`/locales/${currentLang}.json`);
                if (!response.ok) {
                    throw new Error(`Translation file for ${currentLang} not found`);
                }
                const data = await response.json();
                setT(data);
            } catch (error) {
                console.error("Failed to load translation file:", error);
                // Fallback to English if the language file is not found or fails to parse
                const fallbackResponse = await fetch(`/locales/en.json`);
                const data = await fallbackResponse.json();
                setT(data);
                // Redirect to the English URL to reflect the fallback
                const newPath = location.pathname.replace(/^\/[^/]+/, `/${LanguageCode.EN}`);
                if(lang !== LanguageCode.EN) {
                    navigate(newPath, { replace: true });
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchTranslations();
        
        document.documentElement.lang = currentLang;
        document.documentElement.dir = ['ar', 'fa'].includes(currentLang) ? 'rtl' : 'ltr';
    }, [currentLang, navigate, location.pathname, lang]);


    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (desktopHealthDropdownRef.current && !desktopHealthDropdownRef.current.contains(event.target as Node)) {
                setIsHealthDropdownOpen(false);
            }
             if (desktopTimeDropdownRef.current && !desktopTimeDropdownRef.current.contains(event.target as Node)) {
                setIsTimeDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleLanguageChange = (newLang: LanguageCode) => {
        const newPath = location.pathname.replace(/^\/[^/]+/, `/${newLang}`);
        navigate(newPath);
    };
    
    // Close menus on navigation
    useEffect(() => {
        setIsMobileMenuOpen(false);
        setIsHealthDropdownOpen(false);
        setIsTimeDropdownOpen(false);
    }, [location.pathname]);

    if (isLoading || !t) {
        return (
             <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
                <div className="animate-pulse text-xl text-gray-700 dark:text-gray-300">Loading...</div>
            </div>
        );
    }
    
    const navLinkClasses = "px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700";
    const activeNavLinkClasses = "bg-gray-200 dark:bg-gray-700";
    
    const healthDropdownLinks = (
        <>
            <NavLink to={`/${currentLang}/Pregnancy-Due-Date-Calculator`} className={({ isActive }) => `${navLinkClasses} block w-full text-left ${isActive ? activeNavLinkClasses : ''}`}>{t.navPregnancyCalculator}</NavLink>
            <NavLink to={`/${currentLang}/ovulation-calculator`} className={({ isActive }) => `${navLinkClasses} block w-full text-left ${isActive ? activeNavLinkClasses : ''}`}>{t.navOvulationCalculator}</NavLink>
            <NavLink to={`/${currentLang}/Menstrual-Cycle-Calculator`} className={({ isActive }) => `${navLinkClasses} block w-full text-left ${isActive ? activeNavLinkClasses : ''}`}>{t.navMenstrualCycleCalculator}</NavLink>
            <NavLink to={`/${currentLang}/Calorie-Calculator`} className={({ isActive }) => `${navLinkClasses} block w-full text-left ${isActive ? activeNavLinkClasses : ''}`}>{t.navCalorieCalculator}</NavLink>
        </>
    );

    const timeDropdownLinks = (
        <>
            <NavLink to={`/${currentLang}/age-calculator`} className={({ isActive }) => `${navLinkClasses} block w-full text-left ${isActive ? activeNavLinkClasses : ''}`}>{t.navCalculator}</NavLink>
            <NavLink to={`/${currentLang}/time-Calculator`} className={({ isActive }) => `${navLinkClasses} block w-full text-left ${isActive ? activeNavLinkClasses : ''}`}>{t.navTimeCalculator}</NavLink>
            {languagesWithHoursCalculator.includes(currentLang) && t.navHoursCalculator && (
              <NavLink to={`/${currentLang}/hours-calculator`} className={({ isActive }) => `${navLinkClasses} block w-full text-left ${isActive ? activeNavLinkClasses : ''}`}>{t.navHoursCalculator}</NavLink>
            )}
        </>
    );
    
    const footerRightsText = t.footerRights.replace('{year}', new Date().getFullYear().toString());

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex flex-col">
            <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-50">
                <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center">
                            <Link to={`/${currentLang}`} className="flex-shrink-0 font-bold text-xl text-blue-600 dark:text-blue-400">
                                {t.title}
                            </Link>
                            <div className="hidden md:block">
                                <div className="ml-10 flex items-baseline space-x-4">
                                    <NavLink to={`/${currentLang}`} end className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`}>{t.navHome}</NavLink>
                                    
                                    <div className="relative" ref={desktopTimeDropdownRef}>
                                        <button onClick={() => setIsTimeDropdownOpen(!isTimeDropdownOpen)} className={`${navLinkClasses} flex items-center`}>
                                            {t.navTimeAndDate}
                                            <svg className="ml-1 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                                        </button>
                                        {isTimeDropdownOpen && (
                                            <div className="absolute left-0 mt-2 w-56 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-20">
                                                <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                                                    {timeDropdownLinks}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="relative" ref={desktopHealthDropdownRef}>
                                        <button onClick={() => setIsHealthDropdownOpen(!isHealthDropdownOpen)} className={`${navLinkClasses} flex items-center`}>
                                            {t.navHealthCalculators}
                                            <svg className="ml-1 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                                        </button>
                                        {isHealthDropdownOpen && (
                                            <div className="absolute left-0 mt-2 w-56 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-20">
                                                <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                                                    {healthDropdownLinks}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:block">
                            <LanguageSelector currentLang={currentLang} onLanguageChange={handleLanguageChange} t={t} />
                        </div>
                        <div className="-mr-2 flex md:hidden">
                            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="bg-gray-200 dark:bg-gray-700 inline-flex items-center justify-center p-2 rounded-md text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white">
                                <span className="sr-only">Open main menu</span>
                                {isMobileMenuOpen ? (
                                    <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                ) : (
                                    <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
                                )}
                            </button>
                        </div>
                    </div>
                </nav>

                {isMobileMenuOpen && (
                    <div className="md:hidden">
                        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                            <NavLink to={`/${currentLang}`} end className={({ isActive }) => `block ${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`}>{t.navHome}</NavLink>
                            
                             <div className="relative">
                                <button onClick={() => { setIsTimeDropdownOpen(!isTimeDropdownOpen); setIsHealthDropdownOpen(false); }} className={`w-full text-left flex items-center justify-between ${navLinkClasses}`}>
                                    {t.navTimeAndDate}
                                    <svg className={`ml-1 h-5 w-5 transform transition-transform ${isTimeDropdownOpen ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                                </button>
                                {isTimeDropdownOpen && (
                                    <div className="mt-2 pl-4 space-y-1">
                                        {timeDropdownLinks}
                                    </div>
                                )}
                            </div>

                            <div className="relative">
                                <button onClick={() => { setIsHealthDropdownOpen(!isHealthDropdownOpen); setIsTimeDropdownOpen(false); }} className={`w-full text-left flex items-center justify-between ${navLinkClasses}`}>
                                    {t.navHealthCalculators}
                                    <svg className={`ml-1 h-5 w-5 transform transition-transform ${isHealthDropdownOpen ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                                </button>
                                {isHealthDropdownOpen && (
                                    <div className="mt-2 pl-4 space-y-1">
                                        {healthDropdownLinks}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
                            <div className="px-2">
                                <LanguageSelector currentLang={currentLang} onLanguageChange={handleLanguageChange} t={t} />
                            </div>
                        </div>
                    </div>
                )}
            </header>

            <main className="flex-grow">
                <Outlet context={{ t, currentLang }} />
            </main>

            <footer className="bg-white dark:bg-gray-800 shadow-inner mt-auto">
                <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center text-sm text-gray-500 dark:text-gray-400">
                    <p>{footerRightsText}</p>
                    <div className="flex space-x-4 mt-2 sm:mt-0">
                        <Link to={`/${currentLang}/Privacy-Policy`} className="hover:text-blue-500">{t.footerPrivacyPolicy}</Link>
                        <Link to={`/${currentLang}/About-Us`} className="hover:text-blue-500">{t.navAbout}</Link>
                        <Link to={`/${currentLang}/Contact-Us`} className="hover:text-blue-500">{t.footerContactUs}</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Layout;
