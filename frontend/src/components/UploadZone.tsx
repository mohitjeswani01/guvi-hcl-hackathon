import { useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, Image, FileIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const ACCEPTED = {
  "application/pdf": [".pdf"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
  "image/png": [".png"],
  "image/jpeg": [".jpg", ".jpeg"],
};

const ACCEPT_STRING = Object.values(ACCEPTED).flat().join(",");

interface UploadZoneProps {
  onFileSelect: (file: File) => void;
  isProcessing: boolean;
}

function getFileIcon(type: string) {
  if (type.includes("pdf")) return <FileText className="h-8 w-8 text-destructive/80" />;
  if (type.includes("image")) return <Image className="h-8 w-8 text-success/80" />;
  return <FileIcon className="h-8 w-8 text-primary/80" />;
}

export function UploadZone({ onFileSelect, isProcessing }: UploadZoneProps) {
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFile = useCallback(
    (file: File) => {
      setSelectedFile(file);
      onFileSelect(file);
    },
    [onFileSelect]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const clearFile = () => setSelectedFile(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-2xl mx-auto"
    >
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`
          relative rounded-xl border-2 border-dashed p-12 text-center transition-all duration-300 cursor-pointer
          ${dragOver
            ? "border-primary bg-primary/5 scale-[1.01]"
            : "border-border/60 hover:border-primary/40 hover:bg-muted/30"
          }
          ${isProcessing ? "pointer-events-none opacity-60" : ""}
        `}
      >
        <input
          type="file"
          accept={ACCEPT_STRING}
          onChange={handleInputChange}
          className="absolute inset-0 opacity-0 cursor-pointer"
          disabled={isProcessing}
        />

        <AnimatePresence mode="wait">
          {selectedFile ? (
            <motion.div
              key="selected"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center gap-3"
            >
              {getFileIcon(selectedFile.type)}
              <p className="text-sm font-medium text-foreground">{selectedFile.name}</p>
              <p className="text-xs text-muted-foreground">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
              {!isProcessing && (
                <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); clearFile(); }}
                  className="text-muted-foreground hover:text-destructive gap-1 text-xs">
                  <X className="h-3 w-3" /> Remove
                </Button>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4"
            >
              <div className="p-4 rounded-full bg-primary/10">
                <Upload className="h-8 w-8 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  Drop your document here or <span className="text-primary">browse</span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  PDF, DOCX, PNG, JPG — up to 20MB
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
