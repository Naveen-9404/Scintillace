function MainLayout({ children }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-background)', color: 'var(--color-text-primary)' }}>
      <header style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--color-border)' }}>
        <strong>FestSphere</strong>
      </header>
      <main>{children}</main>
    </div>
  );
}

export default MainLayout;
