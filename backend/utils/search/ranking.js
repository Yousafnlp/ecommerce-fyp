import { normalizeText } from "./filters.js";

function scoreNameAgainstQuery(product, query) {
  const name = normalizeText(product.name);
  const description = normalizeText(product.description);
  const normalizedQuery = normalizeText(query);
  if (!normalizedQuery) return 0;

  if (name === normalizedQuery) return 1;
  if (name.includes(normalizedQuery)) return 0.9;
  if (normalizedQuery.includes(name)) return 0.75;
  if (description.includes(normalizedQuery)) return 0.45;

  const terms = normalizedQuery.split(/\s+/).filter(Boolean);
  if (terms.length === 0) return 0;
  const overlap = terms.filter((term) => name.includes(term)).length;
  return overlap / terms.length;
}

export function buildNameScores(products, matchedNames = []) {
  const scores = new Map();
  if (!matchedNames?.length) return scores;

  for (const product of products) {
    const totalScore = matchedNames.reduce(
      (total, nameQuery) => total + scoreNameAgainstQuery(product, nameQuery),
      0
    );
    scores.set(product._id, totalScore / matchedNames.length); 
  }
  
  return scores;
}