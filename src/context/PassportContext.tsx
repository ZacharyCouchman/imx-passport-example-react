import { createContext, Dispatch, ReactNode, useEffect, useMemo, useState } from "react";
import { passportInstance } from "../utils/passport";
import { Provider } from "@imtbl/sdk/passport";


interface PassportContextState {
  passportProvider: Provider | null;
  setPassportProvider: Dispatch<React.SetStateAction<Provider | null>>;
}

export const PassportContext = createContext<PassportContextState>({
  passportProvider: null,
  setPassportProvider: () => {},
});

export interface PassportContext {
  children: ReactNode;
}

export function PassportContextProvider({ children }: PassportContext) {
  const [passportProvider, setPassportProvider] = useState<Provider | null>(null);

  useEffect(() => {
    (async () => {
      setPassportProvider(await passportInstance.connectEvm({ announceProvider: false }))
    })()
  }, []);

  const contextValue = useMemo(() => (
    {
      passportProvider,
      setPassportProvider
    }
  ), [passportProvider, setPassportProvider]);

  return (
    <PassportContext.Provider value={contextValue}>
      {children}
    </PassportContext.Provider>
  )
}