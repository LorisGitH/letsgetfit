import { useId, useState, type SubmitEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { FormFooter } from '../form/FormFooter';
import { useSubmitStatus } from '../form/useSubmitStatus';

interface DisclaimerStepProps {
  onAccept: () => Promise<void>;
}

export function DisclaimerStep({ onAccept }: DisclaimerStepProps) {
  const { t } = useTranslation();
  const headingId = useId();
  const [accepted, setAccepted] = useState(false);
  const { status, run } = useSubmitStatus();

  const submit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (accepted) await run(onAccept);
  };

  return (
    <form
      className="form"
      aria-labelledby={headingId}
      onSubmit={(event) => {
        void submit(event);
      }}
    >
      <h2 id={headingId}>{t('disclaimer.title')}</h2>
      <p>{t('disclaimer.notAdvice')}</p>
      <p>{t('disclaimer.checkFirst')}</p>
      <p>{t('disclaimer.stop')}</p>
      <label className="choice">
        <input
          type="checkbox"
          checked={accepted}
          onChange={(event) => {
            setAccepted(event.target.checked);
          }}
        />
        <span className="choice__label">{t('disclaimer.accept')}</span>
      </label>
      <FormFooter
        submitLabel={t('common.continue')}
        status={status}
        disabled={!accepted}
      />
    </form>
  );
}
