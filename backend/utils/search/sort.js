function toTime(value) {
  const time = new Date(value).getTime();
  return Number.isFinite(time) ? time : 0;
}

function numeric(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

export function sortProducts(products, sortBy, sortOrder = "desc") {
  if (!sortBy) return [...products];

  const direction = sortOrder === "asc" ? 1 : -1;

  return [...products].sort((a, b) => {
    switch (sortBy) {
      case "price":
        return (numeric(a.price) - numeric(b.price)) * direction;
      case "rating":
        return (numeric(a.rating) - numeric(b.rating)) * direction;
      case "newest":
        return (toTime(a.createdAt) - toTime(b.createdAt)) * direction;
      case "popularity":
        return (numeric(a.reviewCount) - numeric(b.reviewCount)) * direction;
      case "score":
        return (numeric(a.score) - numeric(b.score)) * direction;
      default:
        return 0;
    }
  });
}

export function isSupportedSort(sortBy) {
  return ["price", "rating", "newest", "popularity", "score"].includes(sortBy);
}
