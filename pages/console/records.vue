<template>
  <table
    v-if="recordFetchingState === 'SUCCESS' && isWhitelisted"
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
      <tr v-for="record in records" :key="record.id">
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
</template>

<script>
import { mapState, mapActions } from 'vuex'
export default {
  computed: {
    ...mapState(['records', 'recordFetchingState', 'userStatus']),
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
    recordFetchingState(newValue, oldValue) {
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
  methods: {
    ...mapActions(['getAllRecords']),
    copyId(id) {
      this.$copyText(id)
        .then(() => {
          this.$snack.success(`Copied ${id}!`)
        })
        .catch((_) => {
          this.$snack.success('Could not copy')
        })
    }
  },
  mounted() {
    this.getAllRecords()
  }
}
</script>

<style scoped>
.flat-table {
  margin-bottom: 20px;
  border-collapse: collapse;
  font-family: 'Lato', Calibri, Arial, sans-serif;
  border: none;
  border-radius: 3px;
  -webkit-border-radius: 3px;
  -moz-border-radius: 3px;
  width: 100%;
}
.flat-table th,
.flat-table td {
  box-shadow: inset 0 -1px rgba(0, 0, 0, 0.25), inset 0 1px rgba(0, 0, 0, 0.25);
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
  color: #f7f7f7;
  padding: 0.7em 1em 0.7em 1.15em;
  text-shadow: 0 0 1px rgba(255, 255, 255, 0.1);
  font-size: 1.2em;
  cursor: pointer;
}
.flat-table tr {
  -webkit-transition: background 0.3s, box-shadow 0.3s;
  -moz-transition: background 0.3s, box-shadow 0.3s;
  transition: background 0.3s, box-shadow 0.3s;
}
.flat-table-1 {
  background: #1d1e25;
}
.flat-table-1 tr:hover {
  background: rgba(0, 0, 0, 0.19);
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
</style>
