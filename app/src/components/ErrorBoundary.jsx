import { Component } from 'react';

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-dark-950 text-dark-100 p-8">
                    <div className="glass-card rounded-2xl p-8 max-w-md text-center">
                        <div className="text-6xl mb-4">💥</div>
                        <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
                        <p className="text-dark-400 mb-6">{this.state.error?.message || 'An unexpected error occurred'}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-6 py-3 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-medium transition-colors"
                        >
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
