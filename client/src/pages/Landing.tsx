import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, Brain, History, ArrowRight } from "lucide-react";

interface LandingProps {
  onLoginClick: () => void;
}

export function Landing({ onLoginClick }: LandingProps) {
  const scrollToDemo = () => {
    // Smooth scroll to features section
    const featuresSection = document.getElementById("features");
    featuresSection?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Transform Your Content into{" "}
            <span className="text-primary">Actionable Insights</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Upload notes, PDFs, or YouTube videos and let AI create summaries and answer questions about your content instantly.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button size="lg" onClick={onLoginClick} className="px-8">
              Get Started Free
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              onClick={scrollToDemo}
              className="px-8"
            >
              See Demo
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          {/* Features Grid */}
          <div id="features" className="grid md:grid-cols-3 gap-8 mt-16">
            <Card className="text-center border-2">
              <CardContent className="pt-6">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Upload className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Upload Any Content</h3>
                <p className="text-muted-foreground">
                  PDFs, text files, Markdown, or YouTube video links
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-2">
              <CardContent className="pt-6">
                <div className="bg-emerald-100 dark:bg-emerald-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Brain className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">AI Analysis</h3>
                <p className="text-muted-foreground">
                  Intelligent summaries and instant answers to your questions
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-2">
              <CardContent className="pt-6">
                <div className="bg-amber-100 dark:bg-amber-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <History className="h-8 w-8 text-amber-600 dark:text-amber-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Persistent History</h3>
                <p className="text-muted-foreground">
                  Access your content and insights across all devices
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Additional sections could go here */}
    </div>
  );
}
