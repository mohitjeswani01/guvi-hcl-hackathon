import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { FileText, Users, Code2, TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { AnalyzeResponse } from "@/lib/api";

interface ResultTabsProps {
  data: AnalyzeResponse;
}

const sentimentConfig = {
  positive: { color: "bg-success/15 text-success border-success/30", icon: TrendingUp, label: "Positive" },
  negative: { color: "bg-destructive/15 text-destructive border-destructive/30", icon: TrendingDown, label: "Negative" },
  neutral: { color: "bg-muted text-muted-foreground border-border", icon: Minus, label: "Neutral" },
};

function EntityChips({ label, items }: { label: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <div className="space-y-2">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</h4>
      <div className="flex flex-wrap gap-2">
        {items.map((item, i) => (
          <Badge key={i} variant="secondary" className="text-xs font-medium px-3 py-1">
            {item}
          </Badge>
        ))}
      </div>
    </div>
  );
}

export function ResultTabs({ data }: ResultTabsProps) {
  const sentiment = sentimentConfig[data.sentiment] || sentimentConfig.neutral;
  const SentimentIcon = sentiment.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="h-full flex flex-col"
    >
      <Tabs defaultValue="overview" className="flex-1 flex flex-col">
        <TabsList className="bg-muted/50 border border-border/50 w-full justify-start">
          <TabsTrigger value="overview" className="gap-1.5 text-xs">
            <FileText className="h-3.5 w-3.5" /> Overview
          </TabsTrigger>
          <TabsTrigger value="entities" className="gap-1.5 text-xs">
            <Users className="h-3.5 w-3.5" /> Entities
          </TabsTrigger>
          <TabsTrigger value="raw" className="gap-1.5 text-xs">
            <Code2 className="h-3.5 w-3.5" /> Raw JSON
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="flex-1 mt-4 space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">Sentiment</h3>
              <Badge variant="outline" className={`gap-1.5 ${sentiment.color}`}>
                <SentimentIcon className="h-3.5 w-3.5" />
                {sentiment.label}
                <span className="ml-1 opacity-70">{Math.round(data.confidence * 100)}%</span>
              </Badge>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-foreground">Summary</h3>
              <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">{data.summary}</p>
            </div>
            
            {data.details && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-foreground">Detailed Extraction</h3>
                <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">{data.details}</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="entities" className="flex-1 mt-4 space-y-5">
          <EntityChips label="People" items={data.entities.names} />
          <EntityChips label="Organizations" items={data.entities.organizations} />
          <EntityChips label="Dates" items={data.entities.dates} />
          <EntityChips label="Amounts" items={data.entities.amounts} />
          {!data.entities.names.length &&
           !data.entities.organizations.length &&
           !data.entities.dates.length &&
           !data.entities.amounts.length && (
            <p className="text-sm text-muted-foreground text-center py-8">No entities extracted.</p>
          )}
        </TabsContent>

        <TabsContent value="raw" className="flex-1 mt-4">
          <pre className="bg-muted/50 border border-border/50 rounded-lg p-4 text-xs font-mono text-muted-foreground overflow-auto max-h-[60vh]">
            {JSON.stringify(data.raw || data, null, 2)}
          </pre>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
