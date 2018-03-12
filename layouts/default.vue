<template>
  <v-app dark>
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
    <v-toolbar fixed app clipped-left>
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

    <v-footer fixed app>
      <v-toolbar>
        <v-toolbar-items class="hidden-sm-and-down">
          <v-btn v-if="tools.voyager.enable" target="_blank" :href="`/${tools.voyager.endpoint}`" flat>
            <GraphqlVoyagerLogo/>
          </v-btn>
          <v-btn v-if="tools.graphiql.enable" target="_blank" :href="`/${tools.graphiql.endpoint}`" flat>
            <GraphiqlLogo/>
          </v-btn>
        </v-toolbar-items>
        <v-spacer></v-spacer>
        <v-toolbar-items class="hidden-sm-and-down">
          <v-btn flat target="_blank" href="https://www.panaceajs.org?ref=panacea-cms">Website</v-btn>
          <v-btn flat target="_blank" href="https://github.com/panacea-js">Github</v-btn>
          <v-btn flat target="_blank" href="https://www.reallifedigital.com?ref=panacea-cms">&copy; {{ currentYear }} Real Life Digital</v-btn>
        </v-toolbar-items>
      </v-toolbar>
    </v-footer>
  </v-app>
</template>

<script>
import GraphqlVoyagerLogo from "@/components/GraphqlVoyagerLogo"
import GraphiqlLogo from "@/components/GraphiqlLogo"

export default {
  components: {
    GraphqlVoyagerLogo,
    GraphiqlLogo
  },
  data() {
    const locale = this.$i18n.locale
    return {
      drawer: true,
      primaryNavigationItems: [
        { icon: "apps", title: this.$t("cms.sections.dashboard"), to: `/${locale}/dashboard` },
        { icon: "group_work", title: this.$t("cms.sections.entities"), to: `/${locale}/entities` },
        { icon: "settings", title: this.$t("cms.sections.settings"), to: `/${locale}/settings` },
        { icon: "extension", title: this.$t("cms.sections.plugins"), to: `/${locale}/plugins` }
      ],
      miniVariant: false,
      title: process.env.cms.head.title,
      currentYear: new Date().getFullYear(),
      tools: {
        graphiql: process.env.panacea.graphiql,
        voyager: process.env.panacea.voyager
      }
    }
  }
}
</script>
