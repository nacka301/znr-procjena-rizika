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
        <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
          <div className="w-full max-w-[460px] rounded-[10px] border border-slate-200 bg-white p-6 text-center">
            <h1>Došlo je do greške</h1>
            <p className="mt-2 text-[13px] leading-relaxed text-slate-600">
              Prototip je naišao na neočekivanu grešku u prikazu, najvjerojatnije zbog zastarjelih
              podataka spremljenih u ovom pregledniku iz ranije verzije alata.
            </p>
            <button
              type="button"
              onClick={this.handlePocisti}
              className="mt-4 inline-flex h-9 items-center justify-center rounded-md bg-[var(--color-accent)] px-3 text-[13px] font-medium text-white hover:bg-[var(--color-accent-hover)]"
            >
              Počisti spremljene podatke i počni novu
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
