import fs from "fs";
import path from "path";

export default async function generateReadme(projectName: string, dir: string) {
  const readme = `# ${projectName}\n\nThis project was bootstrapped with [create-lib-x](https://github.com/missmess/create-lib-x)\n\n### Usage\n\nJust run build command when production ready.\n\n\`\`\`bash\nyarn build\n\`\`\``;
  fs.writeFileSync(path.resolve(dir, "README.md"), readme);
}
