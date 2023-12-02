import { Component, ErrorInfo, ReactNode } from "react";
import { TbFaceIdError } from "react-icons/tb";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error): ErrorBoundaryState {
    console.log(_);
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error(error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      <div style={{ textAlign: "center", marginTop: "3rem" }}>
        <TbFaceIdError size={60} />
        <h1
          style={{
            marginBottom: "1.5rem",
            fontSize: "1.25rem",
            fontWeight: 600,
          }}
        >
          Oops. Something went very wrong.
        </h1>
        <button
          onClick={() => location.reload()}
          style={{
            height: "2.5rem",
            width: "6rem",
            border: "1px solid #3490dc",
            backgroundColor: "#3490dc",
            color: "#ffffff",
            cursor: "pointer",
            transition: "background-color 0.3s ease-in-out",
          }}
        >
          RETRY
        </button>
      </div>;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
