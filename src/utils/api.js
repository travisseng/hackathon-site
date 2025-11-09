/**
 * API utility for fetching League of Legends player stats
 *
 * Usage:
 * import { fetchPlayerStats } from './utils/api'
 *
 * const stats = await fetchPlayerStats('playerName', 'region')
 */

// Configure your backend API endpoint
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

/**
 * Fetch player statistics from your backend
 * @param {string} summonerName - Summoner name
 * @param {string} tagLine - Tag line (e.g., 'EUW')
 * @param {string} region - Region (e.g., 'na1', 'euw1', 'kr')
 * @param {number} year - Year for stats (default: current year)
 * @returns {Promise<Object>} Player statistics
 */
export async function fetchPlayerStats(summonerName, tagLine, region = 'euw1', year = new Date().getFullYear()) {
  try {
    // Construct the full riot ID (summonerName#tagLine)
    const riotId = `${summonerName}#${tagLine}`

    const response = await fetch(
      `${API_BASE_URL}/stats/${encodeURIComponent(riotId)}?region=${region}&year=${year}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(errorText || `Failed to fetch stats: ${response.statusText}`)
    }

    const data = await response.json()
    return validateStatsData(data)
  } catch (error) {
    console.error('Error fetching player stats:', error)
    throw error
  }
}

/**
 * Validate that the stats data has the required structure
 * @param {Object} data - Stats data from API
 * @returns {Object} Validated data
 * @throws {Error} If data is invalid
 */
function validateStatsData(data) {
  const requiredSections = [
    'game_duration',
    'role_champs_played',
    'deaths_stats',
    'kills_assists_stats',
    'metrics',
    'objectives'
  ]

  for (const section of requiredSections) {
    if (!data[section]) {
      throw new Error(`Missing required section: ${section}`)
    }
  }

  return data
}

/**
 * Fetch the latest DataDragon version
 * @returns {Promise<string>} Latest version string (e.g., '14.1.1')
 */
export async function getLatestDataDragonVersion() {
  try {
    const response = await fetch('https://ddragon.leagueoflegends.com/api/versions.json')
    const versions = await response.json()
    return versions[0] // First item is the latest version
  } catch (error) {
    console.error('Error fetching DataDragon version:', error)
    return '14.1.1' // Fallback version
  }
}

/**
 * Get champion image URL from DataDragon
 * @param {string} championName - Champion name
 * @param {string} version - DataDragon version
 * @returns {string} Image URL
 */
export function getChampionImageUrl(championName, version = '14.1.1') {
  // Clean champion name (remove spaces, special characters)
  const cleanName = championName.replace(/[^a-zA-Z]/g, '')
  return `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${cleanName}.png`
}

/**
 * Format time duration to readable string
 * @param {number} seconds - Duration in seconds
 * @returns {string} Formatted duration (e.g., '02 day(s) 16 hour(s) 45 minute(s)')
 */
export function formatDuration(seconds) {
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)

  return `${String(days).padStart(2, '0')} day(s) ${String(hours).padStart(2, '0')} hour(s) ${String(minutes).padStart(2, '0')} minute(s)`
}

/**
 * Calculate win rate
 * @param {number} wins - Number of wins
 * @param {number} losses - Number of losses
 * @returns {number} Win rate as decimal (0-1)
 */
export function calculateWinRate(wins, losses) {
  const total = wins + losses
  return total > 0 ? wins / total : 0
}

/**
 * Example usage in a Vue component:
 *
 * <script setup>
 * import { ref, onMounted } from 'vue'
 * import { fetchPlayerStats } from './utils/api'
 *
 * const statsData = ref(null)
 * const loading = ref(true)
 * const error = ref(null)
 *
 * onMounted(async () => {
 *   try {
 *     statsData.value = await fetchPlayerStats('YourSummonerName', 'na1')
 *   } catch (err) {
 *     error.value = err.message
 *   } finally {
 *     loading.value = false
 *   }
 * })
 * </script>
 */
