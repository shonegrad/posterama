import { ImageProcessor } from "./components/ImageProcessor";
import { Toaster } from "./components/ui/sonner";
import { ErrorBoundary } from "./components/ErrorBoundary";

export default function App() {
  return (
    <div className="min-h-screen surface-container-lowest">
      <ErrorBoundary>
        <ImageProcessor />
        <Toaster />
      </ErrorBoundary>
    </div>
  );
}