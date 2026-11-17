import { useTranslation } from 'react-i18next';

interface CatalogueCreditProps {
  repository: string;
}

/** Credits free-exercise-db, the Catalogue's public-domain source (ADR 0003). */
export function CatalogueCredit({ repository }: CatalogueCreditProps) {
  const { t } = useTranslation();
  return (
    <p className="catalogue__credit">
      {t('catalogue.credit')}{' '}
      <a href={repository} target="_blank" rel="noreferrer">
        free-exercise-db
      </a>{' '}
      {t('catalogue.creditLicence')}
    </p>
  );
}
