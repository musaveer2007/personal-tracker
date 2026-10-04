import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  errorMsg: string;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    errorMsg: ''
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, errorMsg: error.message };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center">
          <div className="max-w-md w-full bg-surface border border-border p-8 rounded-2xl shadow-xl">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-6" />
            <h1 className="text-2xl font-black text-textMain tracking-wide mb-2 uppercase">Something went wrong</h1>
            <p className="text-sm text-textMuted mb-8">
              We encountered an unexpected error. Don't worry, your data is safe.
            </p>
            <Link 
              to="/" 
              className="inline-flex items-center justify-center space-x-2 bg-primary text-black font-bold uppercase tracking-wider px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors w-full"
              onClick={() => this.setState({ hasError: false, errorMsg: '' })}
            >
              <Home className="w-5 h-5" />
              <span>Return Home</span>
            </Link>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
