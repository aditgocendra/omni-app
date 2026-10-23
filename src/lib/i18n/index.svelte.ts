import en from "./locales/en.json";
import id from "./locales/id.json";

export type Locale = "en" | "id";

type TranslationDictionary = Record<string, unknown>;

const dictionaries: Record<Locale, TranslationDictionary> = { en, id };
const isBrowser = typeof window !== "undefined";

class I18nStore {
	#locale = $state<Locale>("en");

	constructor() {
		if (isBrowser) {
			const saved = localStorage.getItem("omni_locale");
			if (saved === "en" || saved === "id") {
				this.#locale = saved;
			}
			document.documentElement.setAttribute("lang", this.#locale);
		}
	}

	get locale(): Locale {
		return this.#locale;
	}

	setLocale(newLocale: Locale) {
		this.#locale = newLocale;
		if (isBrowser) {
			localStorage.setItem("omni_locale", newLocale);
			document.documentElement.setAttribute("lang", newLocale);
		}
	}

	t(path: string, params?: Record<string, string | number>): string {
		const keys = path.split(".");
		let current: unknown = dictionaries[this.#locale];
		let result = path;
		let found = true;

		for (const key of keys) {
			if (current && typeof current === "object" && key in current) {
				current = (current as TranslationDictionary)[key];
			} else {
				found = false;
				break;
			}
		}

		if (found && typeof current === "string") {
			result = current;
		} else {
			// Fallback to English dictionary
			let fallback: unknown = dictionaries.en;
			let fallbackFound = true;
			for (const fKey of keys) {
				if (fallback && typeof fallback === "object" && fKey in fallback) {
					fallback = (fallback as TranslationDictionary)[fKey];
				} else {
					fallbackFound = false;
					break;
				}
			}
			if (fallbackFound && typeof fallback === "string") {
				result = fallback;
			}
		}

		if (params && typeof result === "string") {
			return result.replace(/\{(\w+)\}/g, (_, k) =>
				k in params ? String(params[k]) : `{${k}}`
			);
		}
		return result;
	}
}

export const i18n = new I18nStore();
export const t = (path: string, params?: Record<string, string | number>) =>
	i18n.t(path, params);
