import { type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Layout } from '@/components/layout';
import NotFound from '@/pages/not-found';
import Home from '@/pages/home';
import LessonsPage from '@/pages/lessons';
import LessonPage from '@/pages/lesson';
import ExamplesPage from '@/pages/examples';
import ExamplePage from '@/pages/example';
import VisualizerPage from '@/pages/visualizer';
import ResourcesPage from '@/pages/resources';
import ProgressPage from '@/pages/progress';
import {
  Route,
  Switch,
  useLocation,
  Router as WouterRouter,
} from 'wouter';

const queryClient = new QueryClient();

function Router() {
  return (
    <Layout>
      <RoutedErrorBoundary>
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/lessons" component={LessonsPage} />
          <Route path="/lessons/:slug" component={LessonPage} />
          <Route path="/examples" component={ExamplesPage} />
          <Route path="/examples/:slug" component={ExamplePage} />
          <Route path="/visualizer" component={VisualizerPage} />
          <Route path="/resources" component={ResourcesPage} />
          <Route path="/progress" component={ProgressPage} />
          <Route component={NotFound} />
        </Switch>
      </RoutedErrorBoundary>
    </Layout>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
