import { createContext } from 'react';
import { LOCALES } from './i18n/locales';
import { AppMessage } from './components/ModalMessage';

export interface AppContextProps {
  locale: string;
  modalMessage: AppMessage | null;
  setModalMessage: (message: AppMessage | null) => void;
}

export const DEFAULT_APP_CONTEXT = {
  locale: LOCALES.SPANISH, 
  modalMessage: null,
  setModalMessage: () => {},
};

export const AppContext = createContext<AppContextProps>(DEFAULT_APP_CONTEXT);