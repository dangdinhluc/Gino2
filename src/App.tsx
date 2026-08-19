import { AppRouter } from '@/src/app/router';
import { AppErrorBoundary } from '@/src/app/components/AppErrorBoundary';

export default function App() {
  return <AppErrorBoundary><AppRouter /></AppErrorBoundary>;
}
