import fs from "fs";
import path from "path";

interface LanguageItem {
  hint?: string;
  message: string;
  invalidMessage?: string;
}

interface Language {
  projectName: LanguageItem;
  author: LanguageItem;
  gitRepository: LanguageItem;
  needsTypeScript: LanguageItem;
  needsEslint: LanguageItem;
  errors: {
    operationCancelled: string;
  };
  defaultToggleOptions: {
    active: string;
    inactive: string;
  };
  infos: {
    scaffolding: string;
    dirExisted: string;
    done: string;
  };
}

function linkLocale(locale: string) {
  let linkedLocale: string = "";
  try {
    linkedLocale = Intl.getCanonicalLocales(locale)[0];
  } catch (error: any) {
    console.log(`${error.toString()}\n`);
  }
  switch (linkedLocale) {
    case "zh-TW":
    case "zh-HK":
    case "zh-MO":
    case "zh-CN":
    case "zh-SG":
      linkedLocale = "zh-CN";
      break;
    default:
      linkedLocale = "en-US";
  }

  return linkedLocale;
}

function getLocale() {
  const shellLocale =
    process.env.LC_ALL || // POSIX locale environment variables
    process.env.LC_MESSAGES ||
    process.env.LANG ||
    Intl.DateTimeFormat().resolvedOptions().locale || // Built-in ECMA-402 support
    "en-US"; // Default fallback

  return linkLocale(shellLocale.split(".")[0].replace("_", "-"));
}

export default function getLanguage() {
  const locale = getLocale();

  // Note here __dirname would not be transpiled,
  // so it refers to the __dirname of the file `<repositoryRoot>/outfile.cjs`
  // TODO: use glob import once https://github.com/evanw/esbuild/issues/3320 is fixed
  const localesRoot = path.resolve(__dirname, "locales");
  const languageFilePath = path.resolve(localesRoot, `${locale}.json`);
  const doesLanguageExist = fs.existsSync(languageFilePath);

  const lang: Language = doesLanguageExist
    ? require(languageFilePath)
    : require(path.resolve(localesRoot, "en-US.json"));

  return lang;
}
