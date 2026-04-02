import { useState, useCallback, useMemo, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Zap, FileSearch } from "lucide-react";

import { UploadZone } from "@/components/UploadZone";
import { ProcessingProgress } from "@/components/ProcessingProgress";
import { ResultTabs } from "@/components/ResultTabs";
import { DocumentViewer } from "@/components/DocumentViewer";
import { SkeletonResult } from "@/components/SkeletonResult";
import { SettingsModal } from "@/components/SettingsModal";
import { useApiKey } from "@/hooks/useApiKey";
import { analyzeDocument, fileToBase64, type AnalyzeResponse } from "@/lib/api";

export default function Index() {
  const { apiKey, setApiKey } = useApiKey();
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string>("");
  const [step, setStep] = useState(0);
  const [result, setResult] = useState<AnalyzeResponse | null>(null);

  const mutation = useMutation({
    mutationFn: async (f: File) => {
      if (!apiKey) throw new Error("NO_API_KEY");
      setStep(0);
      const base64 = await fileToBase64(f);
      setStep(1);
      await delay(800);
      setStep(2);
      const res = await analyzeDocument(base64, f.name, apiKey);
      setStep(3);
      await delay(400);
      return res;
    },
    onSuccess: (data) => {
      setResult(data);
      toast.success("Document analyzed successfully");
    },
    onError: (err: Error) => {
      if (err.message === "NO_API_KEY") {
        toast.error("Please set your API key in Settings first.");
      } else if (err.message === "UNAUTHORIZED") {
        toast.error("Invalid API key. Please check your configuration.", {
          description: "401 Unauthorized",
        });
      } else {
        toast.error("Analysis failed", { description: err.message });
      }
    },
  });

  const handleFileSelect = useCallback(
    (f: File) => {
      setFile(f);
      setResult(null);
      const url = URL.createObjectURL(f);
      setFileUrl(url);
      mutation.mutate(f);
    },
    [apiKey, mutation]
  );

  // Cleanup URL
  useEffect(() => {
    return () => {
      if (fileUrl) URL.revokeObjectURL(fileUrl);
    };
  }, [fileUrl]);

  const showResults = result || mutation.isPending;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-md sticky top-0 z-50">
        <div className="container flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <FileSearch className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-base font-bold tracking-tight">
              <span className="text-gradient">IDP</span>
              <span className="text-muted-foreground font-medium ml-1.5">Dashboard</span>
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {apiKey && (
              <span className="text-[10px] font-mono text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
                API Key: ••••{apiKey.slice(-4)}
              </span>
            )}
            <SettingsModal apiKey={apiKey} onSave={setApiKey} />
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 container px-4 py-8">
        <AnimatePresence mode="wait">
          {!showResults ? (
            <motion.div
              key="upload"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center justify-center min-h-[60vh] gap-8"
            >
              <div className="text-center space-y-2">
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="inline-flex items-center gap-1.5 text-xs font-medium text-primary bg-primary/10 px-3 py-1 rounded-full mb-4">
                    <Zap className="h-3 w-3" /> Powered by AI
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                    Intelligent Document Processing
                  </h2>
                  <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
                    Upload a document to extract entities, analyze sentiment, and generate summaries using AI.
                  </p>
                </motion.div>
              </div>
              <UploadZone onFileSelect={handleFileSelect} isProcessing={mutation.isPending} />
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {mutation.isPending && !result && (
                <ProcessingProgress currentStep={step} />
              )}

              {(result || mutation.isPending) && file && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[60vh]">
                  {/* Left: Document Viewer */}
                  <div className="glass-panel p-4">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                      Document Preview
                    </h3>
                    <DocumentViewer file={file} fileUrl={fileUrl} />
                  </div>

                  {/* Right: Results */}
                  <div className="glass-panel p-5">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                      Analysis Results
                    </h3>
                    {result ? (
                      <ResultTabs data={result} />
                    ) : (
                      <SkeletonResult />
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/30 py-3">
        <div className="container px-4 flex items-center justify-between text-xs text-muted-foreground">
          <span>HCL GUVI Hackathon</span>
          <span>IDP Dashboard v1.0</span>
        </div>
      </footer>
    </div>
  );
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
