<template>
  <div class="lol-wrapped">
    <Particles id="particles" :options="particlesOptions" />

    <!-- Input Form - Show when no data loaded -->
    <SummonerInput
      v-if="!statsData"
      ref="summonerInputRef"
      @submit="handleFetchStats"
    />

    <!-- Main Content - Show when data is loaded -->
    <template v-else>
      <!-- Tab Navigation -->
      <div class="tabs-container">
        <div class="tabs-wrapper">
          <button
            class="tab-btn"
            :class="{ active: activeTab === 'wrapped' }"
            @click="switchTab('wrapped')"
          >
            <span class="tab-icon">🎁</span>
            <span class="tab-text">Wrapped</span>
          </button>
          <button
            class="tab-btn"
            :class="{ active: activeTab === 'analysis' }"
            @click="switchTab('analysis')"
          >
            <span class="tab-icon">📊</span>
            <span class="tab-text">Game Analysis</span>
          </button>
          <button
            class="tab-btn"
            :class="{ active: activeTab === 'monthly' }"
            @click="switchTab('monthly')"
          >
            <span class="tab-icon">📈</span>
            <span class="tab-text">Monthly Progress</span>
          </button>
          <button class="reset-btn" @click="resetApp">
            <span>↻</span> New Search
          </button>
        </div>
      </div>

      <!-- Wrapped Tab Content -->
      <template v-if="activeTab === 'wrapped'">
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
        <PlayTimeChart ref="chartSection" :data="getSortedPlayTime(statsData.game_duration.amount_played_year)" />

        <!-- Deaths Section -->
        <DeathsSection ref="deathsSection" :data="statsData.deaths_stats" />

        <!-- Kills & Assists Section -->
        <KillsSection ref="killsSection" :data="statsData.kills_assists_stats" />

        <!-- Metrics Section -->
        <MetricsSection ref="metricsSection" :data="statsData.metrics" />

        <!-- Objectives Section -->
        <ObjectivesSection ref="objectivesSection" :data="statsData.objectives" />

        <!-- Shareable Card Section -->
        <ShareableCard v-if="statsData.synthese" :data="statsData" @reset="resetApp" />
      </template>

      <!-- Analysis Tab Content -->
      <template v-if="activeTab === 'analysis'">
        <!-- Loading State -->
        <section v-if="gamesLoading" class="section analysis-section">
          <div class="analysis-message">
            <div class="loading-spinner"></div>
            <p>Loading game history...</p>
          </div>
        </section>

        <!-- Error State -->
        <section v-else-if="gamesError" class="section analysis-section">
          <div class="analysis-message error">
            <span class="error-icon">⚠️</span>
            <p>{{ gamesError }}</p>
            <button class="retry-btn" @click="fetchGames">Try Again</button>
          </div>
        </section>

        <!-- Game History or Analysis -->
        <template v-else>
          <GameHistory v-if="!selectedGame" :games="gamesData" @analyze="handleAnalyzeGame" />

          <!-- Analysis Loading State -->
          <section v-else-if="analysisLoading" class="section analysis-section">
            <div class="analysis-message">
              <div class="loading-spinner"></div>
              <p>Analyzing game...</p>
            </div>
          </section>

          <!-- Analysis Error State -->
          <section v-else-if="analysisError" class="section analysis-section">
            <div class="analysis-message error">
              <span class="error-icon">⚠️</span>
              <p>{{ analysisError }}</p>
              <button class="retry-btn" @click="handleAnalyzeGame(selectedGame)">Try Again</button>
              <button class="back-btn" @click="handleBackToGames">Back to Games</button>
            </div>
          </section>

          <!-- Game Analysis -->
          <GameAnalysis v-else-if="selectedGame && analysisData" :analysisData="analysisData" @back="handleBackToGames" />
        </template>
      </template>

      <!-- Monthly Progress Tab Content -->
      <template v-if="activeTab === 'monthly'">
        <MonthlyProgressSection :data="monthlyData" />
      </template>
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
import ShareableCard from './components/ShareableCard.vue'
import GameHistory from './components/GameHistory.vue'
import GameAnalysis from './components/GameAnalysis.vue'
import MonthlyProgressSection from './components/MonthlyProgressSection.vue'
import { fetchPlayerStats, fetchAllGames, analyzeGame } from './utils/api'
import monthlyData from '../monthly.json'

