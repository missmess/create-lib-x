import typescript from "@rollup/plugin-typescript";
import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from "@rollup/plugin-node-resolve";
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
      {
        name: "resolve-prompts",
        resolveId(source, importer) {
          // We don't need all two versions of prompts so we can reduce the bundle size
          // import "prompts" => import "prompts/lib/index.js"
          if (source === "prompts") {
            return this.resolve("prompts/lib/index.js", importer);
          }
          return null;
        },
      },
      commonjs(),
      typescript(),
      nodeResolve(),
    ],
  },
];
