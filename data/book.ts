export const bookConfig = {
  title: "On Deliberation",
  subtitle: "A Living Book on democratic coordination and collective reasoning",
  author: "Tal Yaron",
  description:
    "A docs-as-code publishing platform for an evolving book on democratic coordination, deliberative systems, and collective intelligence.",
  defaultLocale: "en",
  locales: {
    en: {
      code: "en",
      label: "English",
      dir: "ltr"
    },
    he: {
      code: "he",
      label: "עברית",
      dir: "rtl"
    }
  }
} as const;

export type Locale = keyof typeof bookConfig.locales;

export function isLocale(value: string): value is Locale {
  return value in bookConfig.locales;
}

