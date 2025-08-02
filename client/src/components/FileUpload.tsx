import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { CloudUpload, Plus, FileText, Film } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface FileUploadProps {
  onUploadSuccess: (data: any) => void;
}

export function FileUpload({ onUploadSuccess }: FileUploadProps) {
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const fileUploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Upload failed");
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Upload successful",
        description: "Your file has been processed and analyzed.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/sessions"] });
      onUploadSuccess(data);
    },
    onError: (error) => {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload file",
        variant: "destructive",
      });
    },
  });

  const youtubeUploadMutation = useMutation({
    mutationFn: async (url: string) => {
      const response = await apiRequest("POST", "/api/youtube", { url });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "YouTube video processed",
        description: "The video transcript has been analyzed.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/sessions"] });
      setYoutubeUrl("");
      onUploadSuccess(data);
    },
    onError: (error) => {
      toast({
        title: "Processing failed",
        description: error.message || "Failed to process YouTube video",
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      fileUploadMutation.mutate(file);
    }
  };

  const handleYouTubeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (youtubeUrl.trim()) {
      youtubeUploadMutation.mutate(youtubeUrl.trim());
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-xl font-semibold mb-4 flex items-center">
          <CloudUpload className="mr-3 text-primary" />
          Upload Content
        </h3>

        {/* File Upload Area */}
        <div
          className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center mb-4 hover:border-primary/50 transition-colors cursor-pointer"
          onClick={triggerFileUpload}
        >
          <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-2">
            Drag and drop files here or click to browse
          </p>
          <p className="text-sm text-muted-foreground">
            Supports PDF, TXT, MD files (max 10MB)
          </p>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".pdf,.txt,.md"
            onChange={handleFileUpload}
            disabled={fileUploadMutation.isPending}
          />
        </div>

        {/* YouTube Input */}
        <form onSubmit={handleYouTubeSubmit} className="mt-4">
          <Label htmlFor="youtube-url" className="text-sm font-medium mb-2 block">
            Or paste YouTube URL
          </Label>
          <div className="flex gap-2">
            <Input
              id="youtube-url"
              type="url"
              placeholder="https://youtube.com/watch?v=..."
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              disabled={youtubeUploadMutation.isPending}
              className="flex-1"
            />
            <Button 
              type="submit" 
              disabled={!youtubeUrl.trim() || youtubeUploadMutation.isPending}
              size="icon"
            >
              {youtubeUploadMutation.isPending ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Plus className="h-4 w-4" />
              )}
            </Button>
          </div>
        </form>

        {(fileUploadMutation.isPending || youtubeUploadMutation.isPending) && (
          <div className="mt-4 flex items-center space-x-3 p-4 bg-primary/10 rounded-lg">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
            <span className="text-primary font-medium">
              {fileUploadMutation.isPending ? "Processing file..." : "Processing YouTube video..."}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
