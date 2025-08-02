import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, Bot, User, Link } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface QA {
  id: string;
  question: string;
  answer: string;
  sourceChunks: string[];
  createdAt: string;
}

interface QAInterfaceProps {
  sessionId: string;
  qas: QA[];
}

export function QAInterface({ sessionId, qas }: QAInterfaceProps) {
  const [question, setQuestion] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const askQuestionMutation = useMutation({
    mutationFn: async (questionText: string) => {
      const response = await apiRequest("POST", "/api/ask", {
        sessionId,
        question: questionText,
      });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Question answered",
        description: "AI has provided a response based on your content.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/sessions", sessionId] });
      setQuestion("");
    },
    onError: (error) => {
      toast({
        title: "Failed to answer question",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (question.trim()) {
      askQuestionMutation.mutate(question.trim());
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <MessageCircle className="mr-3 text-emerald-600" />
          Ask Questions
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Question Input */}
        <form onSubmit={handleSubmit} className="flex gap-3 mb-6">
          <Input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask anything about this content..."
            disabled={askQuestionMutation.isPending}
            className="flex-1"
          />
          <Button 
            type="submit" 
            disabled={!question.trim() || askQuestionMutation.isPending}
          >
            {askQuestionMutation.isPending ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              "Ask"
            )}
          </Button>
        </form>

        {/* Q&A History */}
        <div className="space-y-4">
          {qas.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageCircle className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>No questions asked yet.</p>
              <p className="text-sm">Ask your first question about this content above.</p>
            </div>
          ) : (
            qas.map((qa) => (
              <div key={qa.id} className="border border-border rounded-lg p-4">
                {/* Question */}
                <div className="mb-3">
                  <p className="font-medium text-foreground flex items-start">
                    <User className="mr-2 mt-0.5 h-5 w-5 text-primary flex-shrink-0" />
                    {qa.question}
                  </p>
                </div>

                {/* Answer */}
                <div className="ml-7 text-muted-foreground">
                  <div className="flex items-start mb-2">
                    <Bot className="mr-2 mt-0.5 h-5 w-5 text-emerald-600 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="whitespace-pre-wrap">{qa.answer}</p>
                      
                      {/* Source References */}
                      {qa.sourceChunks && qa.sourceChunks.length > 0 && (
                        <div className="mt-3 text-xs text-muted-foreground/80">
                          <div className="flex items-center">
                            <Link className="mr-1 h-3 w-3" />
                            <span>Source references available</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
