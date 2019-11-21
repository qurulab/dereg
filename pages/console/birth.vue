<template>
  <div>
    <search-box
      placeholder="Enter birth id"
      @onSubmit="searchForRecordById(searchQuery)"
    />
    <transition name="certificate">
      <div
        v-if="recordFetchingState === 'SUCCESS' && record.id"
        class="main-card record"
      >
        <div
          v-if="isLoggedIn && wavesKeeperData.publicKey === record.issuer"
          class="edit-wrapper"
        >
          <i class="material-icons edit-icon" @click="openEditModal">edit</i>
        </div>
        <div class="record-body">
          <h1>Certificate OF BIRTH</h1>
          <p>This certificate is proudly presented to</p>
          <h3 class="name">{{ record.info.name | uppercase }}</h3>
          <p class="date-of-birth">{{ record.info.dateOfBirth }}</p>
          <p class="sex">{{ record.info.sex | uppercase }}</p>
          <p class="lga">{{ record.info.lga | capitalize }}</p>
        </div>
        <footer class="record-footer">
          <p class="record-id">
            ID:
            <span
              ><a
                target="_blank"
                :href="
                  `https://wavesexplorer.com/testnet/tx/${record.transactionId}`
                "
                >{{ record.id }}</a
              ></span
            >
          </p>
          <p class="issuer">
            Issued By: <span>{{ record.issuer }}</span>
          </p>
        </footer>
      </div>
    </transition>
    <modal
      name="editRecordModal"
      :adaptive="true"
      :draggable="true"
      :scrollable="true"
      height="auto"
    >
      <form class="add-new-record-form" @submit.enter.prevent="updateRecord">
        <div v-if="recordAdded" class="notification">
          Record updated
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
              :checked="record.info.sex === 'female'"
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
              :checked="record.info.sex === 'female'"
            />
            <label for="female">Female</label>
            <div class="check"><div class="inside"></div></div>
          </div>
        </div>
        <button type="submit" class="primary-button" :disabled="isAddingRecord">
          <i v-if="isAddingRecord" class="material-icons">watch_later</i>
          <i v-else class="material-icons">edit</i>
        </button>
      </form>
    </modal>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import SearchBox from '@/components/SearchBox.vue'
export default {
  middleware: 'isAuthenticated',
  data() {
    return {
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
      'recordFetchingState',
      'record',
      'isLoggedIn',
      'userStatus',
      'wavesKeeperData',
      'dAppAddress',
      'searchQuery'
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
  components: {
    SearchBox
  },
  watch: {
    recordFetchingState(state) {
      if (state === 'FETCHING') {
        this.$snack.success({
          text: 'Retrieving record from Waves Blockchain...'
        })
      } else if (state === 'SUCCESS') {
        this.$snack.success({
          text: 'Record retrival successful!'
        })
      } else if (state === 'ERROR') {
        this.$snack.success({
          text: "Couldn't retrieve record from Waves Blockchain."
        })
      }
    }
  },
  methods: {
    ...mapActions(['searchForRecordById']),
    populateCurrentRecord() {
      this.name = this.record.info.name
      this.lga = this.record.info.lga
      this.dateOfBirth = this.record.info.dateOfBirth
      if (this.record.info.sex === 'female') {
        this.sex = 'female'
      } else if (this.record.info.sex === 'male') {
        this.sex = 'male'
      }
    },
    openEditModal() {
      this.$modal.show('editRecordModal')
      this.populateCurrentRecord()
    },
    updateRecord() {
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
            function: 'updateRecord',
            args: [
              { type: 'string', value: this.record.id },
              { type: 'string', value: payload }
            ]
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
            this.transaction = result
            this.$modal.hide('editRecordModal')
            this.$router.push({ path: '/console/records' })
          })
          .catch((_) => {
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

<style scoped>
.record {
  margin-top: 2rem;
  border: 1px dashed #ddd;
  box-shadow: 0 0 0 3px #fff, 0 0 0 5px #ddd, 0 0 0 10px #fff, 0 0 2px 10px #eee;
}
.record-body {
  padding: 3em;
  display: grid;
  grid-template-rows: repeat(1fr, 3);
  grid-row-gap: 1em;
  text-align: center;
}

h1 {
  text-transform: uppercase;
}
.name {
  letter-spacing: 2px;
  color: var(--primary-color);
  font-size: 4rem;
}

.sex,
.date-of-birth {
  font-weight: 700;
  font-size: 1.5em;
  color: rgb(104, 100, 100);
}
.record-footer {
  margin-top: 2rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  font-size: 0.7em;
}

.record-footer * + * {
  margin-top: 0.5rem;
}
.issuer > span,
.record-id > span {
  color: var(--primary-color);
  letter-spacing: 1.5px;
  font-weight: 600;
}
.certificate-enter,
.certificate--leave-to {
  opacity: 0;
}

.certificate--enter-active,
.certificate--leave-active {
  opacity: 1;
  transition: all 0.3s;
}

.edit-wrapper {
  display: flex;
  justify-content: flex-end;
}
.edit-icon {
  position: flex;
  color: var(--primary-color);
  cursor: pointer;
  justify-content: flex-end;
  align-self: flex-end;
}
</style>