gsap.registerPlugin(ScrollTrigger)

// Refs
const summonerInputRef = ref(null)
const statsData = ref(null)
const activeTab = ref('wrapped')
const selectedGame = ref(null)
const gamesData = ref([])
const gamesLoading = ref(false)
const gamesError = ref(null)

// Analysis state
const analysisData = ref(null)
const analysisLoading = ref(false)
const analysisError = ref(null)

// Store summoner details for API calls
const summonerDetails = ref({
  summonerName: '',
  tagLine: '',
  region: ''
})

// Helper function to sort amount_played_year chronologically
const getSortedPlayTime = (playTimeData) => {
  if (!playTimeData) return {}

  // Convert to array of entries, sort by date, then convert back to object
  const entries = Object.entries(playTimeData)

  entries.sort((a, b) => {
    const dateA = new Date(a[0])
    const dateB = new Date(b[0])
    return dateA - dateB
  })

  return Object.fromEntries(entries)
}

// Fetch games from API
const fetchGames = async () => {
  if (!summonerDetails.value.summonerName || gamesData.value.length > 0) {
    return // Don't fetch if no summoner or already fetched
  }

  gamesLoading.value = true
  gamesError.value = null

  try {
    const games = await fetchAllGames(
      summonerDetails.value.summonerName,
      summonerDetails.value.tagLine,
      summonerDetails.value.region
    )

    // Sort games by gameCreation timestamp (most recent first)
    const sortedGames = games.sort((a, b) => {
      const timestampA = a.gameCreation || 0
      const timestampB = b.gameCreation || 0
      return timestampB - timestampA // Descending order
    })

    gamesData.value = sortedGames
  } catch (error) {
    console.error('Error fetching games:', error)
    gamesError.value = error.message || 'Failed to fetch game history'
  } finally {
    gamesLoading.value = false
  }
}

// API Handler Functions
const handleFetchStats = async ({ summonerName, tagLine, region }) => {
  try {
    const data = await fetchPlayerStats(summonerName, tagLine, region)
    statsData.value = data

    // Store summoner details for future API calls
    summonerDetails.value = { summonerName, tagLine, region }

    // Wait for DOM update, then initialize animations
    await nextTick()
    initializeAnimations()

    // Fetch games data in the background
    fetchGames()
  } catch (error) {
    const errorMessage = error.message || 'Failed to fetch player stats. Please check the summoner name and try again.'
    summonerInputRef.value?.setError(errorMessage)
    summonerInputRef.value?.setLoading(false)
  }
}

