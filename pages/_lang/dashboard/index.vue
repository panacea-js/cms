<template>
  <section class="container">
    <div>
      <h1 class="title">{{ $t('dashboard.h1') }}</h1>
      <p>{{ $t('dashboard.description') }}</p>
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
      title: this.$t("dashboard.title"),
      meta: [
        {
          hid: "description",
          name: "description",
          content: this.$t("dashboard.description")
        }
      ]
    }
  }
}
</script>
