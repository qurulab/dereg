<template>
  <div class="search-wrapper">
    <i ref="searchIcon" class="material-icons">search</i>
    <form @submit.enter.prevent="performSearchAction">
      <input
        v-model="searchId"
        type="text"
        class="search-box"
        :placeholder="placeholder"
        @focus="searchBoxFocused"
        @blur="searchBoxLostFocused"
      />
    </form>
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
  props: {
    placeholder: {
      type: String,
      default: 'Search by name, birth id, sex'
    }
  },
  computed: {
    ...mapState(['searchQuery']),
    searchId: {
      get() {
        return this.searchQuery
      },
      set(value) {
        this.$store.commit('UPDATE_SEARCH_QUERY', value)
      }
    }
  },
  methods: {
    searchBoxFocused() {
      this.$refs.searchIcon.classList.add('search-box-focused')
    },
    searchBoxLostFocused() {
      this.$refs.searchIcon.classList.remove('search-box-focused')
    },
    performSearchAction() {
      this.$emit('onSubmit')
    }
  }
}
</script>

<style lang="css" scoped>
form {
  width: 100%;
}
</style>
