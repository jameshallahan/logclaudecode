import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-6">
          <div className="w-full max-w-sm text-center">
            <h1 className="text-lg font-semibold text-text mb-2">Something went wrong</h1>
            <p className="text-sm text-text-muted mb-6">
              {this.state.error?.message || 'An unexpected error occurred.'}
            </p>
            <button
              onClick={this.handleReset}
              className="w-full h-12 bg-white text-bg font-semibold rounded-xl hover:bg-[#E0E0E0] active:scale-[0.98] transition-all mb-3"
            >
              Try again
            </button>
            <button
              onClick={() => window.location.reload()}
              className="w-full h-10 text-text-muted text-sm hover:text-text transition-colors"
            >
              Reload app
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
