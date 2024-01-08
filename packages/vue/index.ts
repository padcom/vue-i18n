import { ref, watch, provide, inject, type InjectionKey, type Ref } from 'vue-demi'
import { getCurrentInstance } from 'vue-demi'

import type { Language, Translations } from '@padcom/vue-i18n-common'
export type { Translations } from '@padcom/vue-i18n-common'

function getAgentLocale() {
  return globalThis.navigator?.language.split('-')[0] || 'en'
}

function getPropValue(obj: any, prop: string): string|null {
  if (!obj) return null

  const [current, ...rest] = prop.split('.')
  if (rest.length === 0) {
    if (typeof obj[current] === 'object') return null
    else return obj[current]
  } else {
    return getPropValue(obj[current], rest.join('.'))
  }
}

interface GetKeysOptions {
  scope: Scope,
  locale: Language,
  fallbackLocale: Language,
  local: Translations,
  global: Translations,
}

function getKeys({ scope, locale, fallbackLocale, local, global }: GetKeysOptions) {
  return {
    localKeys: scope === 'global'
      ? { locale: '', messages: {} }
      : { locale, messages: local[locale] },
    fallbackLocalKeys: scope === 'global'
      ? { locale: '', messages: {} }
      : { locale: fallbackLocale, messages: local[fallbackLocale] },
    globalKeys: scope === 'local'
      ? { locale: '', messages: {} }
      : { locale: locale, messages: global[locale] },
    fallbackGlobalKeys: scope === 'local'
      ? { locale: '', messages: {} }
      : { locale: fallbackLocale, messages: global[fallbackLocale] },
  }
}

interface Translation {
  locale: string
  message: string
}

function getTranslation(
  key: string,
  options: GetKeysOptions,
): Translation {
  const { localKeys, fallbackLocalKeys, globalKeys, fallbackGlobalKeys } = getKeys(options)

  const localMessage = getPropValue(localKeys.messages, key)
  const localFallbackMessage = getPropValue(fallbackLocalKeys.messages, key)
  const globalMessage = getPropValue(globalKeys.messages, key)
  const globalFallbackMessage = getPropValue(fallbackGlobalKeys.messages, key)

  if (localMessage) {
    return { locale: localKeys.locale, message: localMessage }
  } else if (localFallbackMessage) {
    return { locale: fallbackLocalKeys.locale, message: localFallbackMessage }
  } else if (globalMessage) {
    return { locale: globalKeys.locale, message: globalMessage }
  } else if (globalFallbackMessage) {
    return { locale: fallbackGlobalKeys.locale, message: globalFallbackMessage }
  } else {
    return { locale: getAgentLocale(), message: key }
  }
}

const PLACEHOLDER_RX = /{\s*(\w+)\s*}/g

function replacePlaceholder(context: Object & Record<string, any>) {
  return (placeholder: string, slot: string) => {
    return context.hasOwnProperty(slot) ? context[slot] : placeholder
  }
}

export type PluralizationRule = (choice: number, numberOfAvailableChoices: number) => number
export type PluralizationRules = Record<Language, PluralizationRule>

function defaultPluralizationRule(count: number, numberOfAvailableChoices: number): number {
  if (numberOfAvailableChoices === 0) {
    return 0
  } else if (numberOfAvailableChoices === 1) {
    return 0
  } else if (numberOfAvailableChoices === 2) {
    switch (count) {
      case 1: return 0
      default: return 1
    }
  } else {
    switch (count) {
      case 0: return 0
      case 1: return 1
      default: return 2
    }
  }
}

export interface CreateI18Options {
  locale?: string
  fallbackLocale?: string
  messages?: Translations
  pluralizationRules?: PluralizationRules
}

export const VueI18NPluralizationRulesSymbol = Symbol('vue-i18n-pluralization-rules') as InjectionKey<PluralizationRules>
export const VueI18NTranslationsSymbol = Symbol('vue-i18n-translations') as InjectionKey<Translations>
export const VueI18NFallbackLocaleSymbol = Symbol('vue-i18n-fallback-locale') as InjectionKey<Ref<string>>
export const VueI18NLocaleSymbol = Symbol('vue-i18n-locale') as InjectionKey<Ref<string>>

