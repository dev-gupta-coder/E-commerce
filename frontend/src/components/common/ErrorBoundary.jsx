import { Component } from "react";
class ErrorBoundary extends Component {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) return <div className="flex h-screen items-center justify-center flex-col gap-4"><h1 className="text-2xl font-bold">Something went wrong.</h1><button onClick={() => window.location.reload()} className="px-4 py-2 bg-primary text-white rounded">Reload</button></div>;
    return this.props.children;
  }
}
export default ErrorBoundary;
