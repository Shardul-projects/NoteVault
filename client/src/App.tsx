import { useState, useEffect } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

// Components
import { NavigationHeader } from "@/components/NavigationHeader";
import { AuthModal } from "@/components/AuthModal";
import { LoadingOverlay } from "@/components/LoadingOverlay";

// Pages
import { Landing } from "@/pages/Landing";
import { Dashboard } from "@/pages/Dashboard";
import { ContentAnalysis } from "@/pages/ContentAnalysis";
import { History } from "@/pages/History";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [currentView, setCurrentView] = useState<"dashboard" | "analysis" | "history">("dashboard");
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const { toast } = useToast();

  // Handle unauthorized errors globally
  useEffect(() => {
    const handleUnauthorizedError = (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
      }
    };

    // This is a simplified global error handler
    // In a real app, you'd set this up properly with React Query's error boundaries
    window.addEventListener('unhandledrejection', (event) => {
      if (event.reason instanceof Error) {
        handleUnauthorizedError(event.reason);
      }
    });

    return () => {
      window.removeEventListener('unhandledrejection', () => {});
    };
  }, [toast]);

  const handleViewSession = (sessionId: string) => {
    setSelectedSessionId(sessionId);
    setCurrentView("analysis");
  };

  const handleBackToDashboard = () => {
    setCurrentView("dashboard");
    setSelectedSessionId(null);
  };

  const handleViewHistory = () => {
    setCurrentView("history");
  };

  if (isLoading) {
    return <LoadingOverlay isVisible={true} message="Loading..." submessage="Please wait" />;
  }

  return (
    <div className="min-h-screen bg-background">
      <NavigationHeader onLoginClick={() => setShowAuthModal(true)} />
      
      <Switch>
        <Route path="/">
          {!isAuthenticated ? (
            <Landing onLoginClick={() => setShowAuthModal(true)} />
          ) : (
            <>
              {currentView === "dashboard" && (
                <Dashboard 
                  onViewSession={handleViewSession}
                  onViewHistory={handleViewHistory}
                />
              )}
              
              {currentView === "analysis" && selectedSessionId && (
                <ContentAnalysis
                  sessionId={selectedSessionId}
                  onBack={handleBackToDashboard}
                />
              )}
              
              {currentView === "history" && (
                <History
                  onBack={handleBackToDashboard}
                  onViewSession={handleViewSession}
                />
              )}
            </>
          )}
        </Route>
        
        {/* Fallback to 404 */}
        <Route component={NotFound} />
      </Switch>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
