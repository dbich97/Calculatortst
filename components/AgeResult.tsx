
import React, { useState } from 'react';
import type { Age, Translation, AdditionalInfo } from '../types';

interface AgeResultProps {
  age: Age;
  additionalInfo: AdditionalInfo | null;
  t: Translation;
}

const StatCard: React.FC<{ value: number; label: string }> = ({ value, label }) => (
    <div className="flex flex-col items-center justify-center bg-blue-50 dark:bg-blue-900/50 p-4 rounded-lg text-center">
        <span className="text-4xl font-bold text-blue-600 dark:text-blue-400">{value}</span>
        <span className="text-lg text-gray-600 dark:text-gray-300">{label}</span>
    </div>
);

const InfoRow: React.FC<{ icon: React.ReactNode; label: string; value: string | number }> = ({ icon, label, value }) => (
    <li className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
        <div className="flex items-center">
            <span className="mr-3 rtl:mr-0 rtl:ml-3 text-blue-500 dark:text-blue-400">{icon}</span>
            <span className="text-gray-700 dark:text-gray-300">{label}</span>
        </div>
        <span className="font-semibold text-gray-800 dark:text-white">{value}</span>
    </li>
);

const AgeResult: React.FC<AgeResultProps> = ({ age, additionalInfo, t }) => {
    const [isCopied, setIsCopied] = useState(false);

    const shareText = t.shareResultText
      .replace('{years}', age.years.toString())
      .replace('{months}', age.months.toString())
      .replace('{days}', age.days.toString());
    
    const pageUrl = window.location.href;
    const fullShareText = `${shareText}\n\n${pageUrl}`;

    const encodedShareText = encodeURIComponent(shareText);
    const encodedUrl = encodeURIComponent(pageUrl);
    const encodedTitle = encodeURIComponent(t.seoTitle);
    const encodedFullShareText = encodeURIComponent(fullShareText);

    const socialLinks = [
        {
            name: 'Facebook',
            url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedShareText}`,
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v2.385z"/></svg>
            ),
            color: 'hover:bg-blue-600',
        },
        {
            name: 'Twitter',
            url: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedShareText}`,
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
            ),
            color: 'hover:bg-sky-500',
        },
        {
            name: 'LinkedIn',
            url: `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}&summary=${encodedShareText}`,
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z"/></svg>
            ),
            color: 'hover:bg-blue-700',
        },
        {
            name: 'WhatsApp',
            url: `https://api.whatsapp.com/send?text=${encodedFullShareText}`,
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99 0-3.902-.539-5.586-1.54l-6.355 1.654zm.792-6.811l.472.282c1.495.892 3.167 1.373 4.89 1.374 5.454 0 9.917-4.462 9.916-9.916.001-5.454-4.462-9.917-9.917-9.917-5.454 0-9.917 4.462-9.916 9.917.001 1.833.511 3.593 1.428 5.153l.287.488-1.037 3.805 3.805-1.036z"/></svg>
            ),
            color: 'hover:bg-green-500',
        },
    ];

    const copyToClipboard = () => {
        navigator.clipboard.writeText(fullShareText).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        });
    };

    const calendarIcon = <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>;
    const seasonIcon = <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 20A7 7 0 0 1 4 13H2a10 10 0 0 0 10 10z"/><path d="M12 12a10 10 0 0 0 10-10V2z"/></svg>;
    const giftIcon = <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 12 20 22 4 22 4 12"></polyline><rect x="2" y="7" width="20" height="5"></rect><line x1="12" y1="22" x2="12" y2="7"></line><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path></svg>;


  return (
    <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 animate-fade-in">
        <h2 className="text-xl font-semibold text-center text-gray-800 dark:text-gray-200 mb-4">
            {t.resultPrefix}{' '}
            <span className="text-blue-600 dark:text-blue-400">
                {age.years} {t.years}, {age.months} {t.months}, & {age.days} {t.days}
            </span>
            {' '}{t.resultSuffix}
            {t.ageInGregorian && <span className="block text-sm text-gray-500 dark:text-gray-400 mt-1">({t.ageInGregorian})</span>}
        </h2>
        <div className="grid grid-cols-3 gap-4 mt-4">
            <StatCard value={age.years} label={t.years} />
            <StatCard value={age.months} label={t.months} />
            <StatCard value={age.days} label={t.days} />
        </div>

        {additionalInfo && (
            <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4 text-center">{t.moreInfoTitle}</h3>
                <ul className="space-y-3">
                    <InfoRow icon={calendarIcon} label={t.dayOfWeekLabel} value={additionalInfo.dayOfWeek} />
                    <InfoRow icon={seasonIcon} label={t.seasonLabel} value={additionalInfo.season} />
                    <InfoRow icon={giftIcon} label={t.nextBirthdayLabel} value={`${additionalInfo.nextBirthday} ${t.days}`} />
                </ul>
            </div>
        )}

        <div className="mt-8 text-center">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">{t.shareResultTitle}</h3>
            <div className="flex items-center justify-center flex-wrap gap-4">
                {socialLinks.map((link) => (
                    <a
                        key={link.name}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Share result on ${link.name}`}
                        className={`w-12 h-12 flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 ${link.color} hover:text-white transition-colors duration-300`}
                    >
                        {link.icon}
                    </a>
                ))}
                <div className="relative">
                    <button
                        onClick={copyToClipboard}
                        aria-label={t.copyResultButton}
                        className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-500 dark:hover:bg-gray-600 hover:text-white transition-colors duration-300"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>
                    </button>
                    {isCopied && (
                        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md whitespace-nowrap">
                            {t.resultCopiedTooltip}
                        </div>
                    )}
                </div>
            </div>
        </div>
        
        <style>{`
            @keyframes fade-in {
                0% { opacity: 0; transform: translateY(10px); }
                100% { opacity: 1; transform: translateY(0); }
            }
            .animate-fade-in {
                animation: fade-in 0.5s ease-in-out;
            }
        `}</style>
    </div>
  );
};

export default AgeResult;