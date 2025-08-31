/**
 * Generates a random 6-digit ID
 * @returns {string} A 6-digit string ID
 */
export function generateSixDigitId() {
  // Generate random number between 100000 and 999999
  const id = Math.floor(100000 + Math.random() * 900000)
  return id.toString()
}

/**
 * Checks if an ID already exists in a collection
 * @param {Array} existingIds - Array of existing IDs to check against
 * @param {string} newId - The ID to check
 * @returns {boolean} True if ID exists, false otherwise
 */
export function idExists(existingIds, newId) {
  return existingIds.includes(newId)
}

/**
 * Generates a unique 6-digit ID that doesn't exist in the provided list
 * @param {Array} existingIds - Array of existing IDs to check against
 * @param {number} maxAttempts - Maximum number of attempts to generate unique ID
 * @returns {string} A unique 6-digit string ID
 */
export function generateUniqueId(existingIds = [], maxAttempts = 100) {
  let attempts = 0
  let id
  
  do {
    id = generateSixDigitId()
    attempts++
    
    if (attempts >= maxAttempts) {
      throw new Error('Unable to generate unique ID after maximum attempts')
    }
  } while (idExists(existingIds, id))
  
  return id
}

/**
 * Formats an ID for display (e.g., adds dashes for readability)
 * @param {string} id - The 6-digit ID
 * @returns {string} Formatted ID (e.g., "123-456")
 */
export function formatId(id) {
  if (!id || id.length !== 6) return id
  return `${id.slice(0, 3)}-${id.slice(3)}`
}