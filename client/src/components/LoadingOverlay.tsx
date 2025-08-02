import { Card, CardContent } from "@/components/ui/card";

interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
  submessage?: string;
}

export function LoadingOverlay({ 
  isVisible, 
  message = "Processing with AI...",
  submessage = "This may take a few moments"
}: LoadingOverlayProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardContent className="pt-6 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="font-medium text-foreground mb-2">{message}</p>
          <p className="text-sm text-muted-foreground">{submessage}</p>
        </CardContent>
      </Card>
    </div>
  );
}
