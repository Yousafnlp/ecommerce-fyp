import { Search, Shield, Zap } from "lucide-react";
import React from "react";

const FeatureHighlights = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
      <div className="flex flex-col items-center text-center p-4">
        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
          <Zap className="w-6 h-6 text-primary" />
        </div>
        <h3 className="font-semibold mb-2">Smart Scoring</h3>
        <p className="text-sm text-muted-foreground">
          AI-powered scores based on specs and performance
        </p>
      </div>

      <div className="flex flex-col items-center text-center p-4">
        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
          <Search className="w-6 h-6 text-primary" />
        </div>
        <h3 className="font-semibold mb-2">Advanced Search</h3>
        <p className="text-sm text-muted-foreground">
          Voice search and natural language queries
        </p>
      </div>

      <div className="flex flex-col items-center text-center p-4">
        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
          <Shield className="w-6 h-6 text-primary" />
        </div>
        <h3 className="font-semibold mb-2">Expert Comparisons</h3>
        <p className="text-sm text-muted-foreground">
          Side-by-side spec analysis and recommendations
        </p>
      </div>
    </div>
  );
};

export default FeatureHighlights;
