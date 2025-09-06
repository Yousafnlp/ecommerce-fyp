import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User } from "lucide-react";

interface NameFieldProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  disabled?: boolean;
}

export function NameField({
  value,
  onChange,
  error,
  disabled,
}: NameFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="name">Full Name</Label>
      <div className="relative">
        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          id="name"
          name="name"
          type="text"
          placeholder="Enter your full name"
          value={value}
          onChange={onChange}
          className={`pl-10 ${error ? "border-destructive" : ""}`}
          disabled={disabled}
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
