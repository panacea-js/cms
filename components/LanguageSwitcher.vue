<template>
  <v-select d-inline-flex class="pt-2" :items="languages" v-model="activeLanguage"></v-select>
</template>

<script>
export default {
  data() {

    // @todo get default language from panacea env options.
    let activeLanguage = 'en'

    if (typeof document !== 'undefined') {
      document.cookie.split('; ').map(cookie => {
        const [ key, value ] = cookie.split('=')
        if (key === 'PANACEA-LANGUAGE') {
          activeLanguage = value
        }
      })
    }

    return {
      activeLanguage,
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
  watch: {
    activeLanguage(newLanguage) {
      if (typeof document !== 'undefined') {
        // Set cookie and refresh the page to re-instantiate i18n plugin.
        document.cookie = `PANACEA-LANGUAGE=${newLanguage}; path=/`
        location = location
      }
    }
  }
}
</script>
