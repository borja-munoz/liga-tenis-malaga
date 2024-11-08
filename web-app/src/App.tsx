import { Suspense, useEffect, useState } from "react";
import { useRoutes } from "react-router-dom";
import routes from "./routes";
import { AppContext, DEFAULT_APP_CONTEXT } from "./context";

import { ThemeProvider } from "@emotion/react";
import { CssBaseline } from "@mui/material";
import theme from "./theme";

import { IntlProvider } from "react-intl";
import { messages } from "./i18n/messages";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { loadDB } from "./db/duckdb";
import LoadingMessage from "./components/LoadingMessage";
const queryClient = new QueryClient();

function App() {
  const routing = useRoutes(routes);
  const [dbInitialized, setDbInitialized] = useState(false);

  useEffect(() => {
    const initializeDB = async () => {
      await loadDB();
      setDbInitialized(true);
    };
    initializeDB();
  }, []);

  return (
    <AppContext.Provider
      value={{...DEFAULT_APP_CONTEXT}}
    >
      <ThemeProvider theme={theme}>
        <QueryClientProvider client={queryClient}>
          <IntlProvider
            // @ts-ignore
            messages={messages[DEFAULT_APP_CONTEXT.locale]}
            locale={DEFAULT_APP_CONTEXT.locale}
            defaultLocale={DEFAULT_APP_CONTEXT.locale}
          >
            <CssBaseline />
            {dbInitialized ? (
              <Suspense fallback={<div>...</div>}>{routing}</Suspense>
            ) : (
              <LoadingMessage />
            )}
          </IntlProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </AppContext.Provider>
  );
}

export default App;
