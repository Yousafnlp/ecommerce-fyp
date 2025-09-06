import Image from "next/image";

interface ProductImagesProps {
  name: string;
  mainImage: string;
  images: string[];
}

export function ProductImages({ name, mainImage, images }: ProductImagesProps) {
  return (
    <div className="space-y-4">
      <div className="aspect-square relative overflow-hidden rounded-lg bg-muted">
        <Image
          src={mainImage || "/placeholder.svg"}
          alt={name}
          fill
          className="object-cover"
          priority
        />
      </div>

      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {images.slice(0, 4).map((image, index) => (
            <div
              key={index}
              className="aspect-square relative overflow-hidden rounded-lg bg-muted"
            >
              <Image
                src={image || "/placeholder.svg"}
                alt={`${name} view ${index + 1}`}
                fill
                className="object-cover"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
