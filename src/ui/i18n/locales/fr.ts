import type { Translation } from './en';

export const fr: Translation = {
  app: {
    name: 'letsgetfit',
    tagline:
      'Entraînez-vous seul vers votre objectif, avec les exercices que vous maîtrisez et le matériel que vous possédez.',
    loading: 'Chargement…',
    storageUnavailable:
      'letsgetfit ne peut pas enregistrer de données dans ce navigateur. La navigation privée peut bloquer le stockage : essayez une fenêtre normale.',
    saveFailed:
      "Impossible d'enregistrer. Vérifiez que votre navigateur autorise ce site à stocker des données, puis réessayez.",
  },
  language: {
    label: 'Langue',
    en: 'English',
    fr: 'Français',
  },
  common: {
    continue: 'Continuer',
    save: 'Enregistrer',
    saved: 'Enregistré.',
    back: 'Retour',
  },
  onboarding: {
    progress: 'Étape {{current}} sur {{total}}',
  },
  disclaimer: {
    title: 'Avant de commencer',
    notAdvice:
      "letsgetfit donne des conseils généraux d'entraînement et de nutrition. Ce ne sont pas des conseils médicaux, et ils ne remplacent ni un médecin ni un coach qualifié.",
    checkFirst:
      "Consultez un médecin avant de commencer si vous avez un problème de santé ou une blessure, si vous êtes enceinte, ou si vous n'avez pas fait de sport depuis longtemps.",
    stop: 'Arrêtez tout exercice qui provoque une douleur, des vertiges ou un essoufflement.',
    accept: "J'ai compris et j'accepte",
  },
  units: {
    label: 'Unités',
    metric: 'Métriques (kg, cm)',
    imperial: 'Impériales (lb, ft, in)',
    kg: '{{value}} kg',
    lb: '{{value}} lb',
    cm: '{{value}} cm',
    feetInches: '{{feet}} ft {{inches}} in',
  },
  bodyStats: {
    title: 'À propos de vous',
    intro:
      'Votre point de départ, qui sert aussi à estimer vos besoins caloriques.',
    dateOfBirth: 'Date de naissance',
    sex: 'Sexe',
    sexHint: 'Sert uniquement à estimer vos besoins caloriques.',
    male: 'Homme',
    female: 'Femme',
    unspecified: 'Je préfère ne pas le dire',
    height: 'Taille',
    heightCm: 'Taille (cm)',
    heightFeet: 'Pieds',
    heightInches: 'Pouces',
    weightKg: 'Poids (kg)',
    weightLb: 'Poids (lb)',
  },
  training: {
    title: 'Votre entraînement',
    experienceLevel: "Niveau d'expérience",
    beginner: 'Débutant',
    beginnerHint:
      "Nouveau dans l'entraînement, ou de retour après une longue pause",
    intermediate: 'Intermédiaire',
    intermediateHint: "S'entraîne régulièrement depuis 6 mois ou plus",
    advanced: 'Avancé',
    advancedHint: "S'entraîne avec régularité depuis plusieurs années",
    trainingDays: "Jours d'entraînement",
    sessionMinutes: 'Durée des séances',
    minutes: '{{minutes}} min',
  },
  weekdays: {
    monday: 'Lundi',
    tuesday: 'Mardi',
    wednesday: 'Mercredi',
    thursday: 'Jeudi',
    friday: 'Vendredi',
    saturday: 'Samedi',
    sunday: 'Dimanche',
  },
  errors: {
    required: 'Obligatoire.',
    chooseOne: 'Choisissez une option.',
    number: 'Saisissez un nombre.',
    dateOfBirthInvalid: 'Saisissez une date réelle, dans le passé.',
    dateOfBirthTooLow: 'Vous devez avoir au moins {{min}} ans.',
    dateOfBirthTooHigh:
      'Saisissez une date de naissance correspondant à {{max}} ans au plus.',
    heightRange: 'Saisissez une taille entre {{min}} et {{max}}.',
    weightRange: 'Saisissez un poids entre {{min}} et {{max}}.',
    trainingDays: 'Choisissez au moins un jour.',
  },
  home: {
    title: 'Tout est prêt',
    planComing:
      'Votre Plan sera construit à partir de ces informations dans une prochaine version.',
    trainingDays: "Jours d'entraînement",
    sessionMinutes: 'Durée des séances',
    experienceLevel: "Niveau d'expérience",
    editProfile: 'Modifier le profil',
  },
  profile: {
    title: 'Votre profil',
  },
};
