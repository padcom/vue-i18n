import type { Plugin } from 'vite'

interface I18nPluginOptions {
}

export default function vueI18n(options: I18nPluginOptions): Plugin {
  return {
    name: '@padcom/vue-i18n',
    transform(code: string, id: string) {
      // if .vue file don't have <i18n> block, just return
      if (!/vue&type=i18n/.test(id)) {
        return
      }

      // parse yaml
      if (/\.json$/.test(id)) {
        // code if lang="json" the code is already parsed into code
        // we need to get the original content of the block

        // @ts-ignore as this is internal API of the JSON loader
        code = this.originalCode

        if (!code) {
          throw new Error('Error while getting original content of JSON i18n definitions: originalCode is missing.')
        }
      // For future use: enable yaml-based messages
      // } else if (/\.ya?ml$/.test(id)) {
      //   code = JSON.stringify(yaml.load(code.trim()))
      } else {
        // the code is assumed to be a JSON string
      }

      // mount the value on the i18n property of the component instance
      // eslint-disable-next-line consistent-return
      return {
        code: `export default Comp => { Comp.i18n = ${code} }`,
        map: null,
      }
    },
  }
}
