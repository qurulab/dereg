/* eslint-disable no-undef */
/* eslint-disable no-console */
const wavesKeeperData =
  JSON.parse(localStorage.getItem('wavesKeeperData')) || {}
const isLoggedIn = localStorage.getItem('isLoggedIn') || false
const userStatus = localStorage.getItem('userStatus') || 'notlisted'
export const state = () => ({
  wavesKeeperData,
  dAppAddress: '3N8P9bdRz4kqwJr27kpdTpnXho5m4926LFP',
  isLoggedIn,
  userStatus,
  recordId: '7832447598423894957',
  record: {
    id: '',
    info: {},
    issuer: '',
    status: ''
  },
  recordFetchingState: 'IDLE',
  loginState: 'NOT_LOGGED_IN',
  showSignInSnackbar: false
})

export const mutations = {
  LOG_IN(state, data) {
    state.wavesKeeperData = data
    state.isLoggedIn = true
  },
  SET_WHITE_LISTED(state, data) {
    state.userStatus = data
  },
  LOG_OUT(state) {
    state.wavesKeeperData = {}
    state.isLoggedIn = false
  },
  UPDATE_RECORD(state, data) {
    state.record = { ...data }
  },
  UPDATE_RECORD_FETCHING_STATE(state, status) {
    state.recordFetchingState = status
  },
  UPDATE_LOGIN_STATE(state, status) {
    state.loginState = status
  },
  RESET_RECORD_FETCHING_STATE(state) {
    state.recordFetchingState = 'IDLE'
  },
  RESET_LOGIN_STATE(state) {
    state.loginState = 'NOT_LOGGED_IN'
  },
  SET_SHOW_SIGNIN_SNACKBAR(state) {
    state.showSignInSnackbar = true
  }
}

export const actions = {
  performWavesKeeperLogin(context) {
    context.commit('RESET_LOGIN_STATE')
    context.commit('UPDATE_LOGIN_STATE', 'LOGGING_IN')
    const authData = {
      data: 'Awesome dApp',
      name: 'Awesome dApp',
      icon: 'http://auctionlance.com/aucttoken.svg',
      referrer: '/console',
      successPath: '/console'
    }
    // eslint-disable-next-line no-undef
    try {
      WavesKeeper.auth(authData)
        .then((data) => {
          context.commit('UPDATE_LOGIN_STATE', 'LOGGED_IN')
          context.commit('LOG_IN', data)
          const publicState = JSON.stringify(data)
          context.dispatch('checkWhitelistStatus', data.publicKey)

          // Storing data to local Storage for better UX and persistence
          localStorage.setItem('wavesKeeperData', publicState)
          localStorage.setItem('isLoggedIn', true)
        })
        .catch((_) => {
          context.commit('UPDATE_LOGIN_STATE', 'LOG_IN_FAIL')
        })
    } catch (_) {
      context.commit('UPDATE_LOGIN_STATE', 'LOG_IN_FAIL')
    }
  },
  logOut(context) {
    context.commit('LOG_OUT')
    context.commit('RESET_LOGIN_STATE')
    localStorage.clear()
  },
  searchForRecordById(context, id) {
    // Make sure this action can't be called while a user is fetching a record
    if (context.state.recordFetchingState === 'FETCHING') return

    context.commit('RESET_RECORD_FETCHING_STATE')
    context.commit('UPDATE_RECORD_FETCHING_STATE', 'FETCHING')
    return this.$axios
      .$get(
        `https://nodes-testnet.wavesnodes.com/addresses/data/${context.state.dAppAddress}/${id}`
      )
      .then((data) => {
        const dataArray = data.value.split('_')
        const info = JSON.parse(dataArray[0])
        const issuer = dataArray[1]
        const status = dataArray[2]
        const id = data.key

        const payload = {
          id,
          info,
          issuer,
          status
        }
        context.commit('UPDATE_RECORD', payload)
        context.commit('UPDATE_RECORD_FETCHING_STATE', 'SUCCESS')
      })
      .catch((_) => {
        context.commit('UPDATE_RECORD_FETCHING_STATE', 'ERROR')
      })
  },
  checkWhitelistStatus(context, publicKey) {
    return this.$axios
      .$get(
        `https://nodes-testnet.wavesnodes.com/addresses/data/${context.state.dAppAddress}/${publicKey}`
      )
      .then((data) => {
        const dataArray = data.value.split('_')
        const currentUserStatus = dataArray[1]
        console.log(currentUserStatus)
        context.commit('SET_WHITE_LISTED', currentUserStatus)
        localStorage.setItem('userStatus', currentUserStatus)
      })
      .catch(() => {
        const currentUserStatus = 'notlisted'
        context.commit('SET_WHITE_LISTED', currentUserStatus)
        localStorage.setItem('userStatus', currentUserStatus)
      })
  },
  showSignInSnackbar(context) {
    context.commit('SET_SHOW_SIGNIN_SNACKBAR')
  }
}
