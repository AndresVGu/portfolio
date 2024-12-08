import english from '@/i18n/en.json';
import spanish from '@/i18n/es.json';
import french from '@/i18n/fr.json';

const LANG = {
    ENGLISH: 'en',
    SPANISH: 'es',
    FRENCH: 'fr',
};

export const getI18N = ({ currentLocale= 'en',}:{currentLocale: string | undefined }) => {
    if(currentLocale === LANG.SPANISH) return {...english,...spanish};
    if(currentLocale === LANG.FRENCH) return {...english,...french};
    return english;
}