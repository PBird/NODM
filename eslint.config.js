import typescriptParser from "@typescript-eslint/parser";

export default [
  {
    plugins: { "@typescript-eslint": {} },
    files: ["**/*.ts"],
    languageOptions: {
      parser: typescriptParser,
    },
  },
];
