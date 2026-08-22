export function CategoryHeader({
  title,
  description
}) {
  return <div className="mb-8">
      <h1 className="text-3xl font-bold mb-2">{title}</h1>
      <p className="text-muted-foreground text-lg">{description}</p>
    </div>;
}