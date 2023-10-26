<template>
  <h1>{{ t('Hello1') }}!!</h1>
  <label>
    Locale
    <select v-model="locale">
      <option value="en">English</option>
      <option value="de">Deutsch</option>
      <option value="pl">Polski</option>
    </select>
  </label>
  <label>
    Fallback locale
    <select v-model="fallbackLocale">
      <option value="en">English</option>
      <option value="de">Deutsch</option>
      <option value="pl">Polski</option>
    </select>
  </label>
</template>

<script lang="ts" setup>
import { useI18n } from '.'

const { t, locale, fallbackLocale } = useI18n({ useScope: 'local-first' })
fallbackLocale.value = 'de'
</script>

<i18n lang="json">
{
  "en": {
    "Hello": "Hello, world! (local)"
  },
  "de": {
    "Hello": "Halo Welt! (local)",
    "Hello1": "Halo Welt! (local) - 1"
  },
  "pl": {
    "Hello": "Witaj świecie! (local)"
  }
}
</i18n>
