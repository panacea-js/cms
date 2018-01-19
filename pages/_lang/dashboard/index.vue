<template>
  <section class="container">
    <div>
      <h1 class="title">
        Dashboard
      </h1>
      <p>{{ $t('home.title') }}</p>
      <p>{{ $t('home.introduction') }}</p>
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
      title: "Dashboard"
    };
  }
};
</script>
