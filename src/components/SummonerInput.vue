<template>
  <div class="summoner-input-container">
    <div class="input-content">
      <div class="logo-section">
        <h1 class="title gradient-text">League of Legends</h1>
        <h2 class="subtitle">2025 WRAPPED</h2>
      </div>

      <div class="input-form">
        <h3 class="form-title">Enter Your Summoner Info</h3>
        <p class="form-description">Discover your year in the Rift</p>

        <div class="input-group">
          <div class="input-wrapper">
            <label for="summonerName">Summoner Name</label>
            <input
              id="summonerName"
              v-model="summonerName"
              type="text"
              placeholder="e.g., Reive"
              @keyup.enter="handleSubmit"
              :disabled="loading"
            />
          </div>

          <div class="input-wrapper">
            <label for="tagLine">Tag</label>
            <input
              id="tagLine"
              v-model="tagLine"
              type="text"
              placeholder="e.g., EUW"
              @keyup.enter="handleSubmit"
              :disabled="loading"
            />
          </div>
        </div>

        <!-- Region selector hidden for now - not currently used by API -->
        <!-- <div class="region-select">
          <label for="region">Region</label>
          <select id="region" v-model="region" :disabled="loading">
            <option value="euw1">Europe West</option>
            <option value="na1">North America</option>
            <option value="eun1">Europe Nordic & East</option>
            <option value="kr">Korea</option>
          </select>
        </div> -->

        <button
          class="submit-button"
          @click="handleSubmit"
          :disabled="!canSubmit || loading"
        >
          <span v-if="!loading">Generate My Wrapped</span>
          <span v-else class="loading-text">
            <span class="spinner"></span>
            Loading...
          </span>
        </button>

        <p v-if="error" class="error-message">{{ error }}</p>

        <p class="privacy-note">
          We use the Riot Games API to fetch your match history. Your data is not stored.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const emit = defineEmits(['submit'])

const summonerName = ref('')
const tagLine = ref('')
const region = ref('euw1')
const loading = ref(false)
const error = ref('')

const canSubmit = computed(() => {
  return summonerName.value.trim() && tagLine.value.trim()
})

const handleSubmit = () => {
  if (!canSubmit.value || loading.value) return

  error.value = ''
  loading.value = true

  emit('submit', {
    summonerName: summonerName.value.trim(),
    tagLine: tagLine.value.trim(),
    region: region.value
  })
}

const setLoading = (value) => {
  loading.value = value
}

const setError = (message) => {
  error.value = message
  loading.value = false
}

defineExpose({
  setLoading,
  setError
})
</script>

<style scoped>
.summoner-input-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  position: relative;
  background: radial-gradient(circle at center, rgba(200, 155, 60, 0.1) 0%, transparent 70%);
}

.input-content {
  max-width: 600px;
  width: 100%;
  text-align: center;
}

.logo-section {
  margin-bottom: 3rem;
}

.title {
  font-size: clamp(2rem, 5vw, 3rem);
  font-weight: 300;
  letter-spacing: 0.1em;
  margin-bottom: 0.5rem;
  color: var(--lol-gold-light);
}

.subtitle {
  font-size: clamp(2.5rem, 7vw, 5rem);
  font-weight: 900;
  letter-spacing: 0.05em;
  background: linear-gradient(135deg, var(--lol-gold), var(--lol-gold-light));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.input-form {
  background: linear-gradient(135deg, rgba(30, 35, 40, 0.9), rgba(10, 20, 40, 0.8));
  border: 2px solid rgba(200, 155, 60, 0.3);
  border-radius: 25px;
  padding: 3rem 2.5rem;
  backdrop-filter: blur(10px);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.form-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--lol-gold);
  margin-bottom: 0.5rem;
}

.form-description {
  color: var(--lol-gold-light);
  margin-bottom: 2rem;
  opacity: 0.9;
}

.input-group {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1rem;
  margin-bottom: 2rem;
}

.input-wrapper,
.region-select {
  text-align: left;
}

label {
  display: block;
  color: var(--lol-gold-light);
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

input,
select {
  width: 100%;
  padding: 1rem;
  background: rgba(10, 20, 40, 0.6);
  border: 2px solid rgba(200, 155, 60, 0.3);
  border-radius: 12px;
  color: var(--lol-gold-light);
  font-size: 1rem;
  font-family: 'Montserrat', sans-serif;
  transition: all 0.3s ease;
}

input:focus,
select:focus {
  outline: none;
  border-color: var(--lol-gold);
  box-shadow: 0 0 0 3px rgba(200, 155, 60, 0.1);
}

input::placeholder {
  color: rgba(240, 230, 210, 0.4);
}

input:disabled,
select:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.region-select {
  margin-bottom: 2rem;
}

.submit-button {
  width: 100%;
  padding: 1.2rem 2rem;
  background: linear-gradient(135deg, var(--lol-gold), var(--lol-gold-light));
  color: var(--lol-dark);
  border: none;
  border-radius: 50px;
  font-size: 1.1rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 10px 30px rgba(200, 155, 60, 0.3);
}

.submit-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 15px 40px rgba(200, 155, 60, 0.5);
}

.submit-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.loading-text {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 3px solid var(--lol-dark);
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-message {
  margin-top: 1rem;
  padding: 1rem;
  background: rgba(209, 54, 57, 0.1);
  border: 1px solid var(--lol-red);
  border-radius: 10px;
  color: var(--lol-red);
  font-weight: 600;
}

.privacy-note {
  margin-top: 1.5rem;
  font-size: 0.85rem;
  color: rgba(240, 230, 210, 0.6);
  line-height: 1.5;
}

@media (max-width: 600px) {
  .input-group {
    grid-template-columns: 1fr;
  }

  .input-form {
    padding: 2rem 1.5rem;
  }
}
</style>
