<template>
  <section class="container">
    <div>
      <h1 class="title">{{ $t('cms.dashboard.h1') }}</h1>
      <p>{{ $t('cms.dashboard.description') }}</p>
      <p>
        Some boxes with dashboard stats etc.
      </p>
    </div>
  </section>
</template>

<script>
export default {
  head() {
    return {
      title: this.$t("cms.dashboard.title"),
      meta: [
        {
          hid: "description",
          name: "description",
          content: this.$t("cms.dashboard.description")
        }
      ]
    }
  }
}
</script>
