import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { localized, type Exercise } from '../../domain/catalogue/exercise';
import { contentLanguage, imageUrl } from './contentLanguage';

interface ExerciseDetailProps {
  exercise: Exercise;
  inRepertoire: boolean;
  onToggleRepertoire: () => void;
  onBack: () => void;
}

export function ExerciseDetail({
  exercise,
  inRepertoire,
  onToggleRepertoire,
  onBack,
}: ExerciseDetailProps) {
  const { t, i18n } = useTranslation();
  const instructionsId = useId();
  const language = contentLanguage(i18n.language);
  const name = localized(exercise.name, language);

  return (
    <article className="exercise">
      <button type="button" className="button button--quiet" onClick={onBack}>
        {t('catalogue.backToList')}
      </button>
      <h2>{name}</h2>
      <button
        type="button"
        className={inRepertoire ? 'button button--quiet' : 'button'}
        onClick={onToggleRepertoire}
      >
        {t(inRepertoire ? 'repertoire.remove' : 'repertoire.add')}
      </button>

      {exercise.images.length > 0 && (
        <div className="exercise__images">
          {exercise.images.map((image, index) => (
            <img
              key={image}
              src={imageUrl(image)}
              alt={t('catalogue.imageAlt', { name, step: index + 1 })}
              width={600}
              height={400}
              loading="lazy"
              decoding="async"
            />
          ))}
        </div>
      )}

      <dl className="summary">
        <dt>{t('catalogue.primaryMuscles')}</dt>
        <dd>
          {exercise.primaryMuscles
            .map((muscle) => t(`muscles.${muscle}`))
            .join(', ')}
        </dd>
        {exercise.secondaryMuscles.length > 0 && (
          <>
            <dt>{t('catalogue.secondaryMuscles')}</dt>
            <dd>
              {exercise.secondaryMuscles
                .map((muscle) => t(`muscles.${muscle}`))
                .join(', ')}
            </dd>
          </>
        )}
        <dt>{t('catalogue.strainedJoints')}</dt>
        <dd>
          {exercise.strainedJoints.length > 0
            ? exercise.strainedJoints
                .map((joint) => t(`joints.${joint}`))
                .join(', ')
            : t('catalogue.noJointStrain')}
        </dd>
        <dt>{t('catalogue.requiredEquipment')}</dt>
        <dd>
          {exercise.requiredEquipment.length > 0
            ? exercise.requiredEquipment
                .map((item) => t(`equipment.${item}`))
                .join(', ')
            : t('catalogue.noEquipmentNeeded')}
        </dd>
        {exercise.optionalEquipment.length > 0 && (
          <>
            <dt>{t('catalogue.optionalEquipment')}</dt>
            <dd>
              {exercise.optionalEquipment
                .map((item) => t(`equipment.${item}`))
                .join(', ')}
            </dd>
          </>
        )}
        <dt>{t('catalogue.level')}</dt>
        <dd>{t(`training.${exercise.level}`)}</dd>
      </dl>

      <h3 id={instructionsId}>{t('catalogue.instructions')}</h3>
      <ol aria-labelledby={instructionsId} className="exercise__steps">
        {localized(exercise.instructions, language).map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
    </article>
  );
}
