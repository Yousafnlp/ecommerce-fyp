import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

// This project is JavaScript-only. eslint-config-next ships a TypeScript
// override plus TS import settings that force-load @typescript-eslint and
// the typescript package even with zero TS files — strip them from every
// expanded config segment so linting works without TypeScript tooling.
function stripTypeScript(config) {
  const {
    overrides,
    settings = {},
    parser,
    ...rest
  } = config;

  if (!overrides && parser === undefined) {
    return [{ ...config }];
  }

  const nextSettings = { ...settings };
  delete nextSettings["import/parsers"];
  if (
    nextSettings["import/resolver"] &&
    typeof nextSettings["import/resolver"] === "object"
  ) {
    const jsResolvers = Object.fromEntries(
      Object.entries(nextSettings["import/resolver"]).filter(
        ([resolver]) => !String(resolver).includes("typescript")
      )
    );
    if (Object.keys(jsResolvers).length > 0) {
      nextSettings["import/resolver"] = jsResolvers;
    } else {
      delete nextSettings["import/resolver"];
    }
  }

  return [
    {
      ...rest,
      ...(parser ? { parser } : {}),
      settings: nextSettings,
    },
  ];
}

const eslintConfig = compat
  .extends("next/core-web-vitals")
  .flatMap((config) => stripTypeScript(config));

export default eslintConfig;