/**
 * Global i18n options
 *
 * Those are being stored with the plugin instance.
 */
interface GlobalI18n {
  locale?: Ref<string>
  fallbackLocale?: Ref<string>
  messages?: Translations
  pluralizationRules?: PluralizationRules
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
  pluralizationRules = {},
}: CreateI18Options = {}) {
  if (i18n.locale || i18n.fallbackLocale || i18n.messages) {
    throw new Error('vue-i18n already initialized')
  }

  i18n.locale = ref(locale)
  i18n.fallbackLocale = ref(fallbackLocale)
  i18n.messages = messages
  i18n.pluralizationRules = pluralizationRules || {}

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
      const { message } = getTranslation(key, {
        scope: 'global',
        locale: i18n.locale!.value,
        fallbackLocale: i18n.fallbackLocale!.value,
        local: {},
        global: i18n.messages!
      })

      const result = message.replace(PLACEHOLDER_RX, replacePlaceholder(context))

      return result

    },

    tc(key: string, choice: number, context: Object & Record<string, any> = {}) {
      const translation = getTranslation(key, {
        scope: 'global',
        locale: i18n.locale!.value,
        fallbackLocale: i18n.fallbackLocale!.value,
        local: {},
        global: i18n.messages!
      })

      const pluralization = i18n.pluralizationRules![translation.locale] || defaultPluralizationRule
      const variants = translation.message.split('|').map(v => v.trim())
      const variant = variants[pluralization(choice, variants.length)]
      const result = variant.replace(PLACEHOLDER_RX, replacePlaceholder(context))

      return result
    },
  }
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
export function createI18Context({
  locale = getAgentLocale(),
  fallbackLocale = getAgentLocale(),
  messages = {},
  pluralizationRules = {},
}: CreateI18Options) {
  const localeRef = ref(locale)
  provide(VueI18NLocaleSymbol, ref(localeRef))

  const fallbackLocaleRef = ref(fallbackLocale)
  provide(VueI18NFallbackLocaleSymbol, ref(fallbackLocaleRef))

  provide(VueI18NTranslationsSymbol, messages)

  provide(VueI18NPluralizationRulesSymbol, pluralizationRules)

  return {
    locale: localeRef,
    fallbackLocale: fallbackLocaleRef,
  }
}

export type Scope = 'local-first' | 'local' | 'global'

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
  useScope?: Scope
}

/**
 * Enables the use of translation in composables and setup function
 */
export function useI18n({
  useScope = 'local-first'
}: UseI18nOptions = {}) {
  const locale = i18n.locale || inject(VueI18NLocaleSymbol)
  const fallbackLocale = i18n.fallbackLocale || inject(VueI18NFallbackLocaleSymbol)
  const pluralizationRules = i18n.pluralizationRules || inject(VueI18NPluralizationRulesSymbol)
  const global = i18n.messages || inject(VueI18NTranslationsSymbol)

  if (!(locale && fallbackLocale && global && pluralizationRules)) {
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
      const { message } = getTranslation(key, {
        scope: useScope,
        locale: locale.value,
        fallbackLocale: fallbackLocale.value,
        local,
        global,
      })
      const result = message.replace(PLACEHOLDER_RX, replacePlaceholder(context))

      return result
    },


    tc(key: string, choice: number, context: Object & Record<string, any> = {}) {
      const translation = getTranslation(key, {
        scope: useScope,
        locale: locale.value,
        fallbackLocale: fallbackLocale.value,
        local,
        global,
      })

      const pluralization = pluralizationRules[translation.locale] || defaultPluralizationRule
      const variants = translation.message.split('|').map(v => v.trim())
      const variant = variants[pluralization(choice, variants.length)]
      const result = variant.replace(PLACEHOLDER_RX, replacePlaceholder(context))

      return result
    },
  }
}
