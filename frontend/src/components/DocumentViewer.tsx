import { motion } from "framer-motion";
import { FileText } from "lucide-react";

interface DocumentViewerProps {
  file: File;
  fileUrl: string;
}

export function DocumentViewer({ file, fileUrl }: DocumentViewerProps) {
  const isPdf = file.type === "application/pdf";
  const isImage = file.type.startsWith("image/");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full rounded-lg overflow-hidden border border-border/50 bg-muted/20"
    >
      {isPdf ? (
        <iframe src={fileUrl} title="Document Preview" className="w-full h-full min-h-[500px]" />
      ) : isImage ? (
        <div className="flex items-center justify-center h-full p-4">
          <img src={fileUrl} alt={file.name} className="max-w-full max-h-full object-contain rounded" />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground p-8">
          <FileText className="h-12 w-12" />
          <p className="text-sm font-medium">{file.name}</p>
          <p className="text-xs">Preview not available for this file type</p>
        </div>
      )}
    </motion.div>
  );
}
