<template>
  <h1>{{ t('hello') }}</h1>
  <h2>{{ t('example') }}!!!</h2>
</template>

<script lang="ts" setup>
import { useI18n } from '@padcom/vue-i18n'

const { t } = useI18n()
</script>

<i18n>
{
  "en": {
    "example": "This is an example message"
  }
}
</i18n>

<style lang="postcss" scoped>
h2 {
  color: green;
}
</style>
