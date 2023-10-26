import { ref, watch, provide, inject, type InjectionKey, type Ref, type Plugin } from 'vue'
import { getCurrentInstance } from 'vue'

import type { Translations } from '@padcom/vue-i18n-common'

export interface CreateI18Options {
  locale?: string
  fallbackLocale?: string
  messages?: Translations
}

export const VueI18NTranslationsSymbol = Symbol('vue-i18n-translations') as InjectionKey<Translations>
export const VueI18NFallbackLocaleSymbol = Symbol('vue-i18n-fallback-locale') as InjectionKey<Ref<string>>
export const VueI18NLocaleSymbol = Symbol('vue-i18n-locale') as InjectionKey<Ref<string>>

function getAgentLocale() {
  return globalThis.navigator?.language.split('-')[0]
}

/**
 * This function unifies the how the injected values are provided
 *
 * In the case of an application the method is `app.provide` and
 * in the case of a separate context it is just the `provide` function
 * from `'vue'` package.
 */
function provideContextValues(provide: any, {
  locale = getAgentLocale(),
  fallbackLocale = getAgentLocale(),
  messages = {},
}: CreateI18Options) {
  const fallbackLocaleRef = ref(fallbackLocale)
  provide(VueI18NFallbackLocaleSymbol, ref(fallbackLocaleRef))

  const localeRef = ref(locale)
  provide(VueI18NLocaleSymbol, ref(localeRef))

  provide(VueI18NTranslationsSymbol, messages)
}

/**
 * vue-i18n context creator
 *
 * Enables providing the translation context in case you want
 * to have another context in part of your system or if you
 * are wrapping your component tree in a common web component.
 *
 * Counterpart to the i18n plugin
 */
export function createI18Context(options: CreateI18Options) {
  provideContextValues(provide, options)
}

/**
 * vue-i18n plugin.
 *
 * Enables providing of options for the entire application
 */
export const i18n: Plugin = {
  install(app: any, options: CreateI18Options) {
    provideContextValues(app.provide.bind(app), options)
  }
}

/**
 * Options for `useI18n` composition function
 */
interface UseI18nOptions {
  /**
   * Defines translation resolution strategy
   *
   * - `local-first` means use local translations and if the given key
   *   is not found try global scope (default)
   * - `local` means only use local translations.
   * - `global` means only use global translations.
   */
  useScope?: 'local-first' | 'local' | 'global'
}

/**
 * Enables the use of translation in composables and setup function
 */
export function useI18n({
  useScope = 'local-first'
}: UseI18nOptions = {}) {
  const instance = getCurrentInstance()
  const local: Translations = (instance?.type as any).i18n || {}
  const global = inject(VueI18NTranslationsSymbol) || ref({})
  const locale = inject(VueI18NLocaleSymbol) || ref(getAgentLocale())
  const fallbackLocale = inject(VueI18NFallbackLocaleSymbol) || ref(getAgentLocale())

  // Force re-pain of the component used here so that the language gets re-calculated
  watch(locale, () => { instance?.update() })
  watch(fallbackLocale, () => { instance?.update() })

  return {
    fallbackLocale,
    locale,
    t(key: string) {
      const localKeys = useScope === 'global' ? {} : local[locale.value] || local[fallbackLocale.value] || {}
      const fallbackLocalKeys = useScope === 'global' ? {} : local[fallbackLocale.value] || {}
      const globalKeys = useScope === 'local' ? {} : global[locale.value] || global[fallbackLocale.value] || {}
      const fallbackGlobalKeys = useScope === 'local' ? {} : global[fallbackLocale.value] || {}
      const translations = {
        ...fallbackGlobalKeys,
        ...fallbackLocalKeys,
        ...globalKeys,
        ...localKeys,
      }

      return translations[key] || key
    },
  }
}
