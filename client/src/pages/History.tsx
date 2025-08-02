import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ArrowLeft, 
  Search, 
  Edit, 
  Trash2, 
  FileText, 
  Film, 
  MessageCircle,
  Clock
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface HistoryProps {
  onBack: () => void;
  onViewSession: (sessionId: string) => void;
}

export function History({ onBack, onViewSession }: HistoryProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [timeFilter, setTimeFilter] = useState("all");

  const { data: sessions, isLoading } = useQuery({
    queryKey: ["/api/sessions"],
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

  const handleRename = (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    // TODO: Implement rename functionality
    console.log("Rename session:", sessionId);
  };

  const handleDelete = (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    // TODO: Implement delete functionality
    console.log("Delete session:", sessionId);
  };

  const filteredSessions = (sessions as any[])?.filter((session: any) => {
    // Search filter
    const matchesSearch = searchTerm === "" || 
      session.source?.title?.toLowerCase().includes(searchTerm.toLowerCase());

    // Type filter
    const matchesType = typeFilter === "all" || session.source?.type === typeFilter;

    // Time filter
    let matchesTime = true;
    if (timeFilter !== "all") {
      const sessionDate = new Date(session.createdAt);
      const now = new Date();
      
      switch (timeFilter) {
        case "week":
          matchesTime = (now.getTime() - sessionDate.getTime()) <= 7 * 24 * 60 * 60 * 1000;
          break;
        case "month":
          matchesTime = sessionDate.getMonth() === now.getMonth() && 
                      sessionDate.getFullYear() === now.getFullYear();
          break;
        case "year":
          matchesTime = sessionDate.getFullYear() === now.getFullYear();
          break;
      }
    }

    return matchesSearch && matchesType && matchesTime;
  }) || [];

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto py-8 px-4">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-16 bg-muted rounded"></div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Content History</h1>
        <Button onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>

      {/* Search and Filter */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search your content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="pdf">PDFs</SelectItem>
                  <SelectItem value="txt">Text Files</SelectItem>
                  <SelectItem value="md">Markdown</SelectItem>
                  <SelectItem value="youtube">YouTube</SelectItem>
                </SelectContent>
              </Select>
              <Select value={timeFilter} onValueChange={setTimeFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* History Grid */}
      {filteredSessions.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <Clock className="mx-auto h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No content found</h3>
            <p className="text-muted-foreground">
              {searchTerm || typeFilter !== "all" || timeFilter !== "all"
                ? "Try adjusting your search or filters"
                : "Upload your first file to get started"
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSessions.map((session: any) => (
            <Card
              key={session.id}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => onViewSession(session.id)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-lg ${getFileIconBg(session.source?.type)}`}>
                    {getFileIcon(session.source?.type)}
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => handleRename(e, session.id)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={(e) => handleDelete(e, session.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <h3 className="font-semibold mb-2 truncate">
                  {session.source?.title || "Untitled"}
                </h3>
                
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {session.source?.content?.substring(0, 100) + "..." || "No description available"}
                </p>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{formatDistanceToNow(new Date(session.createdAt), { addSuffix: true })}</span>
                  <div className="flex items-center space-x-3">
                    <span className="flex items-center">
                      <MessageCircle className="mr-1 h-3 w-3" />
                      {session.qas?.length || 0} Q&As
                    </span>
                    {session.source?.metadata && (
                      <span className="flex items-center">
                        <FileText className="mr-1 h-3 w-3" />
                        {session.source.type === "youtube" 
                          ? session.source.metadata.duration || "Video"
                          : `${session.source.metadata.wordCount || 0} words`
                        }
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
