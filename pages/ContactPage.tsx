import React from 'react';
import { useOutletContext } from 'react-router-dom';
import type { Translation, LanguageCode } from '../types';
import { usePageMetadata } from '../lib/hooks';

interface PageContext {
  t: Translation;
  currentLang: LanguageCode;
}

const ContactPage: React.FC = () => {
  const { t } = useOutletContext<PageContext>();

  usePageMetadata(t.contactTitle);

  return (
    <main className="w-full max-w-3xl mx-auto px-4 py-8 md:py-12">
      <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 md:p-10 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-4">
          {t.contactHeading}
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8">
          {t.contactIntro}
        </p>
        <div className="mt-6">
          <a
            href={`mailto:${t.contactEmail}`}
            className="inline-block bg-blue-600 text-white font-bold text-lg px-8 py-3 rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 transition-colors"
          >
            {t.contactEmail}
          </a>
        </div>
      </section>
    </main>
  );
};

export default ContactPage;