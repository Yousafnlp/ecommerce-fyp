export function CartLoadingState() {
  return <div className="text-center py-12">
      <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
      <p className="text-muted-foreground">Loading your cart...</p>
    </div>;
}