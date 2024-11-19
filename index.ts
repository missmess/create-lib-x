#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { parseArgs } from "util";

import prompts from "prompts";
import { red, yellow, green } from "kleur/colors";

import getLanguage from "./utils/getLanguage";
import renderTemplate, { renderPackageJson } from "./utils/renderTemplate";
import generateReadme from "./utils/generateReadme";

function printBanner() {
  console.log(
    "\x1B[38;2;66;211;146mC\x1B[39m\x1B[38;2;66;211;146mr\x1B[39m\x1B[38;2;66;211;146me\x1B[39m\x1B[38;2;66;211;146ma\x1B[39m\x1B[38;2;66;211;146mt\x1B[39m\x1B[38;2;67;209;149me\x1B[38;2;68;206;152m-\x1B[38;2;69;204;155mL\x1B[39m\x1B[38;2;70;201;158mi\x1B[39m\x1B[38;2;71;199;162mb\x1B[38;2;72;196;165m-\x1B[39m\x1B[38;2;73;194;168mX\x1B[39m\x1B[38;2;74;192;171m:\x1B[39m \x1B[39m\x1B[38;2;75;189;174mF\x1B[39m\x1B[38;2;76;187;177ma\x1B[39m\x1B[38;2;77;184;180ms\x1B[39m\x1B[38;2;78;182;183mt\x1B[39m \x1B[39m\x1B[38;2;79;179;186ms\x1B[39m\x1B[38;2;80;177;190mt\x1B[39m\x1B[38;2;81;175;193ma\x1B[39m\x1B[38;2;82;172;196mr\x1B[38;2;83;170;199mt\x1B[39m \x1B[39m\x1B[38;2;83;167;202md\x1B[39m\x1B[38;2;84;165;205me\x1B[39m\x1B[38;2;85;162;208mv\x1B[39m\x1B[38;2;86;160;211me\x1B[39m\x1B[38;2;87;158;215ml\x1B[39m\x1B[38;2;88;155;218mo\x1B[39m\x1B[38;2;89;153;221mp\x1B[39m \x1B[39m\x1B[38;2;90;150;224ml\x1B[39m\x1B[38;2;91;148;227mi\x1B[38;2;92;145;230mb\x1B[39m\x1B[38;2;93;143;233mr\x1B[39m\x1B[38;2;94;141;236ma\x1B[39m\x1B[38;2;95;138;239mr\x1B[39m\x1B[38;2;96;136;243my"
  );
}

async function main() {
  console.log();
  printBanner();
  console.log();

  const language = getLanguage();
  const cwd = process.cwd();

  // Available arguments:
  // --ts: Enable TypeScript
  // --eslint: Enable ESLint
  const args = process.argv.slice(2);
  // Parse command line arguments
  const { values: argv, positionals } = parseArgs({ args, strict: false });

  let targetDir = (positionals as string[])[0];
  const defaultProjectName = targetDir ? targetDir : "npm-lib-x";
  const defaultAuthor = "Leon";
  const defaultGitRepository = "https://github.com/missmess/create-lib-x";

  let result: {
    projectName?: string;
    author?: string;
    gitRepository?: string;
    needsTypeScript?: boolean;
    needsEslint?: boolean;
  } = {};
  // Wait for user input
  try {
    result = await prompts(
      [
        {
          name: "projectName",
          type: targetDir ? null : "text",
          message: language.projectName.message,
          initial: defaultProjectName,
          onState: (state) =>
            (targetDir = String(state.value).trim() || defaultProjectName),
        },
        {
          name: "author",
          type: "text",
          message: language.author.message,
          initial: defaultAuthor,
        },
        {
          name: "gitRepository",
          type: "text",
          message: language.gitRepository.message,
          initial: defaultGitRepository,
        },
        {
          name: "needsTypeScript",
          type: "toggle",
          message: language.needsTypeScript.message,
          initial: true,
          active: language.defaultToggleOptions.active,
          inactive: language.defaultToggleOptions.inactive,
        },
        {
          name: "needsEslint",
          type: "toggle",
          message: language.needsEslint.message,
          initial: true,
          active: language.defaultToggleOptions.active,
          inactive: language.defaultToggleOptions.inactive,
        },
      ],
      {
        onCancel: () => {
          throw new Error(red("✖") + ` ${language.errors.operationCancelled}`);
        },
      }
    );
  } catch (error: any) {
    console.log(error.message);
    process.exit(1);
  }

  const {
    projectName = defaultProjectName,
    author = defaultAuthor,
    gitRepository = defaultGitRepository,
    needsTypeScript = argv.ts,
    needsEslint = argv.eslint,
  } = result;

  // Create scaffold
  const root = path.join(cwd, targetDir);
  if (!fs.existsSync(root)) {
    fs.mkdirSync(root);
  } else {
    console.log(yellow(`\n${language.infos.dirExisted}`));
  }
  console.log();
  console.log(language.infos.scaffolding);

  async function render(templateName: string) {
    const templateDir = path.resolve(__dirname, "template", templateName);
    await renderTemplate(templateDir, root);
  }

  // Render template
  await render("base");
  await render("rollup");

  // Dynamic package.json
  const pkg = {
    name: projectName,
    author,
    homepage: gitRepository,
    repository: {
      type: "git",
      url: `git+${gitRepository}.git`,
    },
    browser: `dist/${projectName}.umd.min.js`,
  };
  renderPackageJson(pkg, path.resolve(root, "package.json"));

  if (needsTypeScript) {
    await render("tsconfig");
    await render("code/ts");
  } else {
    await render("code/js");
  }

  if (needsEslint) {
    await render("eslint");
  }
  // create README.md
  generateReadme(projectName, root);

  console.log(green(`\n${language.infos.done}\n`));
}

main().catch((error) => {
  console.error(red(error));
  process.exit(1);
});
