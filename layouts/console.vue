<template>
  <div class="console">
    <nav class="console__nav">
      <ul class="nav-wrapper">
        <li v-if="!isLoggedIn" class="nav-item">
          <a class="auth-button" @click.prevent="performWavesKeeperLogin"
            ><span v-if="loginState === 'NOT_LOGGED_IN'">SIGN IN</span>
            <span v-if="loginState === 'LOGGING_IN'">SIGNING IN...</span>
            <span v-if="loginState === 'LOG_IN_ERROR'">FAILED! TRY AGAIN</span>
          </a>
        </li>
        <li v-if="isLoggedIn" class="nav-item">
          <a href="#" class="logged-in" @click.prevent="toggleDropdown"
            >{{ wavesKeeperData.address | truncate(15) }} <avatar
          /></a>
        </li>
      </ul>
    </nav>
    <aside class="console__sidebar">
      <div class="header"></div>
      <ul class="sidebar-nav">
        <li>
          <nuxt-link to="/console">
            Overview
          </nuxt-link>
        </li>
        <li>
          <nuxt-link to="/console/birth">
            Birth
          </nuxt-link>
        </li>
        <li v-if="isLoggedIn">
          <a href="#" @click="logOut">
            Log out
          </a>
        </li>
      </ul>
    </aside>
    <main class="console__main">
      <nuxt />
    </main>
    <footer class="console__footer"></footer>
    <fab
      v-if="isLoggedIn && canAddRecord"
      :position="position"
      :bg-color="bgColor"
      :actions="fabActions"
      @birthRecord="openAddRecordModal"
    />
  </div>
</template>
<script>
import { mapState, mapActions } from 'vuex'
import fab from 'vue-fab'
import Avatar from '@/components/Avatar.vue'
export default {
  components: {
    Avatar,
    fab
  },
  data() {
    return {
      bgColor: '#ff7700',
      position: 'bottom-right',
      fabActions: [
        {
          name: 'birthRecord',
          icon: 'perm_identity',
          tooltip: 'Add birth record'
        }
      ]
    }
  },
  computed: {
    ...mapState([
      'wavesKeeperData',
      'isLoggedIn',
      'userStatus',
      'loginState',
      'showSignInSnackbar'
    ]),
    canAddRecord() {
      let bool = false
      switch (this.userStatus) {
        case 'whitelisted':
          bool = true
          break
        case 'blacklisted':
        case 'notlisted':
          bool = false
          break
      }
      console.log(bool)
      return bool
    }
  },
  watch: {
    loginState(state) {
      switch (state) {
        case 'NOT_LOGGED_IN':
          this.$router.push({ path: '/console' })
          break
      }
    },
    showSignInSnackbar(shouldShow) {
      if (shouldShow === true) {
        this.$snack.success({
          text: 'Sign in with Keeper'
        })
      }
    }
  },
  methods: {
    ...mapActions(['performWavesKeeperLogin', 'logOut']),
    openAddRecordModal() {
      console.log('Opening modal')
    }
  }
}
</script>
<style>
.console {
  background-color: var(--primary-color);
  background-image: url('../assets/flat-mountain.svg');
  background-attachment: fixed;
  background-size: cover;
  min-height: 100vh;
  padding: 1em;
}

nav {
  padding-top: 1rem;
  margin-bottom: 4rem;
}
.nav-wrapper {
  display: flex;
  justify-content: flex-end;
  align-items: baseline;
}

.nav-wrapper .nav-item {
  margin-right: 0.5em;
}
.nav-wrapper a {
  color: #fff;
}

.logged-in {
  display: flex;
  align-items: flex-end;
}
.logged-in img {
  margin-left: 0.4em;
}

.console__sidebar {
  min-height: 100vh;
  min-width: 15%;
  background-color: var(--secondary-color);
  position: fixed;
  left: 0;
  top: 0;
}

.sidebar-nav {
  padding-top: 4em;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.sidebar-nav li {
  margin-top: 2em;
  margin-bottom: 2em;
}
.sidebar-nav a {
  padding: 1em 2em;
  transition: border-left 500ms;
}

.sidebar-nav a:hover {
  border-left: 5px solid var(--primary-color);
}
.sidebar-nav a.exact-active-link {
  border-left: 5px solid var(--primary-color);
}

.console__main {
  margin-right: 2em;
  margin-left: 15em;
}

.main-card {
  background-color: #fff;
  padding: 1em 2em;
  border-radius: 4px;
  box-shadow: 0px 2px 0px rgba(0, 0, 0, 0.1);
}

.main-card__search {
  border: none;
  font-size: 2em;
  color: var(--primary-color);
  width: 100%;
}
.main-card__search:focus {
  outline: none;
  caret-color: var(--primary-color);
}
.main-card__search::placeholder {
  color: rgba(255, 119, 0, 0.3);
}
.main-card__search::selection {
  background-color: var(--primary-color);
  color: var(--secondary-color);
}

.auth-button {
  background-color: var(--secondary-color);
  color: var(--primary-color) !important;
  padding: 1em 4em;
  border-radius: 45px;
  box-shadow: 0px 8px 15px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease 0s;
  cursor: pointer;
  outline: none;
  text-transform: uppercase;
  font-size: 11px;
}

.auth-button:hover {
  background-color: var(--primary-color);
  box-shadow: 0px 10px 20px rgba(0, 0, 0, 0.4);
  color: var(--secondary-color) !important;
  transform: translateY(2px);
}
</style>
