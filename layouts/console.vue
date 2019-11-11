<template>
  <div class="console">
    <nav class="console__nav">
      <ul class="nav-wrapper">
        <li v-if="!isLoggedIn" class="nav-item">
          <a class="primary-button" @click.prevent="performWavesKeeperLogin"
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
          <nuxt-link to="/console/records">
            <i class="material-icons">extension</i><span>Records</span>
          </nuxt-link>
        </li>
        <li>
          <nuxt-link to="/console/birth">
            <i class="material-icons">how_to_reg</i><span>Birth</span>
          </nuxt-link>
        </li>
        <li v-if="isLoggedIn">
          <a href="#" @click="logOut">
            <i class="material-icons">power_settings_new</i><span>Log out</span>
          </a>
        </li>
      </ul>
    </aside>
    <main class="console__main">
      <nuxt />
    </main>
    <footer class="console__footer"></footer>
    <fab
      v-if="isLoggedIn && isWhitelisted"
      :position="position"
      :bg-color="bgColor"
      :actions="fabActions"
      @birthRecord="openAddRecordModal"
    />
    <modal
      name="addNewRecordModal"
      :adaptive="true"
      :draggable="true"
      :scrollable="true"
      height="auto"
    >
      <form class="add-new-record-form" @submit.enter.prevent="addNewRecord">
        <div v-if="recordAdded" class="notification">
          Record added with ID
          <a
            target="_blank"
            class="notification__link"
            :href="
              `https://wavesexplorer.com/testnet/tx/${transaction.info.id}`
            "
            >{{ transaction.info.trace[0].result.data[0].key }}</a
          >
        </div>
        <div class="form-group">
          <input v-model="name" type="text" placeholder="Full name" />
        </div>
        <div class="form-group">
          <input
            v-model="dateOfBirth"
            type="text"
            placeholder="Date of birth e.g DD/MM/YYYY"
          />
        </div>
        <div class="form-group">
          <input
            v-model="lga"
            type="text"
            placeholder="Local Government Area"
          />
        </div>
        <div class="form-group">
          <div class="radio">
            <input
              id="male"
              v-model="sex"
              type="radio"
              value="male"
              name="sex"
            />
            <label for="male">Male</label>
            <div class="check"><div class="inside"></div></div>
          </div>
          <div class="radio">
            <input
              id="female"
              v-model="sex"
              type="radio"
              value="female"
              name="sex"
            />
            <label for="female">Female</label>
            <div class="check"><div class="inside"></div></div>
          </div>
        </div>
        <button type="submit" class="primary-button" :disabled="isAddingRecord">
          <i v-if="isAddingRecord" class="material-icons">watch_later</i>
          <i v-else class="material-icons">add_circle</i>
        </button>
      </form>
    </modal>
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
      ],
      name: '',
      dateOfBirth: '',
      sex: '',
      lga: '',
      isAddingRecord: false,
      recordAdded: false
    }
  },
  computed: {
    ...mapState([
      'wavesKeeperData',
      'isLoggedIn',
      'userStatus',
      'loginState',
      'showSignInSnackbar',
      'dAppAddress'
    ]),
    isWhitelisted() {
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
      this.isAddingRecord = false
      this.$modal.show('addNewRecordModal')
    },
    addNewRecord() {
      this.isAddingRecord = true
      this.recordAdded = false
      this.$snack.success({
        text: 'Adding new record to Waves Blockchain'
      })
      const info = {
        name: this.name,
        sex: this.sex,
        dateOfBirth: this.dateOfBirth,
        lga: this.lga
      }

      console.log(info)
      // eslint-disable-next-line no-unreachable
      const payload = JSON.stringify(info)
      const tx = {
        type: 16,
        data: {
          dApp: this.dAppAddress,
          call: {
            function: 'addBirthRecord',
            args: [{ type: 'string', value: payload }]
          },
          payment: [],
          fee: {
            assetId: 'WAVES',
            amount: '500000'
          }
        }
      }

      try {
        // eslint-disable-next-line no-undef
        WavesKeeper.signAndPublishTransaction(tx)
          .then((data) => {
            this.isAddingRecord = false
            this.$snack.success({
              text: '👍 Record added successfully'
            })
            this.recordAdded = true
            const result = {
              info: JSON.parse(data)
            }
            console.log(result.info)
            this.transaction = result
          })
          .catch((error) => {
            console.log(error)
            this.$snack.success({
              text:
                '😰 Oops this is embarrasing something went wrong. Try again'
            })

            this.isAddingRecord = false
            this.recordAdded = false
          })
      } catch (_) {
        this.isAddingRecord = false
        this.recordAdded = false
        this.$snack.success({
          text: '😰 Oops this is embarrasing something went wrong. Try again'
        })
      }
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
  margin-bottom: 2em;
}

.sidebar-nav a {
  display: flex;
  align-items: center;
  padding: 1em 2em;
  transition: border-left 500ms;
}
.sidebar-nav i {
  margin-right: 0.2em;
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

.primary-button {
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

.primary-button:hover {
  background-color: var(--primary-color);
  box-shadow: 0px 10px 20px rgba(0, 0, 0, 0.4);
  color: var(--secondary-color) !important;
  transform: translateY(2px);
}

/* Form */
.add-new-record-form {
  padding: 2em;
  display: grid;
  grid-template-rows: 1fr;
  grid-row-gap: 2em;
}

.add-new-record-form input[type='text'] {
  width: 100%;
  padding: 1em 2em;
  font-size: 1em;
  border-radius: 4px;
  border: 1px solid var(--primary-color);
}

.add-new-record-form input[type='text']:focus {
  outline: none;
}

.form-group {
  display: flex;
  justify-content: center;
  justify-content: space-evenly;
}
.radio {
  display: flex;
  flex-direction: row-reverse;
}
.radio input[type='radio'] {
  visibility: hidden;
}

.radio label {
  font-weight: 300;
  font-size: 1.35em;
  z-index: 9;
  cursor: pointer;
  transition: all 0.25s linear;
  margin-left: 0.5rem;
}

.radio:hover label {
  color: var(--primary-color);
}

.radio .check {
  border: 5px solid var(--primary-color);
  border-radius: 100%;
  height: 25px;
  width: 25px;
  z-index: 5;
  transition: border 0.25s linear;
  -webkit-transition: border 0.25s linear;
}

.radio:hover .check {
  border: 5px solid var(--primary-color);
}

.radio .check::before {
  display: block;
  content: '';
  border-radius: 100%;
  height: 15px;
  width: 15px;
  top: 5px;
  left: 5px;
  margin: auto;
  transition: background 0.25s linear;
  -webkit-transition: background 0.25s linear;
}

input[type='radio']:checked ~ .check {
  border: 5px solid var(--primary-color);
}

input[type='radio']:checked ~ .check::before {
  background: #9e3470;
}

input[type='radio']:checked ~ label {
  color: var(--primary-color);
}

.v--modal-overlay {
  background: rgba(0, 0, 0, 0.9) !important;
}

.notification {
  padding: 1em 2em;
  background-color: #4bb543;
  color: #fff;
  border-radius: 4px;
}

.notification__link {
  text-decoration: none;
  color: #292a2a !important;
  transition: box-shadow 0.15s;
  box-shadow: inset 0 -2px 0 0 var(--primary-color);
  font-size: 1.2em;
}

.notification__link:hover {
  box-shadow: inset 0 -2rem 0 0 var(--primary-color);
}
</style>
