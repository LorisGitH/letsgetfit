import { useEffect, useState } from 'react';
import {
  loadCatalogue,
  type Catalogue,
} from '../../domain/catalogue/catalogue';

export type CatalogueState =
  | { status: 'loading' }
  | { status: 'failed' }
  | { status: 'ready'; catalogue: Catalogue };

/** Loads the Catalogue's data the first time the browser is opened. */
export function useCatalogue(): CatalogueState {
  const [state, setState] = useState<CatalogueState>({ status: 'loading' });

  useEffect(() => {
    let active = true;
    loadCatalogue().then(
      (catalogue) => {
        if (active) setState({ status: 'ready', catalogue });
      },
      () => {
        if (active) setState({ status: 'failed' });
      },
    );
    return () => {
      active = false;
    };
  }, []);

  return state;
}
