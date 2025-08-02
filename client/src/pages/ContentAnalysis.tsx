import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QAInterface } from "@/components/QAInterface";
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Download, 
  Share, 
  FileText, 
  Film,
  List
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ContentAnalysisProps {
  sessionId: string;
  onBack: () => void;
}

export function ContentAnalysis({ sessionId, onBack }: ContentAnalysisProps) {
  const { data: session, isLoading, error } = useQuery({
    queryKey: ["/api/sessions", sessionId],
  });

  const getFileIcon = (type: string) => {
    switch (type) {
      case "youtube":
        return <Film className="h-6 w-6 text-red-600" />;
      case "pdf":
        return <FileText className="h-6 w-6 text-blue-600" />;
      default:
        return <FileText className="h-6 w-6 text-green-600" />;
    }
  };

  const getFileIconBg = (type: string) => {
    switch (type) {
      case "youtube":
        return "bg-red-100 dark:bg-red-900";
      case "pdf":
        return "bg-blue-100 dark:bg-blue-900";
      default:
        return "bg-green-100 dark:bg-green-900";
    }
  };

  const handleRename = () => {
    // TODO: Implement rename functionality
    console.log("Rename content");
  };

  const handleDelete = () => {
    // TODO: Implement delete functionality
    console.log("Delete content");
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log("Export session");
  };

  const handleShare = () => {
    // TODO: Implement share functionality
    console.log("Share session");
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-32 bg-muted rounded"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-destructive mb-4">Failed to load session</p>
            <Button onClick={onBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const parsedSummary = (session as any)?.summary ? JSON.parse((session as any).summary) : null;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Content Header */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start space-x-4">
              <div className={`p-3 rounded-lg ${getFileIconBg((session as any)?.source?.type)}`}>
                {getFileIcon((session as any)?.source?.type)}
              </div>
              <div>
                <h1 className="text-2xl font-bold">
                  {(session as any)?.source?.title || "Untitled"}
                </h1>
                <p className="text-muted-foreground">
                  {formatDistanceToNow(new Date((session as any)?.createdAt), { addSuffix: true })}
                  {(session as any)?.source?.metadata && (
                    <>
                      {" • "}
                      {(session as any)?.source?.type === "youtube" 
                        ? (session as any)?.source?.metadata?.duration || "Video"
                        : `${(session as any)?.source?.metadata?.wordCount || 0} words`
                      }
                    </>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="icon" onClick={handleRename}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleDelete}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Section */}
      {parsedSummary && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <List className="mr-3 text-primary" />
              AI Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose dark:prose-invert max-w-none">
              {parsedSummary.summary && (
                <p className="mb-4">{parsedSummary.summary}</p>
              )}
              
              {parsedSummary.keyPoints && parsedSummary.keyPoints.length > 0 && (
                <ul className="space-y-2">
                  {parsedSummary.keyPoints.map((point: string, index: number) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="text-primary mt-1 font-bold">•</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Q&A Interface */}
      <QAInterface sessionId={sessionId} qas={(session as any)?.qas || []} />

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 mt-6">
        <Button variant="outline" onClick={handleExport}>
          <Download className="mr-2 h-4 w-4" />
          Export Session
        </Button>
        <Button variant="outline" onClick={handleShare}>
          <Share className="mr-2 h-4 w-4" />
          Share
        </Button>
        <Button onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
}
