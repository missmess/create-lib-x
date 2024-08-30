import typescript from "@rollup/plugin-typescript";
import terser from "@rollup/plugin-terser";
import pkg from "./package.json" assert { type: "json" };
import { dts } from "rollup-plugin-dts";

/** @type {import('rollup').RollupOptions[]} */
export default [
  {
    input: "src/index.ts",
    output: [
      {
        dir: "esm",
        format: "esm",
        name: pkg.name,
      },
      {
        dir: "dist",
        format: "umd",
        name: pkg.name,
      },
    ],
    plugins: [
      typescript({
        tsconfig: "./tsconfig.build.json",
      }),
      terser(),
    ],
  },
  {
    input: "src/index.ts",
    output: [
      {
        dir: "esm",
        format: "esm",
      },
      {
        dir: "dist",
        format: "esm",
      },
    ],
    plugins: [dts()],
  },
];
