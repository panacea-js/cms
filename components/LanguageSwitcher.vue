<template>
  <v-select d-inline-flex class="pt-2" :items="languages" v-model="activeLanguage"></v-select>
</template>

<script>
export default {
  data() {
    return {
      // @todo Dynamically generate list of languages.
      languages: [
        {
          text: 'English',
          value: 'en'
        },
        {
          text: 'Español',
          value: 'es'
        }
      ]
    }
  },
  computed: {
    activeLanguage: {
      get: function () {
        if (typeof document !== 'undefined') {

          // @todo get default language from panacea env options.
          let activeLanguage = 'en'

          document.cookie.split('; ').map(cookie => {
            const [ key, value ] = cookie.split('=')
            if (key === 'PANACEA-CMS-LANGUAGE') {
              activeLanguage = value
            }
          }).filter(x => !!x)[0]

          return activeLanguage
        }
      },
      set: function (language) {
        if (typeof document !== 'undefined') {
          // Set cookie and refresh the page to re-instantiate i18n plugin.
          document.cookie = `PANACEA-CMS-LANGUAGE=${language}; path=/`
          location = location
        }
      }
    }
  }
}
</script>
