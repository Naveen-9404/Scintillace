import { useMemo, useState } from 'react';
import { ThemeContext } from '../context/ThemeContext';

function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('dark');

  const value = useMemo(() => ({ theme, setTheme }), [theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export default ThemeProvider;
