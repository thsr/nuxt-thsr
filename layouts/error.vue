<template>
<div></div>
</template>

<script>
export default {
  // middleware: 'redirectToIndex'
  beforeCreate () {
    this.$router.push('/')
  }
}
</script>
