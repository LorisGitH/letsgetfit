import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import {
  localized,
  type ContentLanguage,
  type Exercise,
} from '../../domain/catalogue/exercise';
import { imageUrl } from './contentLanguage';

interface ExerciseCardProps {
  exercise: Exercise;
  language: ContentLanguage;
  inRepertoire: boolean;
  onOpen: () => void;
  onToggleRepertoire: () => void;
}

export function ExerciseCard({
  exercise,
  language,
  inRepertoire,
  onOpen,
  onToggleRepertoire,
}: ExerciseCardProps) {
  const { t } = useTranslation();
  const id = useId();
  const name = localized(exercise.name, language);
  const thumbnail = exercise.images[0];

  return (
    <li className="exercise-card-item">
      <button
        type="button"
        className="exercise-card"
        aria-labelledby={`${id}-name`}
        aria-describedby={`${id}-muscles`}
        onClick={onOpen}
      >
        {thumbnail === undefined ? (
          <span className="exercise-card__image exercise-card__image--empty" />
        ) : (
          <img
            className="exercise-card__image"
            src={imageUrl(thumbnail)}
            alt=""
            width={600}
            height={400}
            loading="lazy"
            decoding="async"
          />
        )}
        <span id={`${id}-name`} className="exercise-card__name">
          {name}
        </span>
        <span id={`${id}-muscles`} className="exercise-card__muscles">
          {exercise.kind === 'cardio'
            ? t('catalogue.cardio')
            : exercise.primaryMuscles
                .map((value) => t(`muscles.${value}`))
                .join(', ')}
        </span>
      </button>
      <label className="exercise-card__mine">
        <input
          type="checkbox"
          checked={inRepertoire}
          onChange={onToggleRepertoire}
        />
        <span className="visually-hidden">
          {t('repertoire.toggle', { name })}
        </span>
      </label>
    </li>
  );
}
