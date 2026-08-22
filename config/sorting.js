const SORT_OPTIONS = [
  {
    value: "newest",
    label: "Newest First",
    sortBy: "newest",
    sortOrder: "desc",
  },
  {
    value: "price-asc",
    label: "Price: Low to High",
    sortBy: "price",
    sortOrder: "asc",
  },
  {
    value: "price-desc",
    label: "Price: High to Low",
    sortBy: "price",
    sortOrder: "desc",
  },
  {
    value: "rating",
    label: "Rating: High to Low",
    sortBy: "rating",
    sortOrder: "desc",
  },
  {
    value: "score",
    label: "SpecSmart Score",
    sortBy: "score",
    sortOrder: "desc",
  },
];

const DEFAULT_SORT_VALUE = "newest";

const OPTIONS_BY_VALUE = new Map(
  SORT_OPTIONS.map((option) => [option.value, option])
);

function getSortValue(sortBy, sortOrder) {
  if (!sortBy) return DEFAULT_SORT_VALUE;
  if (sortBy === "price") {
    return sortOrder === "asc" ? "price-asc" : "price-desc";
  }
  return OPTIONS_BY_VALUE.has(sortBy) ? sortBy : DEFAULT_SORT_VALUE;
}

function getSortParams(value) {
  const option = OPTIONS_BY_VALUE.get(value) || OPTIONS_BY_VALUE.get(DEFAULT_SORT_VALUE);
  return { sortBy: option.sortBy, sortOrder: option.sortOrder };
}

export { SORT_OPTIONS, DEFAULT_SORT_VALUE, getSortValue, getSortParams };
