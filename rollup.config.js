import typescript from "@rollup/plugin-typescript";
import pkg from "./package.json" assert { type: "json" };

/** @type {import('rollup').RollupOptions[]} */
export default [
  {
    input: "index.ts",
    output: [
      {
        file: pkg.main,
        format: "cjs",
      },
    ],
    plugins: [
      typescript(),
    ],
  },
];
