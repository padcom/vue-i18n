import { ref, watch, provide, inject, type InjectionKey, type Ref, type Plugin } from 'vue-demi'
import { getCurrentInstance } from 'vue-demi'

import type { Translations } from '@padcom/vue-i18n-common'
export type { Translations } from '@padcom/vue-i18n-common'

function getAgentLocale() {
  return globalThis.navigator?.language.split('-')[0] || 'en'
}

function getPropValue(obj: any, prop: string): any {
  if (!obj) return null

  const [current, ...rest] = prop.split('.')
  if (rest.length === 0) {
    if (typeof obj[current] === 'object') return undefined
    else return obj[current]
  } else {
    return getPropValue(obj[current], rest.join('.'))
  }
}

function replacePlaceholder(context: Object & Record<string, any>) {
  return (placeholder: string, slot: string) => {
    return context.hasOwnProperty(slot) ? context[slot] : placeholder
  }
}

export interface CreateI18Options {
  locale?: string
  fallbackLocale?: string
  messages?: Translations
}

export const VueI18NTranslationsSymbol = Symbol('vue-i18n-translations') as InjectionKey<Translations>
export const VueI18NFallbackLocaleSymbol = Symbol('vue-i18n-fallback-locale') as InjectionKey<Ref<string>>
export const VueI18NLocaleSymbol = Symbol('vue-i18n-locale') as InjectionKey<Ref<string>>

/**
 * vue-i18n context creator
 *
 * Enables providing the translation context in case you want
 * to have another context in part of your system or if you
 * are wrapping your component tree in a common web component.
 *
 * Counterpart to the i18n plugin
 */
export function createI18Context({
  locale = getAgentLocale(),
  fallbackLocale = getAgentLocale(),
  messages = {},
}: CreateI18Options) {
  const localeRef = ref(locale)
  provide(VueI18NLocaleSymbol, ref(localeRef))

  const fallbackLocaleRef = ref(fallbackLocale)
  provide(VueI18NFallbackLocaleSymbol, ref(fallbackLocaleRef))

  provide(VueI18NTranslationsSymbol, messages)

  return {
    locale: localeRef,
    fallbackLocale: fallbackLocaleRef,
  }
}

/**
 * Global i18n options
 *
 * Those are being stored with the plugin instance.
 */
interface GlobalI18n {
  locale?: Ref<string>
  fallbackLocale?: Ref<string>
  messages?: Translations
}

/**
 * Global vue-i18n instance.
 *
 * Enables providing of options for the entire application
 */
const i18n: GlobalI18n = {}

/**
 * Initialize the global i18n instance
 */
export function createI18n({
  locale = getAgentLocale(),
  fallbackLocale = getAgentLocale(),
  messages = {},
}: CreateI18Options = {}) {
  if (i18n.locale || i18n.fallbackLocale || i18n.messages) {
    throw new Error('vue-i18n already initialized')
  }

  i18n.locale = ref(locale)
  i18n.fallbackLocale = ref(fallbackLocale)
  i18n.messages = messages

  return {
    get locale() {
      return i18n.locale!.value
    },
    set locale(value: string) {
        i18n.locale!.value = value
    },
    get fallbackLocale() {
      return i18n.fallbackLocale!.value
    },
    set fallbackLocale(value: string) {
      i18n.fallbackLocale!.value = value
    },
    get availableLocales() {
      return Object.getOwnPropertyNames(i18n.messages)
    },

    t(key: string, context: Object & Record<string, any> = {}) {
      const locale = i18n.locale?.value || getAgentLocale()
      const fallbackLocale = i18n.fallbackLocale?.value || getAgentLocale()
      const globalKeys = i18n.messages && i18n.messages[locale] || {}
      const fallbackGlobalKeys = i18n.messages && i18n.messages[fallbackLocale] || {}

      const translations = {
        ...fallbackGlobalKeys,
        ...globalKeys,
      }

      const message = getPropValue(translations, key) || key
      const result = message.replace(/{(\w+)}/g, replacePlaceholder(context))

      return result
    }
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
  const locale = i18n.locale || inject(VueI18NLocaleSymbol)
  const fallbackLocale = i18n.fallbackLocale || inject(VueI18NFallbackLocaleSymbol)
  const global = i18n.messages || inject(VueI18NTranslationsSymbol)

  if (!(locale && fallbackLocale && global)) {
    throw new Error('vue-i18n not initialized. Either call createI18n() or createI18nContext()')
  }

  const instance = getCurrentInstance()
  const local: Translations =
    // Vue 3
    (instance?.type as any)?.i18n ||
    // Vue 2
    (instance as any)?.proxy?.$options.i18n ||
    // Fallback
    {}

  // Force re-paint of the component used here so that the language gets re-calculated
  watch(locale, () => {
    instance?.update && instance?.update()
    instance?.proxy?.$forceUpdate && instance?.proxy?.$forceUpdate()
  })
  watch(fallbackLocale, () => { instance?.update && instance?.update() })

  return {
    fallbackLocale,
    locale,
    t(key: string, context: Object & Record<string, any> = {}) {
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

      const message = getPropValue(translations, key) || key
      const result = message.replace(/{(\w+)}/g, replacePlaceholder(context))

      return result
    },
  }
}
