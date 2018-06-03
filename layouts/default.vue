<template>
  <v-app :dark="scheme === 'dark'">
    <v-navigation-drawer :mini-variant="miniVariant" v-model="drawer" clipped fixed app>
      <v-list>
        <v-list-tile router :to="item.to" :key="i" v-for="(item, i) in primaryNavigationItems" exact>
          <v-list-tile-action v-if="miniVariant">
            <v-tooltip right>
              <v-btn icon slot="activator">
                <v-icon v-html="item.icon"></v-icon>
              </v-btn>
              <span v-text="item.title" primary></span>
            </v-tooltip>
          </v-list-tile-action>
          <v-list-tile-action v-if="!miniVariant">
            <v-icon v-html="item.icon"></v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title v-text="item.title"></v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
      </v-list>
    </v-navigation-drawer>
    <v-toolbar fixed app clipped-left flat>
      <v-toolbar-side-icon @click="drawer = !drawer"></v-toolbar-side-icon>
      <v-btn icon @click.stop="miniVariant = !miniVariant" class="hidden-md-and-down">
        <v-icon v-html="miniVariant ? 'chevron_right' : 'chevron_left'"></v-icon>
      </v-btn>
      <v-toolbar-title v-text="title"></v-toolbar-title>
      <v-spacer></v-spacer>
    </v-toolbar>

    <v-navigation-drawer :mini-variant="miniVariant" v-model="drawer" clipped fixed app>
      <v-list>
        <v-list-tile router :to="item.to" :key="i" v-for="(item, i) in primaryNavigationItems">
          <v-list-tile-action v-if="miniVariant">
            <v-tooltip right>
              <v-btn icon slot="activator">
                <v-icon v-html="item.icon"></v-icon>
              </v-btn>
              <span v-text="item.title" primary></span>
            </v-tooltip>
          </v-list-tile-action>
          <v-list-tile-action v-if="!miniVariant">
            <v-icon v-html="item.icon"></v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title v-text="item.title"></v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
      </v-list>
    </v-navigation-drawer>

    <v-content>
      <nuxt />
    </v-content>

    <v-footer fixed height="auto">
      <v-layout row wrap justify-center>
        <v-btn v-if="tools.voyager.enable" target="_blank" :href="`${graphqlServer.protocol}://${graphqlServer.host}:${graphqlServer.port}/${tools.voyager.endpoint}`" flat>
          <GraphqlVoyagerLogo/>
        </v-btn>
        <v-btn v-if="tools.graphiql.enable" target="_blank" :href="`${graphqlServer.protocol}://${graphqlServer.host}:${graphqlServer.port}/${tools.graphiql.endpoint}`" flat>
          <GraphiqlLogo/>
        </v-btn>

        <v-spacer></v-spacer>
        <v-switch d-inline-flex class="mt-1 pt-1 scheme-switch" color="yellow lighten-3" v-model="scheme" label="Lights" true-value="light" false-value="dark" />
        <v-spacer></v-spacer>
        <LanguageSwitcher/>
        <v-spacer></v-spacer>

        <v-btn flat target="_blank" href="https://www.panaceajs.org?ref=panacea-cms">Website</v-btn>
        <v-btn flat target="_blank" href="https://github.com/panacea-js">Github</v-btn>
        <v-btn flat target="_blank" href="https://www.reallifedigital.com?ref=panacea-cms">&copy; {{ currentYear }} Real Life Digital</v-btn>
      </v-layout>
    </v-footer>

  </v-app>
</template>

<script>
import GraphqlVoyagerLogo from "@/components/GraphqlVoyagerLogo"
import GraphiqlLogo from "@/components/GraphiqlLogo"
import LanguageSwitcher from "@/components/LanguageSwitcher"

export default {
  components: {
    GraphqlVoyagerLogo,
    GraphiqlLogo,
    LanguageSwitcher
  },
  sharedData() {
    return ['scheme']
  },
  data() {
    return {
      drawer: true,
      primaryNavigationItems: [
        { icon: "apps", title: this.$t("cms.sections.dashboard"), to: `/dashboard` },
        { icon: "group_work", title: this.$t("cms.sections.entities"), to: `/entities` },
        { icon: "settings", title: this.$t("cms.sections.settings"), to: `/settings` },
        { icon: "extension", title: this.$t("cms.sections.plugins"), to: `/plugins` }
      ],
      miniVariant: false,
      title: process.env.cms.head.title,
      currentYear: new Date().getFullYear(),
      graphqlServer: process.env.panacea.main,
      tools: {
        graphiql: process.env.panacea.graphiql,
        voyager: process.env.panacea.voyager
      },
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
  }
}
</script>

<style>
.scheme-switch {
  height: 24px;
}
.scheme-switch label {
  font-size: 0.9em;
  text-transform: uppercase;
}
</style>