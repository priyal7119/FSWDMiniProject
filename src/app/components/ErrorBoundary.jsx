import { Component } from "react";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details for debugging
    console.error("Error caught by boundary:", error, errorInfo);

    this.setState((prevState) => ({
      error,
      errorInfo,
      errorCount: prevState.errorCount + 1,
    }));

    // Optional: Send error to logging service
    // logErrorToService(error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleGoHome = () => {
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      const isDevelopment = import.meta.env.DEV;

      return (
        <div className="min-h-screen bg-[var(--mapout-bg)] flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-white rounded-[10px] shadow-lg p-8">
            {/* Error Icon */}
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-red-100 rounded-full">
                <AlertTriangle size={40} className="text-red-600" />
              </div>
            </div>

            {/* Error Title */}
            <h1 className="text-2xl font-bold text-center mb-2 text-gray-800">
              Oops! Something went wrong
            </h1>

            {/* Error Description */}
            <p className="text-center text-gray-600 mb-6">
              We encountered an unexpected error. Please try refreshing the page or contact support if the problem persists.
            </p>

            {/* Error Details (Development Only) */}
            {isDevelopment && this.state.error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-xs font-bold text-red-800 mb-2">ERROR DETAILS (Dev Only):</p>
                <details className="text-xs text-red-700 overflow-auto max-h-48">
                  <summary className="cursor-pointer font-semibold mb-2">
                    {this.state.error.toString()}
                  </summary>
                  <pre className="whitespace-pre-wrap break-words text-gray-700">
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </details>
              </div>
            )}

            {/* Error Metadata */}
            <div className="mb-6 bg-gray-50 rounded-lg p-4 text-xs text-gray-600 text-center">
              <p>Error count this session: <span className="font-bold">{this.state.errorCount}</span></p>
              <p className="mt-1">Time: {new Date().toLocaleTimeString()}</p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={this.handleReset}
                className="w-full bg-[var(--mapout-primary)] text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                aria-label="Try again"
              >
                <RefreshCw size={18} />
                Try Again
              </button>

              <button
                onClick={this.handleGoHome}
                className="w-full bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-all flex items-center justify-center gap-2"
                aria-label="Go to home page"
              >
                <Home size={18} />
                Go to Home
              </button>
            </div>

            {/* Support Text */}
            <p className="text-center text-xs text-gray-500 mt-6">
              If you continue to experience issues, please contact{" "}
              <a href="mailto:support@mapout.com" className="text-[var(--mapout-primary)] hover:underline">
                support@mapout.com
              </a>
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
