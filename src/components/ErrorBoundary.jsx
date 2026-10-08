import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="container py-5 text-center">
          <div className="card p-4 mx-auto" style={{ maxWidth: '600px' }}>
            <h2>⚠️ Something went wrong</h2>
            <p className="text-muted mt-2">
              An unexpected client error occurred. Please try reloading the page.
            </p>
            <p className="error-details">{this.state.error?.message}</p>
            <button onClick={this.handleReset} className="btn btn-primary mt-3">
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
