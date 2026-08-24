import ThemeProvider from "./ThemeProvider";
import QueryProvider from "./QueryProvider";
import ToastProvider from "./ToastProvider";

import { AuthProvider } from "../context/AuthContext.jsx";

function AppProviders({
  children,
}) {
  return (
    <ThemeProvider>
      <QueryProvider>
        <AuthProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </AuthProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}

export default AppProviders;