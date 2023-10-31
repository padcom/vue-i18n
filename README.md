# Simplified and unified Vue.js i18n

This package implements simplified mechanism for internationalization (i18n) of components in Vue.js.

## TLDR;

If you want to see all the bits and pieces in action check out the [example](tree/master/packages/example)

## Installation

There are 2 parts to making this system work:

1. Vite plugin
2. Vue.js plugin or context creation (for webcomponents)

### Installing Vite plugin

To install the Vite plugin first install the package:

```
npm install --save-dev @padcom/vite-plugin-vue-i18n
```

and then add it to your `vite.config.js`:

```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import i18n from '@padcom/vite-plugin-vue-i18n'

export default defineConfig({
  plugins: [
    vue(),
    i18n(),
  ]
})
```

Nothing really fancy, but needs to be done so that Vite understands how to process the `<i18n>` blocks in `.vue` files.

### Installing the Vue.js part

First things first, you need to install the part that provides the actual i18n capabilities:

```
npm install --save-dev @padcom/vue-i18n
```


### Providing messages context

In contrast to the original `vue-i18n` plugin this one does not provide a global function that can inject messages from the global scope. Instead, everything is done using composition functions and Vue's native `provide`/`inject`.

#### For applications

For applications the easiest way to do it is to install the provided Vue.js plugin when creating the application:

```typescript
import { createApp } from 'vue'
import { i18n } from '@padcom/vue-i18n'

import App from './App.vue'

const messages = {
  en: {
    hello: 'Hello, world!',
  },
}

createApp(App)
  .use(i18n, { messages })
  .mount('#app')
```

#### For anything else

In the case of for example webcomponents, where the application instance is just not available there is no way to use a plugin approach like that. But no worries - this package has you covered! Instead of using a Vue.js plugin you can create the necessary context yourself:

`Host.ce.vue` - a file acting as the webcomponent host for your application:

```vue
<template>
  <SomeComponentThatWantsToUseTranslations />
</template>

<script lang="ts" setup>
import { createI18Context } from '@padcom/vue-i18n'
import SomeComponentThatWantsToUseTranslations from '...'

const messages = {
  en: {
    hello: 'Hello, world!',
  },
}

createI18Context({ messages })
</script>
```

### Messages structure in real life

You can get the `messages` from anywhere - here we just provide them in the same file to make it easier for presentation but in real life you might want to extract them to a folder structure like the original [vue-i18n](https://kazupon.github.io/vue-i18n/) plugin suggests:

```
src
  + i18n
    + index.ts
    + locale
      + en.ts
      + de.ts
      ...
```

where `src/i18n/index.ts` contains re-exports of all the different messages for languages:

```typescript
export { default as en } from './locale/en'
export { default as de } from './locale/de'
```

and the individual message files just export the messages as follows:

```typescript
export default {
  hello: 'Hello, world!',
}
```

With that kind of structure, this is how you would import the messages when you want to import your messages in `main.js` or when you create the injection context manually:

```typescript
import * as messages from './i18n'
```

## Usage

Once you've installed and configured everything using this system is very simple:

```vue
<template>
  <h1>{{ t('message') }}</h1>
</template>

<script lang="ts" setup>
import { useI18n } from '@padcom/vue-i18n'

const { t } = useI18n()
</script>

<i18n>
{
  "en": {
    "message": "Hello, world!",
  },
  "de": {
    "message": "Hallo Welt!",
  }
}
</i18n>
```

### Forcing resolution to use global messages only

Sometimes you might have duplicated message ids. In general you should try to avoid it as it makes reasoning about the code more difficult. Nevertheless, real world sometimes makes us do things we will regret later on and this system is not going to stand in your way.

You can enforce the `t` to use global messages by specifying the `useScope` key when calling `useI18n()`:

```typescript
const { t } = useI18n({ useScope: 'global' })
```

### Disabling global messages resolution

Sometimes you might want your component to only use local translations. This system has you covered:

```typescript
const { t } = useI18n({ useScope: 'local' })
```

The default value for `useScope` is `'local-first'`, which means you'll get the the local value if defined or else the system will default to global scope.

### Language selection

The system implements a simplistic, but powerful resolution system to get the message.

There are 2 locales that you can choose from:

1. `locale`
2. `fallbackLocale`

Both are initialized to the country code of the client's browser (e.g. `'en'`). But you can change them however you'd like either when installing the application plugin:

```typescript
createApp(App)
  .use(i18n, {
    messages,
    locale: 'xy',
    fallbackLocale: 'au'
  })
  .mount('#app')
```

or when creating the context:

```typescript
const { locale, fallbackLocale } = createI18Context({
  messages,
  locale: 'xy',
  fallbackLocale: 'au',
})
```

The message resolution is as follows:

1. Try to resolve the given key using `locale` from `<i18n>` provided keys
2. Try to resolve the given key using `fallbackLocale` from `<i18n>` provided keys
3. Try to resolve the given key using global scope messages using `locale`
4. Try to resolve the given key using global scope messages using `fallbackLocale`

## Closing thoughts

This internationalization system was created specifically because the original [vue-i18n](https://kazupon.github.io/vue-i18n) plugin makes it impossible to use it in the context of webcomponents. It's a design choice they have made and that's not going to change any time soon.

However, if you don't need webcomponents interoperability and you're happy with how the original plugin works or if you need some of the advanced features (like pluralization or message arguments) then you should definitely go with the original one. It's much more robust and this system will probably never grow to be as complete as the original one is.
