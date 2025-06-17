import Flag from 'react-world-flags';

import { languageToCountryCode } from './data';

const CountriesFlags = ({ languages }: { languages: string[] }) => {
  return (
    <div className="flex items-center gap-1">
      {languages.map((lang, index) => {
        const code = languageToCountryCode[lang];

        if (!code) return <span key={index}>🌐</span>;

        return (
          <div key={index} className="flex items-center h-6">
            <Flag code={code} className="w-6" />
          </div>
        );
      })}
    </div>
  );
};

export { CountriesFlags };
