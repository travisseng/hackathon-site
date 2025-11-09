<template>
  <div class="lol-wrapped">
    <Particles id="particles" :options="particlesOptions" />

    <!-- Input Form - Show when no data loaded -->
    <SummonerInput
      v-if="!statsData"
      ref="summonerInputRef"
      @submit="handleFetchStats"
    />

    <!-- Wrapped Experience - Show when data is loaded -->
    <template v-else>
      <!-- Hero Section -->
      <section ref="heroSection" class="section hero-section">
        <div class="hero-content">
          <h1 class="hero-title">Your League of Legends</h1>
          <h2 class="hero-subtitle gradient-text">2025 WRAPPED</h2>
          <div class="scroll-indicator">
            <span>Scroll to reveal</span>
            <div class="scroll-arrow"></div>
          </div>
        </div>
      </section>

      <!-- Game Duration Section -->
      <GameDurationSection ref="durationSection" :data="statsData.game_duration" />

      <!-- Champions & Roles Section -->
      <ChampionsSection ref="championsSection" :data="statsData.role_champs_played" />

      <!-- Play Time Chart Section -->
      <PlayTimeChart ref="chartSection" :data="statsData.game_duration.amount_played_year" />

      <!-- Deaths Section -->
      <DeathsSection ref="deathsSection" :data="statsData.deaths_stats" />

      <!-- Kills & Assists Section -->
      <KillsSection ref="killsSection" :data="statsData.kills_assists_stats" />

      <!-- Metrics Section -->
      <MetricsSection ref="metricsSection" :data="statsData.metrics" />

      <!-- Objectives Section -->
      <ObjectivesSection ref="objectivesSection" :data="statsData.objectives" />

      <!-- Final Section -->
      <section ref="finalSection" class="section final-section">
        <div class="final-content">
          <h2 class="final-title gradient-text">Your 2025 Journey</h2>
          <div class="final-stats">
            <div class="final-stat">
              <div class="stat-number">{{ statsData.game_duration.gameplayed }}</div>
              <div class="stat-label">Games Played</div>
            </div>
            <div class="final-stat">
              <div class="stat-number">{{ (statsData.game_duration.winrate * 100).toFixed(0) }}%</div>
              <div class="stat-label">Win Rate</div>
            </div>
            <div class="final-stat">
              <div class="stat-number">{{ statsData.metrics.kda_avg.toFixed(2) }}</div>
              <div class="stat-label">Average KDA</div>
            </div>
          </div>
          <p class="final-message">See you on the Rift, Summoner!</p>
          <button class="share-button" @click="resetApp">Start Over</button>
        </div>
      </section>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import SummonerInput from './components/SummonerInput.vue'
import GameDurationSection from './components/GameDurationSection.vue'
import ChampionsSection from './components/ChampionsSection.vue'
import PlayTimeChart from './components/PlayTimeChart.vue'
import DeathsSection from './components/DeathsSection.vue'
import KillsSection from './components/KillsSection.vue'
import MetricsSection from './components/MetricsSection.vue'
import ObjectivesSection from './components/ObjectivesSection.vue'
import { fetchPlayerStats } from './utils/api'

gsap.registerPlugin(ScrollTrigger)

// Refs
const summonerInputRef = ref(null)
const statsData = ref(null)

// API Handler Functions
const handleFetchStats = async ({ summonerName, tagLine, region }) => {
  try {
    const data = await fetchPlayerStats(summonerName, tagLine, region)
    statsData.value = data

    // Wait for DOM update, then initialize animations
    await nextTick()
    initializeAnimations()
  } catch (error) {
    const errorMessage = error.message || 'Failed to fetch player stats. Please check the summoner name and try again.'
    summonerInputRef.value?.setError(errorMessage)
    summonerInputRef.value?.setLoading(false)
  }
}

