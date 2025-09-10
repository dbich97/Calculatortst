import React from 'react';
import { useOutletContext } from 'react-router-dom';
import type { Translation, LanguageCode } from '../types';
import { usePageMetadata } from '../lib/hooks';

interface PageContext {
  t: Translation;
  currentLang: LanguageCode;
}

const PrivacyPolicyPage: React.FC = () => {
  const { t } = useOutletContext<PageContext>();

  usePageMetadata(t.privacyTitle);

  return (
    <main className="w-full max-w-3xl mx-auto px-4 py-8 md:py-12">
      <article className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 md:p-10">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-6 text-center">
          {t.privacyTitle}
        </h1>
        <div className="prose prose-lg dark:prose-invert max-w-none text-gray-700 dark:text-gray-300">
          <p className="lead text-center mb-8">{t.privacyHeading}</p>
          {t.privacyContent.map((section, index) => (
            <section key={index} className="mb-6">
              <h2 className="text-2xl font-semibold">{section.heading}</h2>
              {section.paragraphs.map((paragraph, pIndex) => (
                 <p key={pIndex}>{paragraph}</p>
              ))}
            </section>
          ))}
        </div>
      </article>
    </main>
  );
};

export default PrivacyPolicyPage;