import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings, Key, Check } from "lucide-react";
import { toast } from "sonner";

interface SettingsModalProps {
  apiKey: string;
  onSave: (key: string) => void;
}

export function SettingsModal({ apiKey, onSave }: SettingsModalProps) {
  const [value, setValue] = useState(apiKey);
  const [open, setOpen] = useState(false);

  const handleSave = () => {
    onSave(value);
    toast.success("API key saved");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <Settings className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="glass-panel border-border/50">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5 text-primary" />
            API Configuration
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="api-key" className="text-muted-foreground text-sm">API Key</Label>
            <Input
              id="api-key"
              type="password"
              placeholder="Enter your x-api-key..."
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="bg-muted/50 border-border/50 font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              This key is sent as <code className="text-primary/80">x-api-key</code> header with every request.
            </p>
          </div>
          <Button onClick={handleSave} className="w-full gap-2">
            <Check className="h-4 w-4" /> Save Configuration
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
