import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Inventory } from '../../domain/inventory/inventory';
import {
  EMPTY_REPERTOIRE,
  repertoireSize,
  toggled,
  type Repertoire,
} from '../../domain/repertoire/repertoire';
import { CatalogueScreen } from '../catalogue/CatalogueScreen';
import { useSubmitStatus } from '../form/useSubmitStatus';

interface RepertoireStepProps {
  inventory: Inventory;
  stored: Repertoire | undefined;
  onContinue: (repertoire: Repertoire) => Promise<void>;
}

/**
 * Onboarding's last step. Picks are kept here until Continue, so ticking the first
 * exercise doesn't end onboarding. Not a form: Enter in the search must not submit it.
 */
export function RepertoireStep({
  inventory,
  stored,
  onContinue,
}: RepertoireStepProps) {
  const { t } = useTranslation();
  const headingId = useId();
  const [repertoire, setRepertoire] = useState(stored ?? EMPTY_REPERTOIRE);
  const [empty, setEmpty] = useState(false);
  const { status, run } = useSubmitStatus();

  const finish = () => {
    if (repertoireSize(repertoire) === 0) {
      setEmpty(true);
      return;
    }
    void run(() => onContinue(repertoire));
  };

  return (
    <section className="form" aria-labelledby={headingId}>
      <h2 id={headingId}>{t('repertoire.title')}</h2>
      <p className="form__intro">{t('repertoire.intro')}</p>
      <CatalogueScreen
        picking
        inventory={inventory}
        repertoire={repertoire}
        onToggleRepertoire={(ref) => {
          setRepertoire((current) => toggled(current, ref));
          setEmpty(false);
        }}
      />
      <div className="form__footer">
        <button
          type="button"
          className="button"
          disabled={status === 'saving'}
          onClick={finish}
        >
          {t('common.continue')}
        </button>
        {empty && (
          <p role="alert" className="field__error">
            {t('repertoire.pickOne')}
          </p>
        )}
        {status === 'failed' && (
          <p role="alert" className="field__error">
            {t('app.saveFailed')}
          </p>
        )}
      </div>
    </section>
  );
}
