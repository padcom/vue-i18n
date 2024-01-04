<template>
  <h1>{{ t('hello.message') }}</h1>
  <h2>{{ t('example.message', { name: 'John', age: 42 }) }}</h2>
  <h3>{{ t('greeting') }}</h3>
</template>

<script lang="ts" setup>
import { useI18n } from '@padcom/vue-i18n'

const { t } = useI18n()
</script>

<i18n>
{
  "en": {
    "example": {
      "message": "This is an example message to {name} {age}"
    }
  }
}
</i18n>

<style lang="postcss" scoped>
h2 {
  color: green;
}
</style>