const resetApp = () => {
  statsData.value = null
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const initializeAnimations = () => {
  // Hero section animation
  gsap.from('.hero-title', {
    opacity: 0,
    y: -50,
    duration: 1,
    ease: 'power3.out'
  })

  gsap.from('.hero-subtitle', {
    opacity: 0,
    y: 50,
    duration: 1,
    delay: 0.3,
    ease: 'power3.out'
  })

  gsap.from('.scroll-indicator', {
    opacity: 0,
    y: 20,
    duration: 1,
    delay: 0.6,
    ease: 'power3.out'
  })

  // Scroll indicator animation
  gsap.to('.scroll-arrow', {
    y: 10,
    duration: 0.8,
    repeat: -1,
    yoyo: true,
    ease: 'power1.inOut'
  })

  // Section fade-in animations
  const sections = document.querySelectorAll('.section:not(.hero-section)')
  sections.forEach((section) => {
    gsap.from(section, {
      scrollTrigger: {
        trigger: section,
        start: 'top 80%',
        toggleActions: 'play none none reverse'
      },
      opacity: 0,
      y: 50,
      duration: 1,
      ease: 'power3.out'
    })
  })
}

// Particles configuration
const particlesOptions = {
  background: {
    color: {
      value: 'transparent'
    }
  },
  fpsLimit: 60,
  particles: {
    color: {
      value: ['#c89b3c', '#0397ab', '#f0e6d2']
    },
    links: {
      enable: false
    },
    move: {
      enable: true,
      speed: 1,
      direction: 'none',
      random: true,
      straight: false,
      outModes: {
        default: 'out'
      }
    },
    number: {
      value: 50,
      density: {
        enable: true,
        area: 800
      }
    },
    opacity: {
      value: { min: 0.1, max: 0.5 },
      animation: {
        enable: true,
        speed: 1,
        minimumValue: 0.1
      }
    },
    shape: {
      type: 'circle'
    },
    size: {
      value: { min: 1, max: 3 }
    }
  },
  detectRetina: true
}

// Refs for sections (used for animations)
const heroSection = ref(null)
const durationSection = ref(null)
const championsSection = ref(null)
const chartSection = ref(null)
const deathsSection = ref(null)
const killsSection = ref(null)
const metricsSection = ref(null)
const objectivesSection = ref(null)
const finalSection = ref(null)
</script>

<style scoped>
.lol-wrapped {
  position: relative;
  width: 100%;
}

#particles {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
}

.section {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  z-index: 1;
}

/* Hero Section */
.hero-section {
  background: radial-gradient(circle at center, rgba(200, 155, 60, 0.1) 0%, transparent 70%);
}

.hero-content {
  text-align: center;
  max-width: 800px;
}

.hero-title {
  font-size: clamp(2rem, 5vw, 4rem);
  font-weight: 300;
  letter-spacing: 0.1em;
  margin-bottom: 1rem;
  color: var(--lol-gold-light);
}

.hero-subtitle {
  font-size: clamp(3rem, 8vw, 7rem);
  font-weight: 900;
  letter-spacing: 0.05em;
  margin-bottom: 3rem;
}

.scroll-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  margin-top: 4rem;
  color: var(--lol-gold);
  font-size: 0.9rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.scroll-arrow {
  width: 2px;
  height: 30px;
  background: linear-gradient(to bottom, var(--lol-gold), transparent);
}

/* Final Section */
.final-section {
  background: radial-gradient(circle at center, rgba(3, 151, 171, 0.1) 0%, transparent 70%);
}

.final-content {
  text-align: center;
  max-width: 900px;
}

.final-title {
  font-size: clamp(2.5rem, 6vw, 5rem);
  font-weight: 900;
  margin-bottom: 3rem;
}

.final-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 3rem;
  margin-bottom: 3rem;
}

.final-stat {
  text-align: center;
}

.stat-number {
  font-size: clamp(3rem, 5vw, 4rem);
  font-weight: 900;
  color: var(--lol-gold);
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 1rem;
  color: var(--lol-gold-light);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.final-message {
  font-size: 1.5rem;
  margin: 2rem 0;
  color: var(--lol-gold-light);
}

.share-button {
  background: linear-gradient(135deg, var(--lol-gold) 0%, var(--lol-gold-light) 100%);
  color: var(--lol-dark);
  border: none;
  padding: 1rem 3rem;
  font-size: 1.1rem;
  font-weight: 700;
  border-radius: 50px;
  cursor: pointer;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  transition: all 0.3s ease;
  box-shadow: 0 10px 30px rgba(200, 155, 60, 0.3);
}

.share-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 15px 40px rgba(200, 155, 60, 0.5);
}

@media (max-width: 768px) {
  .section {
    padding: 3rem 1.5rem;
  }

  .final-stats {
    gap: 2rem;
  }
}
</style>
