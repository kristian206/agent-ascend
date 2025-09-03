import { 
  collection, query, where, orderBy, limit, getDocs, 
  writeBatch, doc, getDoc, onSnapshot 
} from 'firebase/firestore'
import { db } from '@/src/services/firebase'
import { cache } from 'react'

// Cache Firebase reads for 5 minutes
const CACHE_DURATION = 5 * 60 * 1000
const queryCache = new Map()

// React cache for server components
export const getCachedUserData = cache(async (userId) => {
  const userRef = doc(db, 'members', userId)
  const userDoc = await getDoc(userRef)
  return userDoc.exists() ? userDoc.data() : null
})

// Optimized batch read for multiple documents
export async function batchGetDocs(refs) {
  const promises = refs.map(ref => getDoc(ref))
  const docs = await Promise.all(promises)
  return docs.map(doc => doc.exists() ? { id: doc.id, ...doc.data() } : null)
}

// Cached query with automatic cleanup
export async function cachedQuery(queryKey, queryBuilder) {
  const cached = queryCache.get(queryKey)
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data
  }
  
  const snapshot = await getDocs(queryBuilder)
  const data = []
  snapshot.forEach(doc => {
    data.push({ id: doc.id, ...doc.data() })
  })
  
  queryCache.set(queryKey, { data, timestamp: Date.now() })
  
  // Cleanup old cache entries
  if (queryCache.size > 100) {
    const oldest = Array.from(queryCache.entries())
      .sort((a, b) => a[1].timestamp - b[1].timestamp)
      .slice(0, 50)
    oldest.forEach(([key]) => queryCache.delete(key))
  }
  
  return data
}

// Optimized real-time listener with scope limiting
export function createOptimizedListener(
  collectionName, 
  filters = [], 
  orderByField = 'timestamp',
  limitCount = 10,
  callback
) {
  let q = collection(db, collectionName)
  
  // Apply filters
  filters.forEach(filter => {
    q = query(q, where(...filter))
  })
  
  // Add ordering and limit
  q = query(q, orderBy(orderByField, 'desc'), limit(limitCount))
  
  // Return unsubscribe function
  return onSnapshot(q, 
    (snapshot) => {
      const data = []
      snapshot.forEach(doc => {
        data.push({ id: doc.id, ...doc.data() })
      })
      callback(data)
    },
    (error) => {
      console.error(`Listener error for ${collectionName}:`, error)
      callback([])
    }
  )
}

// Batch write operations
export async function batchWrite(operations) {
  const batch = writeBatch(db)
  const MAX_BATCH_SIZE = 500
  let operationCount = 0
  
  for (const op of operations) {
    if (op.type === 'set') {
      batch.set(doc(db, op.collection, op.id), op.data, op.options || {})
    } else if (op.type === 'update') {
      batch.update(doc(db, op.collection, op.id), op.data)
    } else if (op.type === 'delete') {
      batch.delete(doc(db, op.collection, op.id))
    }
    
    operationCount++
    
    // Commit and start new batch if limit reached
    if (operationCount >= MAX_BATCH_SIZE) {
      await batch.commit()
      operationCount = 0
    }
  }
  
  // Commit remaining operations
  if (operationCount > 0) {
    await batch.commit()
  }
}

// Optimistic update helper
export function optimisticUpdate(localSetter, serverUpdate, rollback) {
  return async (newData) => {
    // Update UI immediately
    localSetter(newData)
    
    try {
      // Sync with server
      await serverUpdate(newData)
    } catch (error) {
      console.error('Optimistic update failed:', error)
      // Rollback on error
      if (rollback) rollback()
      throw error
    }
  }
}

// Query pagination helper
export class PaginatedQuery {
  constructor(collectionName, filters = [], orderByField = 'timestamp', pageSize = 20) {
    this.collectionName = collectionName
    this.filters = filters
    this.orderByField = orderByField
    this.pageSize = pageSize
    this.lastDoc = null
    this.hasMore = true
  }
  
  async getNextPage() {
    if (!this.hasMore) return []
    
    let q = collection(db, this.collectionName)
    
    this.filters.forEach(filter => {
      q = query(q, where(...filter))
    })
    
    q = query(q, orderBy(this.orderByField, 'desc'), limit(this.pageSize))
    
    if (this.lastDoc) {
      q = query(q, startAfter(this.lastDoc))
    }
    
    const snapshot = await getDocs(q)
    const data = []
    
    snapshot.forEach(doc => {
      data.push({ id: doc.id, ...doc.data() })
    })
    
    if (snapshot.docs.length > 0) {
      this.lastDoc = snapshot.docs[snapshot.docs.length - 1]
    }
    
    this.hasMore = snapshot.docs.length === this.pageSize
    
    return data
  }
  
  reset() {
    this.lastDoc = null
    this.hasMore = true
  }
}