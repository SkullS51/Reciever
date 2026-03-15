import React, { Component, ErrorInfo, ReactNode } from 'react';
import { safeStringify } from '../services/utils';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("AZRAEL_UNCAUGHT_ERROR:", safeStringify(error), safeStringify(errorInfo));
    this.setState({ errorInfo });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black flex items-center justify-center p-6 font-mono">
          <div className="max-w-4xl w-full border border-red-900 bg-red-950/10 p-8 space-y-6">
            <div className="flex items-center gap-4 text-red-500">
              <div className="h-4 w-4 bg-red-500 animate-pulse"></div>
              <h1 className="text-xl font-black uppercase tracking-[0.3em]">SYSTEM_CRITICAL_FAILURE</h1>
            </div>
            
            <div className="space-y-4">
              <p className="text-gray-400 text-sm leading-relaxed">
                The Azrael protocol has encountered an unrecoverable state. Void synchronization lost.
              </p>
              
              <div className="bg-black/50 border border-red-900/30 p-4 overflow-auto max-h-[400px]">
                <pre className="text-xs text-red-400 whitespace-pre-wrap">
                  {this.state.error?.name}: {this.state.error?.message}
                  {"\n\n"}
                  STACK_TRACE:
                  {"\n"}
                  {this.state.error?.stack}
                  {"\n\n"}
                  COMPONENT_STACK:
                  {"\n"}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </div>
            </div>

            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-red-900 text-white font-black uppercase tracking-widest hover:bg-red-800 transition-all"
            >
              REBOOT_SYSTEM
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
