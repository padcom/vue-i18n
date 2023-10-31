# Simplified and unified Vue.js i18n

This package implements simplified mechanism for internationalization (i18n) of components in Vue.js.

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

