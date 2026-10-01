import { Component, type ReactNode } from "react";
import { STORE_NAME } from "../state/store";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown, info: { componentStack: string }) {
    console.error("Neuhvaćena greška u aplikaciji:", error, info.componentStack);
  }

  handlePocisti = () => {
    try {
      localStorage.removeItem(STORE_NAME);
    } catch {
      // localStorage nedostupan (privatni način rada i sl.) - nastavi na reload
    }
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ maxWidth: 480, margin: "80px auto", textAlign: "center", padding: 24 }}>
          <h1>Došlo je do greške</h1>
          <p className="hint">
            Prototip je naišao na neočekivanu grešku u prikazu, najvjerojatnije zbog zastarjelih
            podataka spremljenih u ovom pregledniku iz ranije verzije alata.
          </p>
          <button className="btn btn-primary" onClick={this.handlePocisti}>
            Počisti spremljene podatke i počni novu
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
