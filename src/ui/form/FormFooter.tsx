import { useTranslation } from 'react-i18next';
import type { SubmitStatus } from './useSubmitStatus';

interface FormFooterProps {
  submitLabel: string;
  status: SubmitStatus;
  /** Show "Saved." after a successful save; off when the form is replaced by the next step. */
  confirmSaved?: boolean;
  disabled?: boolean;
}

export function FormFooter({
  submitLabel,
  status,
  confirmSaved = false,
  disabled = false,
}: FormFooterProps) {
  const { t } = useTranslation();

  return (
    <div className="form__footer">
      <button
        type="submit"
        className="button"
        disabled={disabled || status === 'saving'}
      >
        {submitLabel}
      </button>
      {confirmSaved && status === 'saved' && (
        <p role="status" className="form__saved">
          {t('common.saved')}
        </p>
      )}
      {status === 'failed' && (
        <p role="alert" className="field__error">
          {t('app.saveFailed')}
        </p>
      )}
    </div>
  );
}
