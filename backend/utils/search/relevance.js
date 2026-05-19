import Fuse from "fuse.js";
import { normalizeText } from "./filters.js";
import { buildNameScores } from "./ranking.js";

function tokenize(value) {
  return normalizeText(value).split(/\s+/).filter(Boolean);
}

function getSpecificationsText(product) {
  return normalizeText(JSON.stringify(product.specifications || {}));
}

function overlapScore(queryTokens, fieldText, weight) {
  if (queryTokens.length === 0 || !fieldText) return 0;
  const matched = queryTokens.filter((token) =>
    fieldText.includes(token),
  ).length;
  return (matched / queryTokens.length) * weight;
}

function buildFuseScores(products, query) {
  if (!query.trim() || products.length === 0) return new Map();

  const fuse = new Fuse(products, {
    includeScore: true,
    ignoreLocation: true,
    threshold: 0.38,
    keys: [
      { name: "name", weight: 0.45 },
      { name: "brand", weight: 0.2 },
      { name: "category", weight: 0.2 },
      { name: "description", weight: 0.1 },
      { name: "features", weight: 0.05 },
    ],
  });

  const scores = new Map();
  for (const result of fuse.search(query)) {
    const normalizedScore = 1 - Math.min(1, result.score ?? 1);
    scores.set(result.item.id, normalizedScore * 30);
  }
  return scores;
}


export function calculateRelevanceScore(product, context = {}) {
  const query = normalizeText(context.query);
  const queryTokens = tokenize(query);
  const matchedNames = context.matchedNames || [];
  const requestedBrands = (context.brand || []).map(normalizeText);
  const requestedCategory = normalizeText(context.category);
  const requestedFeatures = (context.features || []).map(normalizeText);

  const name = normalizeText(product.name);
  const brand = normalizeText(product.brand);
  const category = normalizeText(product.category);
  const description = normalizeText(product.description);
  const featuresText = normalizeText((product.features || []).join(" "));
  const specificationsText = getSpecificationsText(product);

  let score = 0;

  // Name matching gets the largest weights because shoppers often search by model.
  const nameQueries = [...matchedNames.map(normalizeText), query].filter(
    Boolean,
  );
  if (nameQueries.some((nameQuery) => name === nameQuery)) score += 100;
  else if (
    nameQueries.some(
      (nameQuery) => name.includes(nameQuery) || nameQuery.includes(name),
    )
  )
    score += 60;
  else score += overlapScore(queryTokens, name, 35);

  if (
    requestedBrands.some(
      (requestedBrand) =>
        brand === requestedBrand || brand.includes(requestedBrand),
    )
  ) {
    score += 40;
  } else {
    score += overlapScore(queryTokens, brand, 18);
  }

  if (
    requestedCategory &&
    (category.includes(requestedCategory) ||
      requestedCategory.includes(category))
  ) {
    score += 25;
  } else {
    score += overlapScore(queryTokens, category, 14);
  }

  const matchedFeatureCount = requestedFeatures.filter((feature) =>
    `${featuresText} ${description} ${specificationsText}`.includes(feature),
  ).length;
  score += matchedFeatureCount * 20;

  if (query && description.includes(query)) score += 10;
  score += overlapScore(queryTokens, description, 10);
  score += overlapScore(queryTokens, specificationsText, 8);
  score += overlapScore(queryTokens, featuresText, 12);

  score += Math.min(8, (Number(product.rating) || 0) * 1.4);
  score += Math.min(6, Math.log10((Number(product.reviewCount) || 0) + 1) * 2);
  
  const nameMatchScore = context.nameScores?.get(product.id) || 0;
  const fuseScore = context.fuseScores?.get(product.id) || 0;

  score += nameMatchScore * 25;
  score += fuseScore;

  return Math.round(score * 100) / 100;
}

export function sortByRelevance(products, query, filters = {}) {
  const fuseScores = buildFuseScores(products, query);
  const nameScores = buildNameScores(products, filters.matchedNames);

  const context = {
    ...filters,
    query,
    fuseScores,
    nameScores,
  };

  return products
    .map((product) => ({
      ...product,
      _relevanceScore: calculateRelevanceScore(product, context),
    }))
    .sort((a, b) => b._relevanceScore - a._relevanceScore);
}
