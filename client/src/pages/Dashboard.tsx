import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/FileUpload";
import { 
  Clock, 
  Folder, 
  MessageCircle, 
  TrendingUp, 
  FileText, 
  Film,
  ExternalLink 
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { formatDistanceToNow } from "date-fns";

interface DashboardProps {
  onViewSession: (sessionId: string) => void;
  onViewHistory: () => void;
}

export function Dashboard({ onViewSession, onViewHistory }: DashboardProps) {
  const { user } = useAuth();
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const { data: sessions, isLoading } = useQuery({
    queryKey: ["/api/sessions"],
    refetchInterval: uploadSuccess ? 1000 : false, // Refetch after upload
  });

  const handleUploadSuccess = (data: any) => {
    setUploadSuccess(true);
    if (data.aiSession?.id) {
      // Navigate to the new session after a short delay
      setTimeout(() => {
        onViewSession(data.aiSession.id);
      }, 1000);
    }
  };

  const recentSessions = (sessions as any[])?.slice(0, 3) || [];
  const totalSessions = (sessions as any[])?.length || 0;
  const totalQuestions = (sessions as any[])?.reduce((acc: number, session: any) => acc + (session.qas?.length || 0), 0) || 0;

  const getDisplayName = () => {
    if (user && 'firstName' in user && user.firstName) {
      return user.firstName;
    }
    if (user && 'email' in user && user.email) {
      return user.email.split('@')[0];
    }
    return "there";
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case "youtube":
        return <Film className="h-5 w-5 text-red-600" />;
      case "pdf":
        return <FileText className="h-5 w-5 text-blue-600" />;
      default:
        return <FileText className="h-5 w-5 text-green-600" />;
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

  if (isLoading) {
    return (
      <div className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="h-64 bg-muted rounded"></div>
              <div className="h-64 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">
            Welcome back, {getDisplayName()}!
          </h2>
          <p className="text-muted-foreground">
            Upload your content and start getting insights
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Upload Section */}
          <FileUpload onUploadSuccess={handleUploadSuccess} />

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <Clock className="mr-3 text-emerald-600" />
                  Recent Activity
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={onViewHistory}>
                  View All
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {recentSessions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>No content uploaded yet</p>
                  <p className="text-sm">Upload your first file to get started</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentSessions.map((session: any) => (
                    <div
                      key={session.id}
                      className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => onViewSession(session.id)}
                    >
                      <div className={`p-2 rounded-lg ${getFileIconBg(session.source?.type)}`}>
                        {getFileIcon(session.source?.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {session.source?.title || "Untitled"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(session.createdAt), { addSuffix: true })} • {session.qas?.length || 0} Q&As
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Sessions</p>
                  <p className="text-2xl font-bold">{totalSessions}</p>
                </div>
                <Folder className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Questions Asked</p>
                  <p className="text-2xl font-bold">{totalQuestions}</p>
                </div>
                <MessageCircle className="h-8 w-8 text-emerald-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">This Month</p>
                  <p className="text-2xl font-bold">
                    {(sessions as any[])?.filter((s: any) => {
                      const sessionDate = new Date(s.createdAt);
                      const now = new Date();
                      return sessionDate.getMonth() === now.getMonth() && 
                             sessionDate.getFullYear() === now.getFullYear();
                    }).length || 0}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Q&As</p>
                  <p className="text-2xl font-bold">
                    {totalSessions > 0 ? Math.round(totalQuestions / totalSessions) : 0}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-amber-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