const resetApp = () => {
  statsData.value = null
  activeTab.value = 'wrapped'
  selectedGame.value = null
  gamesData.value = []
  gamesError.value = null
  analysisData.value = null
  analysisError.value = null
  summonerDetails.value = { summonerName: '', tagLine: '', region: '' }
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const switchTab = (tab) => {
  activeTab.value = tab
  selectedGame.value = null
  analysisData.value = null
  analysisError.value = null

  // Fetch games when switching to analysis tab if not already loaded
  if (tab === 'analysis' && gamesData.value.length === 0 && !gamesLoading.value) {
    fetchGames()
  }

  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const handleBackToGames = () => {
  selectedGame.value = null
  analysisData.value = null
  analysisError.value = null
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const handleAnalyzeGame = async (gameId) => {
  selectedGame.value = gameId
  analysisLoading.value = true
  analysisError.value = null
  analysisData.value = null

  window.scrollTo({ top: 0, behavior: 'smooth' })

  try {
    const analysis = await analyzeGame(
      summonerDetails.value.summonerName,
      summonerDetails.value.tagLine,
      summonerDetails.value.region,
      gameId
    )
    analysisData.value = analysis
  } catch (error) {
    console.error('Error analyzing game:', error)
    analysisError.value = error.message || 'Failed to analyze game'
  } finally {
    analysisLoading.value = false
  }
}

// Mock analysis data (real data will come from API)
const mockAnalysisData = {
  player: { champion: "Azir", role: "MIDDLE", score: 6.5 },
  phase_analysis: {
    early_game: {
      title: "Strong Early Lane Dominance",
      rating: 8.5,
      strengths: [
        "Excellent CS rate (7.2/min) - maintained high farm efficiency",
        "Gold and XP advantage over opponent (+244g, +206xp)",
        "Quick first blood at 6:45 establishing dominance"
      ],
      issues: [
        "Minimal vision control with only 1 ward placed",
        "Limited map awareness despite strong individual performance"
      ]
    },
    mid_game: {
      title: "Inconsistent Execution with Positioning Errors",
      rating: 5.0,
      strengths: [
        "Maintained farm lead with 117 CS at 8-17min mark",
        "Secured tower kill at 12:55 contributing to objective control"
      ],
      issues: [
        "Three deaths (9:31, 11:20, 13:50) indicating poor positioning",
        "Critical death at 11:20 occurred 65s before dragon spawn",
        "Low vision placements (4 wards) - inadequate map control"
      ]
    },
    late_game: {
      title: "Improved Performance with Persistent Positioning Issues",
      rating: 6.5,
      strengths: [
        "High damage output (27k) - peak damage phase for the role",
        "Multiple tower assists (4) contributing to victory condition"
      ],
      issues: [
        "Four deaths (17:47, 19:00, 22:29, 24:41) in critical moments",
        "Death at 19:00 occurred 59s before baron spawn - timing catastrophic"
      ]
    }
  },
  global_strengths: [
    {
      title: "Exceptional Damage Output",
      details: [
        "27k total damage - highest on team exceeding AD carry",
        "Consistent damage contribution across all game phases"
      ]
    },
    {
      title: "Solid Laning Phase",
      details: [
        "7.2 CS/min early game efficiency",
        "Lane dominance versus Qiyana matchup"
      ]
    }
  ],
  global_issues: [
    {
      title: "Catastrophic Objective Timing",
      details: [
        "Three critical deaths occurred 40-65 seconds before major objectives",
        "Missing presence at crucial decision-making moments"
      ]
    },
    {
      title: "Poor Positioning and Deaths",
      details: [
        "7 total deaths across the game",
        "Deaths clustered in mid and late game"
      ]
    }
  ],
  coaching_points: [
    {
      title: "Objective Timing and Positioning Around Objectives",
      problem: "Player died at critical moments before dragons and baron, demonstrating poor objective awareness and positioning discipline.",
      solutions: [
        "Establish habit of checking objective timers 90 seconds before spawn",
        "Plan positioning around objective spawn zones",
        "Prioritize safety and objective control over extended lane farms"
      ]
    },
    {
      title: "Vision Control and Map Awareness",
      problem: "Only 7 wards placed throughout the game severely limited map awareness and objective control setup.",
      solutions: [
        "Place minimum 1-2 wards per minute in mid game phases",
        "Purchase and place control wards in river/objective areas",
        "Use trinket proactively on objective entry points"
      ]
    }
  ],
  actionable_improvements: [
    {
      priority: "CRITICAL",
      action: "Implement objective timer awareness system - check major objective spawn timers 90 seconds before spawn",
      impact: "Prevent deaths before objectives which directly cost team preparation time. Estimated 60% reduction in pre-objective deaths."
    },
    {
      priority: "CRITICAL",
      action: "Establish minimum vision control quota - place 1.5+ wards per minute",
      impact: "Improve map awareness enabling better positioning decisions and reducing deaths to ganks/rotations."
    },
    {
      priority: "HIGH",
      action: "Adopt conservative positioning framework - maintain minimum 1500 range from enemy team",
      impact: "Improve survival rate as carry champion while maintaining damage output."
    }
  ],
  game_outcome_analysis: {
    summary: "Victory achieved in 24 minutes despite mixed individual performance. While Azir maintained strong damage output, critical positioning failures nearly cost the game.",
    key_factors: [
      "Early game dominance by Azir established gold lead",
      "Team's macro execution overcame individual struggles",
      "High damage output converted to kills in late game"
    ]
  },
  final_verdict: {
    summary: "Azir delivered exceptional damage output (27k) with strong early game dominance but undermined performance through critical positioning failures at objective timings. Performance rating: 6.5/10",
    key_takeaways: [
      "Objective timing awareness is as critical as damage output",
      "Vision control enables better decision-making",
      "Positioning discipline must be non-negotiable for carry roles",
      "Early dominance creates win condition - use lead wisely"
    ]
  }
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

/* Tab Navigation */
.tabs-container {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(10, 20, 40, 0.95);
  backdrop-filter: blur(20px);
  border-bottom: 2px solid rgba(200, 155, 60, 0.3);
  padding: 1rem 2rem;
}

.tabs-wrapper {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  gap: 1rem;
  align-items: center;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 1rem 2rem;
  background: transparent;
  border: 2px solid rgba(200, 155, 60, 0.3);
  border-radius: 10px;
  color: var(--lol-gold-light);
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.tab-btn:hover {
  background: rgba(200, 155, 60, 0.1);
  border-color: var(--lol-gold);
  transform: translateY(-2px);
}

.tab-btn.active {
  background: linear-gradient(135deg, var(--lol-gold), var(--lol-gold-light));
  border-color: var(--lol-gold);
  color: var(--lol-dark);
  box-shadow: 0 5px 20px rgba(200, 155, 60, 0.4);
}

.tab-icon {
  font-size: 1.3rem;
}

.tab-text {
  font-size: 0.9rem;
}

.reset-btn {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.8rem 1.5rem;
  background: transparent;
  border: 2px solid rgba(255, 70, 85, 0.5);
  border-radius: 10px;
  color: #ff4655;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.reset-btn:hover {
  background: rgba(255, 70, 85, 0.1);
  border-color: #ff4655;
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .section {
    padding: 3rem 1.5rem;
  }

  .tabs-container {
    padding: 0.8rem 1rem;
  }

  .tabs-wrapper {
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .tab-btn {
    padding: 0.8rem 1.2rem;
    font-size: 0.85rem;
  }

  .tab-icon {
    font-size: 1.1rem;
  }

  .tab-text {
    font-size: 0.75rem;
  }

  .reset-btn {
    width: 100%;
    justify-content: center;
    margin-left: 0;
    margin-top: 0.5rem;
  }
}

/* Analysis Section Messages */
.analysis-section {
  background: radial-gradient(circle at 50% 50%, rgba(3, 151, 171, 0.08) 0%, transparent 60%);
}

.analysis-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  padding: 3rem;
  text-align: center;
}

.analysis-message p {
  font-size: 1.2rem;
  color: var(--lol-gold-light);
}

/* Loading Spinner */
.loading-spinner {
  width: 60px;
  height: 60px;
  border: 4px solid rgba(200, 155, 60, 0.2);
  border-top-color: var(--lol-gold);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Error State */
.analysis-message.error {
  color: #ff4655;
}

.error-icon {
  font-size: 3rem;
}

.analysis-message.error p {
  color: #ff4655;
}

.retry-btn {
  padding: 1rem 2rem;
  background: linear-gradient(135deg, var(--lol-gold), var(--lol-gold-light));
  color: var(--lol-dark);
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.retry-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 5px 20px rgba(200, 155, 60, 0.4);
}

.back-btn {
  padding: 1rem 2rem;
  background: transparent;
  color: var(--lol-gold-light);
  border: 2px solid rgba(200, 155, 60, 0.5);
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.back-btn:hover {
  background: rgba(200, 155, 60, 0.1);
  border-color: var(--lol-gold);
  transform: scale(1.05);
}
</style>
