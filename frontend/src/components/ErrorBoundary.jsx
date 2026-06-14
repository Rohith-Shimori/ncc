import React from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // In production, you would send this to Sentry or a logging service
    console.error("Production Error Caught:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.variant === 'inline') {
        return (
          <div className="w-full max-w-2xl mx-auto p-4 md:p-6 text-center animate-fadeIn">
            <div className="ncc-glass-card p-6 md:p-8 border border-red-200 bg-red-50/10">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-navy-900 mb-2">Failed to load this section</h2>
              <p className="text-surface-600 mb-6 text-sm">
                An unexpected error occurred while loading this page. You can try reloading or navigating to another section.
              </p>
              <div className="flex justify-center gap-3">
                <button 
                  onClick={() => window.location.reload()}
                  className="ncc-btn ncc-btn-primary px-5 py-2 text-xs flex items-center justify-center"
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                  Reload Page
                </button>
                <button 
                  onClick={() => this.setState({ hasError: false, error: null })}
                  className="ncc-btn ncc-btn-ghost px-5 py-2 text-xs"
                >
                  Clear Error
                </button>
              </div>
              {this.state.error && (
                <div className="mt-6 p-4 bg-red-50/50 rounded-lg text-left overflow-auto max-h-32 border border-red-100">
                  <p className="text-xs font-mono text-red-800 break-words">
                    {this.state.error?.toString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        );
      }

      return (
        <div className="min-h-screen bg-surface-50 flex items-center justify-center p-4">
          <div className="ncc-glass-card max-w-md w-full p-8 text-center animate-fadeIn">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-10 h-10 text-red-600" />
            </div>
            
            <h1 className="text-2xl font-bold text-navy-900 mb-2">Something went wrong</h1>
            <p className="text-surface-600 mb-8 text-sm">
              An unexpected error occurred. We've been notified and are looking into it.
            </p>

            <div className="flex flex-col gap-3">
              <button 
                onClick={() => window.location.reload()}
                className="ncc-btn ncc-btn-primary w-full flex items-center justify-center"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reload Page
              </button>
              
              <button 
                onClick={this.handleReset}
                className="ncc-btn ncc-btn-ghost w-full flex items-center justify-center"
              >
                <Home className="w-4 h-4 mr-2" />
                Back to Safety
              </button>
            </div>

            <div className="mt-8 p-4 bg-red-50 rounded-lg text-left overflow-auto max-h-40">
              <p className="text-xs font-mono text-red-800 break-words">
                {this.state.error?.toString()}
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
