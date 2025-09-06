export function CartHeader({ totalItems }: { totalItems: number }) {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold mb-2">Shopping Cart</h1>
      <p className="text-muted-foreground">
        {totalItems} item{totalItems !== 1 ? "s" : ""} in your cart
      </p>
    </div>
  );
}
