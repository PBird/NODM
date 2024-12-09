"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tsup_1 = require("tsup");

exports.default = (0, tsup_1.defineConfig)({
  entry: ["src/*"],
  bundle: false,
  clean: true,
  format: ["cjs", "esm"],
  dts: true,
  tsconfig: "./tsconfig.json",
});
