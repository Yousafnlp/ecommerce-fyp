import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
export function ProductSpecifications({
  specifications
}) {
  return <Card className="mb-12">
      <CardHeader>
        <CardTitle>Technical Specifications</CardTitle>
        <CardDescription>Detailed specs and features</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(specifications).map(([key, value]) => {
          if (typeof value === "object" && value !== null) {
            return <div key={key}>
                  <h4 className="font-semibold mb-2 capitalize">
                    {key.replace(/([A-Z])/g, " $1")}
                  </h4>
                  <div className="space-y-1">
                    {Object.entries(value).map(([subKey, subValue]) => <div key={subKey} className="flex justify-between text-sm">
                        <span className="text-muted-foreground capitalize">
                          {subKey.replace(/([A-Z])/g, " $1")}:
                        </span>
                        <span>
                          {Array.isArray(subValue) ? subValue.join(", ") : String(subValue)}
                        </span>
                      </div>)}
                  </div>
                </div>;
          }
          return <div key={key} className="flex justify-between">
                <span className="text-muted-foreground capitalize">
                  {key.replace(/([A-Z])/g, " $1")}:
                </span>
                <span className="font-medium">
                  {Array.isArray(value) ? value.join(", ") : String(value)}
                </span>
              </div>;
        })}
        </div>
      </CardContent>
    </Card>;
}