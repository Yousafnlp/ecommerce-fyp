import { Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
export function EmailField({
  value,
  error,
  onChange,
  disabled
}) {
  return <div className="space-y-2">
      <Label htmlFor="email">Email</Label>
      <div className="relative">
        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input id="email" name="email" type="email" placeholder="Enter your email" value={value} onChange={onChange} className={`pl-10 ${error ? "border-destructive" : ""}`} disabled={disabled} />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>;
}