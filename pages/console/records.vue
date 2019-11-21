<template>
  <div>
    <search-box @onSubmit="filterRecords" />
    <div v-if="isWhitelisted" class="refresh">
      <button
        class="refresh-btn"
        :class="{ refreshing: recordsFetchingState == 'FETCHING' }"
        @click="getAllRecords()"
      >
        <i class="material-icons">refresh</i>
      </button>
    </div>
    <section v-if="isWhitelisted" class="statistics">
      <ul>
        <li>
          <h3>Population</h3>
          <p>{{ records.length }}</p>
        </li>
        <li>
          <h3>Alive</h3>
          {{ getStatusCount('alive') }}
        </li>
        <li>
          <h3>Deceased</h3>
          {{ getStatusCount('deceased') }}
        </li>
      </ul>
    </section>
    <table
      v-if="recordsFetchingState === 'SUCCESS' && isWhitelisted"
      class="flat-table flat-table-1"
    >
      <thead>
        <th>ID</th>
        <th>Name</th>
        <th>Sex</th>
        <th>Date of Birth</th>
        <th>LGA</th>
        <th>Status</th>
      </thead>
      <tbody>
        <tr v-for="record in filteredRecords" :key="record.id">
          <td>
            <a
              target="_blank"
              :href="
                `https://wavesexplorer.com/testnet/tx/${record.transactionId}`
              "
              >{{ record.id }}</a
            >
            <button class="copy-button" @click="copyId(record.id)">copy</button>
          </td>
          <td>{{ record.info.name | capitalize }}</td>
          <td>{{ record.info.sex | capitalize }}</td>
          <td>{{ record.info.dateOfBirth }}</td>
          <td>{{ record.info.lga | capitalize }}</td>
          <td>{{ record.status | capitalize }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import SearchBox from '@/components/SearchBox.vue'
export default {
  components: {
    SearchBox
  },
  computed: {
    ...mapState([
      'filteredRecords',
      'records',
      'recordsFetchingState',
      'userStatus',
      'searchQuery',
      'loginState'
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
    recordsFetchingState(newValue, oldValue) {
      switch (newValue) {
        case 'FETCHING':
          this.$snack.success({
            text: 'Retrieving all records from Waves Blockchain'
          })
          break
        case 'SUCCESS':
          this.$snack.success({
            text: 'All records retrieved successfully!'
          })
          break
        case 'ERROR':
          this.$snack.success({
            text: 'Oops! Could not retrieve records at this time'
          })
          break
      }
    }
  },
  mounted() {
    if (this.loginState === 'LOGGED_IN') {
      this.getAllRecords()
    }
  },
  methods: {
    ...mapActions(['getAllRecords', 'filterRecords']),
    copyId(id) {
      this.$copyText(id)
        .then(() => {
          this.$snack.success(`Copied ${id}!`)
        })
        .catch((_) => {
          this.$snack.success('Could not copy')
        })
    },
    getStatusCount(status) {
      return this.records.filter((record) => record.status === status).length
    }
  }
}
</script>

<style scoped>
.flat-table {
  margin-bottom: 20px;
  border-collapse: collapse;
  font-family: 'Lato', Calibri, Arial, sans-serif;
  border: none;
  border-radius: 4px;
  box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.14);
  -webkit-border-radius: 3px;
  -moz-border-radius: 3px;
  width: 100%;
}
.flat-table th,
.flat-table td {
  /* box-shadow: inset 0 -1px rgba(0, 0, 0, 0.25), inset 0 1px rgba(0, 0, 0, 0.25); */
  padding: 1em 1.5em !important;
}
.flat-table th {
  font-weight: normal;
  -webkit-font-smoothing: antialiased;
  padding: 1em;
  color: rgb(172, 166, 166);
  text-shadow: 0 0 1px rgba(0, 0, 0, 0.1);
  font-size: 1em;
  text-align: left;
}
.flat-table td {
  color: var(--black-color);
  padding: 0.7em 1em 0.7em 1.15em;
  text-shadow: 0 0 1px rgba(255, 255, 255, 0.1);
  font-size: 1.2em;
  cursor: pointer;
}

.flat-table tr {
  -webkit-transition: background 0.3s, box-shadow 0.3s;
  -moz-transition: background 0.3s, box-shadow 0.3s;
  transition: background 0.3s, box-shadow 0.3s;
  border-bottom: 2px dashed var(--white-color);
}

.flat-table tr:last-child {
  border-bottom: 0;
}
.flat-table-1 {
  background: #fff;
}
.flat-table-1 tr:hover {
  background: var(--white-color);
}
.flat-table-2 tr:hover {
  background: rgba(0, 0, 0, 0.1);
}
.flat-table-2 {
  background: #f06060;
}
.flat-table-3 {
  background: #52be7f;
}
.flat-table-3 tr:hover {
  background: rgba(0, 0, 0, 0.1);
}

.copy-button {
  background-color: #fff;
  border-radius: 4px;
}

.statistics {
  padding: 1em;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.14);
  -webkit-border-radius: 3px;
  -moz-border-radius: 3px;
  margin-bottom: 2em;
}

.statistics h3 {
  font-weight: 400;
  font-size: 14px;
  color: #9ba6b2;
  font-style: normal;
  font-stretch: normal;
  line-height: normal;
  letter-spacing: normal;
  margin-bottom: 1em;
}

.statistics p {
  font-weight: 400;
  font-size: 14px;
  color: #000000;
  font-style: normal;
  font-stretch: normal;
  line-height: normal;
  letter-spacing: normal;
}
.statistics ul {
  display: flex;
  justify-content: space-between;
  background-color: var(--white-color);
  padding: 1em 2em;
  border-radius: 4px;
}

.refresh {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 0.5em;
}
.refresh-btn {
  background: transparent;
  border: none;
  cursor: pointer;
}

.refresh-btn:focus {
  outline: none;
}

.refreshing {
  animation: rotate 1000ms infinite;
  animation-fill-mode: forwards;
  animation-timing-function: linear;
}

@keyframes rotate {
  to {
    transform: rotate(360deg);
  }
}
</style>
