import { Outlet } from "react-router";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import ErrorBoundary from "./components/ErrorBoundary";
import ToastProvider from "./components/Toast";

export function Root() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1">
            <Outlet />
          </main>
          <Footer />
        </div>
      </ToastProvider>
    </ErrorBoundary>
  );
}
