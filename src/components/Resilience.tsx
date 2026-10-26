import { Component, useEffect, useState, type ReactNode } from 'react';

import { Button, Card, LoadingState } from './UI';
export class PageErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? <div className="auth-page"><Card className="auth-card"><h1>We couldn’t open this view.</h1><p>Your saved work is still on this device. Reload to try again.</p><Button onClick={() => window.location.reload()}>Reload page</Button><p><a href="#/dashboard" onClick={() => this.setState({ failed: false })}>Return to dashboard</a></p></Card></div> : this.props.children; }
}
export function LoadingPreview({ children }: { children: ReactNode }) {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { setLoaded(false); const t = setTimeout(() => setLoaded(true), 120); return () => clearTimeout(t); }, []);
  return loaded ? <>{children}</> : <div className="route-loading"><LoadingState label="Opening your learning space…"/><div className="skeleton-grid" aria-hidden="true"><i/><i/><i/></div></div>;
}

