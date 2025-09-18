
import React from 'react';
import type { SeoSection, LanguageCode } from '../types';

interface SeoContentProps {
  sections: SeoSection[] | undefined;
  lang: LanguageCode;
}

const SeoContent: React.FC<SeoContentProps> = ({ sections, lang }) => {
  const isRtl = ['ar', 'fa'].includes(lang);
  const textAlignClass = isRtl ? 'text-right' : 'text-left';
  const listPaddingClass = isRtl ? 'pr-5' : 'pl-5';

  if (!sections || !Array.isArray(sections)) {
    return null;
  }

  return (
    <article className="mt-12 w-full max-w-2xl mx-auto text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 md:p-10">
      <div className={`prose prose-lg dark:prose-invert max-w-none ${textAlignClass}`}>
        {sections.map((section, index) => (
          section && (
            <section key={index} className="mb-8">
              <h2 
                className="text-2xl font-bold mb-4 border-b-2 border-blue-500 pb-2"
                dangerouslySetInnerHTML={{ __html: section.heading || '' }}
              />
              {section.paragraphs?.map((paragraph, pIndex) => (
                <p
                  key={pIndex}
                  className="text-base leading-relaxed mb-4"
                  dangerouslySetInnerHTML={{ __html: (paragraph || '').replace(/{currentLang}/g, lang) }}
                />
              ))}
              {section.list && (
                <ul className={`list-disc list-inside space-y-2 ${listPaddingClass}`}>
                  {section.list.map((item, lIndex) => (
                    <li 
                      key={lIndex}
                      dangerouslySetInnerHTML={{ __html: item || '' }}
                    />
                  ))}
                </ul>
              )}
            </section>
          )
        ))}
      </div>
    </article>
  );
};

export default SeoContent;