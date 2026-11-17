export const en = {
  app: {
    name: 'letsgetfit',
    tagline:
      'Train solo towards your goal, with the exercises you know and the equipment you own.',
  },
  language: {
    label: 'Language',
    en: 'English',
    fr: 'Français',
  },
};

/** Every locale must provide exactly the keys of the English source. */
export type Translation = typeof en;
