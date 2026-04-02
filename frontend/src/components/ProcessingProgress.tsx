import { motion } from "framer-motion";
import { Loader2, CheckCircle2, Upload, ScanSearch, Brain, Sparkles } from "lucide-react";

const STEPS = [
  { label: "Uploading", icon: Upload },
  { label: "OCR Extraction", icon: ScanSearch },
  { label: "AI Analysis", icon: Brain },
  { label: "Finalizing", icon: Sparkles },
];

interface ProcessingProgressProps {
  currentStep: number; // 0-3
}

export function ProcessingProgress({ currentStep }: ProcessingProgressProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl mx-auto glass-panel p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-semibold text-foreground">Processing Document</h3>
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
      </div>

      <div className="space-y-3">
        {STEPS.map((step, i) => {
          const isActive = i === currentStep;
          const isDone = i < currentStep;
          const Icon = step.icon;

          return (
            <motion.div
              key={step.label}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                isActive ? "bg-primary/10 border border-primary/20" : isDone ? "opacity-60" : "opacity-30"
              }`}
            >
              {isDone ? (
                <CheckCircle2 className="h-5 w-5 text-success shrink-0" />
              ) : isActive ? (
                <Loader2 className="h-5 w-5 animate-spin text-primary shrink-0" />
              ) : (
                <Icon className="h-5 w-5 text-muted-foreground shrink-0" />
              )}
              <span className={`text-sm ${isActive ? "font-medium text-foreground" : "text-muted-foreground"}`}>
                {step.label}
              </span>
              {isActive && (
                <div className="flex-1 ml-2">
                  <div className="h-1 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-primary rounded-full"
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 3, ease: "easeInOut" }}
                    />
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
