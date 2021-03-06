/* eslint-disable no-undef */
/* eslint-disable no-console */
const wavesKeeperData =
  JSON.parse(localStorage.getItem('wavesKeeperData')) || {}
const isLoggedIn = localStorage.getItem('isLoggedIn') || false
const userStatus = localStorage.getItem('userStatus') || 'notlisted'
export const state = () => ({
  wavesKeeperData,
  dAppAddress: '3N5MerXBH5LejNxKNjAoJm4pS1TMNV3QAcP',
  isLoggedIn,
  userStatus,
  record: {
    id: '',
    info: {},
    issuer: '',
    searchQuery: '',
    status: ''
  },
  recordFetchingState: 'IDLE',
  recordsFetchingState: 'IDLE',
  loginState: 'NOT_LOGGED_IN',
  showSignInSnackbar: false,
  records: [],
  filteredRecords: [],
  recordId: ''
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
  UPDATE_RECORDS_FETCHING_STATE(state, status) {
    state.recordsFetchingState = status
  },
  UPDATE_LOGIN_STATE(state, status) {
    state.loginState = status
  },
  RESET_RECORD_FETCHING_STATE(state) {
    state.recordFetchingState = 'IDLE'
  },
  RESET_RECORDS_FETCHING_STATE(state) {
    state.recordsFetchingState = 'IDLE'
  },
  RESET_LOGIN_STATE(state) {
    state.loginState = 'NOT_LOGGED_IN'
  },
  SET_SHOW_SIGNIN_SNACKBAR(state) {
    state.showSignInSnackbar = true
  },
  RESET_SHOW_SIGNIN_SNACKBAR(state) {
    state.showSignInSnackbar = false
  },
  SET_RECORDS(state, data) {
    state.records = data // using spread operator
  },
  UPDATE_SEARCH_QUERY(state, data) {
    state.searchQuery = data
  },
  SET_FILTERED_RECORDS(state, data) {
    state.filteredRecords = data
  }
}

export const actions = {
  performWavesKeeperLogin(context) {
    context.commit('RESET_LOGIN_STATE')
    context.commit('UPDATE_LOGIN_STATE', 'LOGGING_IN')
    const authData = {
      data: 'deREG Auth',
      name: 'deREG',
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
          context.dispatch('getAllRecords')
          context.dispatch('checkWhitelistStatus', data.publicKey)
          // Storing data to local Storage for better UX and persistence
          const publicState = JSON.stringify(data)
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
        const transactionId = dataArray[2]
        const status = data[3]
        const id = data.key

        const payload = {
          id,
          info,
          issuer,
          transactionId,
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
  },
  resetSignInSnackbar(context) {
    context.commit('RESET_SHOW_SIGNIN_SNACKBAR')
  },
  getAllRecords(context) {
    if (context.state.recordsFetchingState === 'FETCHING') return

    context.commit('RESET_RECORDS_FETCHING_STATE')
    context.commit('UPDATE_RECORDS_FETCHING_STATE', 'FETCHING')

    const regex = '^[0-9]*$'
    return this.$axios
      .$get(
        `https://nodes-testnet.wavesnodes.com/addresses/data/${context.state.dAppAddress}?matches=${regex}`
      )
      .then((data) => {
        const records = data
          .map((datum) => {
            const dataArray = datum.value.split('_')
            return {
              id: datum.key,
              info: JSON.parse(dataArray[0]),
              issuer: dataArray[1],
              transactionId: dataArray[2],
              status: dataArray[3]
            }
          })
          .filter(
            (record) =>
              record.issuer === context.state.wavesKeeperData.publicKey
          )

        context.commit('SET_RECORDS', records)
        context.commit('SET_FILTERED_RECORDS', records)
        context.commit('UPDATE_RECORDS_FETCHING_STATE', 'SUCCESS')
      })
      .catch((_) => {
        context.commit('UPDATE_RECORDS_FETCHING_STATE', 'ERROR')
      })
  },
  filterRecords(context) {
    const records = context.state.records.filter((record) => {
      const regex = new RegExp(context.state.searchQuery, 'gi')
      return (
        record.id.match(regex) ||
        record.transactionId.match(regex) ||
        record.info.name.match(regex) ||
        record.info.sex.startsWith(context.state.searchQuery) ||
        record.info.lga.match(regex) ||
        record.info.dateOfBirth.match(regex)
      )
    })
    context.commit('SET_FILTERED_RECORDS', records)
  }
}
