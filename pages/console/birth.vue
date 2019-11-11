<template>
  <div>
    <div class="main-card">
      <form @submit.enter.prevent="searchForRecordById(recordId)">
        <input
          id="birthId"
          v-model="recordId"
          type="text"
          class="main-card__search"
          name=""
          placeholder="Enter birth ID"
          autofocus
        />
      </form>
    </div>
    <transition name="certificate">
      <div
        v-if="recordFetchingState === 'SUCCESS' && record.id"
        class="main-card record"
      >
        <div class="record-body">
          <h1 class="name">{{ record.info.name | uppercase }}</h1>
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
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'

export default {
  middleware: 'isAuthenticated',
  data() {
    return {
      recordId: ''
    }
  },
  computed: {
    ...mapState(['recordFetchingState', 'record'])
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
    ...mapActions(['searchForRecordById'])
  }
}
</script>

<style scoped>
.record {
  margin-top: 5rem;
  border-bottom-right-radius: 20px;
}
.record-body {
  padding: 3em;
  display: grid;
  grid-template-rows: repeat(1fr, 3);
  grid-row-gap: 2em;
  text-align: center;
}

.name {
  letter-spacing: 2px;
  color: var(--primary-color);
}

.sex,
.date-of-birth {
  font-weight: 700;
  font-size: 1.5em;
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
</style>
