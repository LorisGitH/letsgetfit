import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useTranslation } from 'react-i18next';
import { NEW_ATHLETE, type Athlete } from '../../domain/athlete/athlete';
import type { AthleteRepository } from '../../domain/athlete/athleteRepository';
import { AthleteContext } from './athleteContext';

type Loaded =
  | { status: 'loading' }
  | { status: 'failed' }
  | { status: 'ready'; athlete: Athlete };

interface AthleteProviderProps {
  repository: AthleteRepository;
  children: ReactNode;
}

/** Loads the Athlete from the device and renders its children once it is available. */
export function AthleteProvider({
  repository,
  children,
}: AthleteProviderProps) {
  const { t } = useTranslation();
  const [loaded, setLoaded] = useState<Loaded>({ status: 'loading' });

  useEffect(() => {
    let active = true;
    repository.load().then(
      (athlete) => {
        if (active)
          setLoaded({ status: 'ready', athlete: athlete ?? NEW_ATHLETE });
      },
      () => {
        if (active) setLoaded({ status: 'failed' });
      },
    );
    return () => {
      active = false;
    };
  }, [repository]);

  const save = useCallback(
    async (athlete: Athlete) => {
      await repository.save(athlete);
      setLoaded({ status: 'ready', athlete });
    },
    [repository],
  );

  const state = useMemo(
    () =>
      loaded.status === 'ready' ? { athlete: loaded.athlete, save } : undefined,
    [loaded, save],
  );

  if (loaded.status === 'loading')
    return <p role="status">{t('app.loading')}</p>;
  if (state === undefined)
    return <p role="alert">{t('app.storageUnavailable')}</p>;
  return <AthleteContext value={state}>{children}</AthleteContext>;
}
