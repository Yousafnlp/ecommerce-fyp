import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
export function WelcomeSection({
  name,
  avatar
}) {
  return <div className="mb-8">
      <div className="flex items-center gap-4 mb-4">
        <Avatar className="w-16 h-16">
          <AvatarImage src={avatar || "/placeholder.svg"} />
          <AvatarFallback className="text-lg">
            {name.split(" ").map(n => n[0]).join("").toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {name}!</h1>
          <p className="text-muted-foreground">
            Manage your account and discover new tech
          </p>
        </div>
      </div>
    </div>;
}