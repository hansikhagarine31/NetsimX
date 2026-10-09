import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('NetsimX Application Error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
          <div className="max-w-xl w-full bg-slate-900 border border-rose-800/80 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400 font-bold text-lg border-b border-slate-800 pb-3">
              <span>⚠️</span>
              <span>NetsimX Runtime Error Caught</span>
            </div>
            <p className="text-xs text-slate-300">
              An unexpected error occurred during rendering:
            </p>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-xs text-rose-300 overflow-x-auto whitespace-pre-wrap">
              {this.state.error?.toString()}
            </div>
            {this.state.errorInfo?.componentStack && (
              <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 font-mono text-[10px] text-slate-400 max-h-48 overflow-y-auto whitespace-pre-wrap">
                {this.state.errorInfo.componentStack}
              </div>
            )}
            <button
              onClick={() => window.location.reload()}
              className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all shadow-md"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
