import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, serverTimestamp, increment, deleteField } from 'firebase/firestore'
import { db } from '@/src/services/firebase'
import { generateUniqueId } from '@/src/utils/idGenerator'

// Generate a unique 6-character join code
export function generateJoinCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // Avoid confusing characters
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

// Check if join code is unique
export async function isJoinCodeUnique(code) {
  const teamsQuery = query(collection(db, 'teams'), where('joinCode', '==', code), where('isActive', '==', true))
  const snapshot = await getDocs(teamsQuery)
  return snapshot.empty
}

// Generate a unique join code (with retry logic)
export async function generateUniqueJoinCode() {
  let attempts = 0
  while (attempts < 10) {
    const code = generateJoinCode()
    if (await isJoinCodeUnique(code)) {
      return code
    }
    attempts++
  }
  throw new Error('Could not generate unique join code')
}

// Create a new team
export async function createTeam(userId, teamName, teamDescription) {
  try {
    // Check if user already has a team
    const userDoc = await getDoc(doc(db, 'members', userId))
    const userData = userDoc.data()
    
    if (userData?.teamId) {
      throw new Error('You are already in a team. Leave your current team first.')
    }
    
    // Get all existing team IDs to ensure uniqueness
    const teamsQuery = query(collection(db, 'teams'))
    const teamsSnapshot = await getDocs(teamsQuery)
    const existingTeamIds = []
    teamsSnapshot.forEach(doc => {
      if (doc.data().teamNumber) {
        existingTeamIds.push(doc.data().teamNumber)
      }
    })
    
    // Generate unique join code and team ID
    const joinCode = await generateUniqueJoinCode()
    const teamNumber = generateUniqueId(existingTeamIds)
    
    // Create team document
    const teamRef = doc(collection(db, 'teams'))
    const teamData = {
      id: teamRef.id,
      teamNumber,
      name: teamName.trim(),
      description: teamDescription.trim(),
      leaderId: userId,
      joinCode,
      memberCount: 1,
      weeklyActive: 1,
      isActive: true,
      createdAt: serverTimestamp(),
      coLeaders: [],
      members: [userId]
    }
    
    await setDoc(teamRef, teamData)
    
    // Update user's team info
    await updateDoc(doc(db, 'members', userId), {
      teamId: teamRef.id,
      teamRole: 'leader',
      teamJoinedAt: serverTimestamp()
    })
    
    return { success: true, teamId: teamRef.id, joinCode }
  } catch (error) {
    console.error('Error creating team:', error)
    return { success: false, error: error.message }
  }
}

// Join a team with a code
export async function joinTeam(userId, joinCode) {
  try {
    // Check if user already has a team
    const userDoc = await getDoc(doc(db, 'members', userId))
    const userData = userDoc.data()
    
    if (userData?.teamId) {
      throw new Error('You are already in a team. Leave your current team first.')
    }
    
    // Find team by join code
    const teamsQuery = query(
      collection(db, 'teams'),
      where('joinCode', '==', joinCode.toUpperCase()),
      where('isActive', '==', true)
    )
    const snapshot = await getDocs(teamsQuery)
    
    if (snapshot.empty) {
      throw new Error('Invalid team code or team not found.')
    }
    
    const teamDoc = snapshot.docs[0]
    const teamData = teamDoc.data()
    
    // Check team size limit
    if (teamData.memberCount >= 50) {
      throw new Error('This team is full (50 members max).')
    }
    
    // Add user to team
    await updateDoc(doc(db, 'teams', teamDoc.id), {
      memberCount: increment(1),
      members: [...(teamData.members || []), userId]
    })
    
    // Update user's team info
    await updateDoc(doc(db, 'members', userId), {
      teamId: teamDoc.id,
      teamRole: 'member',
      teamJoinedAt: serverTimestamp()
    })
    
    return { success: true, teamId: teamDoc.id, teamName: teamData.name }
  } catch (error) {
    console.error('Error joining team:', error)
    return { success: false, error: error.message }
  }
}

// Leave or kick from team
export async function leaveTeam(userId, targetUserId = null) {
  try {
    const leavingUserId = targetUserId || userId
    
    // Get user's team info
    const userDoc = await getDoc(doc(db, 'members', leavingUserId))
    const userData = userDoc.data()
    
    if (!userData?.teamId) {
      throw new Error('User is not in a team.')
    }
    
    // Get team data
    const teamDoc = await getDoc(doc(db, 'teams', userData.teamId))
    const teamData = teamDoc.data()
    
    // Check permissions for kicking
    if (targetUserId && targetUserId !== userId) {
      const kickerDoc = await getDoc(doc(db, 'members', userId))
      const kickerData = kickerDoc.data()
      
      if (kickerData.teamRole === 'member') {
        throw new Error('Only leaders and co-leaders can kick members.')
      }
      
      if (kickerData.teamRole === 'co-leader' && userData.teamRole !== 'member') {
        throw new Error('Co-leaders can only kick regular members.')
      }
      
      if (userData.teamRole === 'leader') {
        throw new Error('Cannot kick the team leader.')
      }
    }
    
    // Handle leader leaving
    if (userData.teamRole === 'leader' && !targetUserId) {
      // Find replacement leader
      let newLeaderId = null
      
      // First try co-leaders
      if (teamData.coLeaders && teamData.coLeaders.length > 0) {
        // Get all co-leaders and sort by join date
        const coLeaderDocs = await Promise.all(
          teamData.coLeaders.map(id => getDoc(doc(db, 'members', id)))
        )
        const sortedCoLeaders = coLeaderDocs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .sort((a, b) => a.teamJoinedAt - b.teamJoinedAt)
        
        if (sortedCoLeaders.length > 0) {
          newLeaderId = sortedCoLeaders[0].id
        }
      }
      
      // If no co-leaders, try regular members
      if (!newLeaderId && teamData.members && teamData.members.length > 1) {
        const otherMembers = teamData.members.filter(id => id !== leavingUserId)
        const memberDocs = await Promise.all(
          otherMembers.map(id => getDoc(doc(db, 'members', id)))
        )
        const sortedMembers = memberDocs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(m => m.teamRole === 'member')
          .sort((a, b) => a.teamJoinedAt - b.teamJoinedAt)
        
        if (sortedMembers.length > 0) {
          newLeaderId = sortedMembers[0].id
        }
      }
      
      // Promote new leader
      if (newLeaderId) {
        await updateDoc(doc(db, 'teams', userData.teamId), {
          leaderId: newLeaderId,
          coLeaders: teamData.coLeaders.filter(id => id !== newLeaderId)
        })
        await updateDoc(doc(db, 'members', newLeaderId), {
          teamRole: 'leader'
        })
      }
    }
    
    // Remove user from team members list
    const updatedMembers = (teamData.members || []).filter(id => id !== leavingUserId)
    const updatedCoLeaders = (teamData.coLeaders || []).filter(id => id !== leavingUserId)
    
    // Update team
    if (updatedMembers.length === 0) {
      // Last member leaving, deactivate team
      await updateDoc(doc(db, 'teams', userData.teamId), {
        memberCount: 0,
        members: [],
        coLeaders: [],
        isActive: false
      })
    } else {
      await updateDoc(doc(db, 'teams', userData.teamId), {
        memberCount: increment(-1),
        members: updatedMembers,
        coLeaders: updatedCoLeaders
      })
    }
    
    // Clear user's team info
    await updateDoc(doc(db, 'members', leavingUserId), {
      teamId: deleteField(),
      teamRole: deleteField(),
      teamJoinedAt: deleteField()
    })
    
    return { success: true }
  } catch (error) {
    console.error('Error leaving team:', error)
    return { success: false, error: error.message }
  }
}

// Promote member (member -> senior -> co-leader)
export async function promoteMember(leaderId, targetUserId, targetRole = null) {
  try {
    // Verify leader permissions
    const leaderDoc = await getDoc(doc(db, 'members', leaderId))
    const leaderData = leaderDoc.data()
    
    if (leaderData.teamRole !== 'leader' && leaderData.teamRole !== 'co-leader') {
      throw new Error('Only team leaders and co-leaders can promote members.')
    }
    
    // Get target member data
    const targetDoc = await getDoc(doc(db, 'members', targetUserId))
    const targetData = targetDoc.data()
    
    // Get team data
    const teamDoc = await getDoc(doc(db, 'teams', leaderData.teamId))
    const teamData = teamDoc.data()
    
    // Determine next role in hierarchy
    let newRole = targetRole
    if (!newRole) {
      if (targetData.teamRole === 'member') {
        newRole = 'senior'
      } else if (targetData.teamRole === 'senior') {
        newRole = 'co-leader'
      } else {
        throw new Error('Cannot promote this member further.')
      }
    }
    
    // Check permissions for specific promotions
    if (newRole === 'co-leader') {
      if (leaderData.teamRole !== 'leader') {
        throw new Error('Only team leaders can promote to co-leader.')
      }
      
      // Check co-leader limit
      if ((teamData.coLeaders || []).length >= 4) {
        throw new Error('Maximum 4 co-leaders allowed.')
      }
      
      // Update team's co-leaders list
      await updateDoc(doc(db, 'teams', leaderData.teamId), {
        coLeaders: [...(teamData.coLeaders || []), targetUserId],
        seniors: (teamData.seniors || []).filter(id => id !== targetUserId)
      })
    } else if (newRole === 'senior') {
      // Update team's seniors list
      await updateDoc(doc(db, 'teams', leaderData.teamId), {
        seniors: [...(teamData.seniors || []), targetUserId]
      })
    }
    
    // Update user role
    await updateDoc(doc(db, 'members', targetUserId), {
      teamRole: newRole,
      promotedAt: serverTimestamp()
    })
    
    return { success: true, newRole }
  } catch (error) {
    console.error('Error promoting member:', error)
    return { success: false, error: error.message }
  }
}

// Demote member (co-leader -> senior -> member)
export async function demoteMember(leaderId, targetUserId, targetRole = null) {
  try {
    // Verify leader permissions
    const leaderDoc = await getDoc(doc(db, 'members', leaderId))
    const leaderData = leaderDoc.data()
    
    if (leaderData.teamRole !== 'leader' && leaderData.teamRole !== 'co-leader') {
      throw new Error('Only team leaders and co-leaders can demote members.')
    }
    
    // Get target member data
    const targetDoc = await getDoc(doc(db, 'members', targetUserId))
    const targetData = targetDoc.data()
    
    // Get team data
    const teamDoc = await getDoc(doc(db, 'teams', leaderData.teamId))
    const teamData = teamDoc.data()
    
    // Determine new role
    let newRole = targetRole
    if (!newRole) {
      if (targetData.teamRole === 'co-leader') {
        newRole = 'senior'
      } else if (targetData.teamRole === 'senior') {
        newRole = 'member'
      } else {
        throw new Error('Cannot demote regular members.')
      }
    }
    
    // Check permissions
    if (targetData.teamRole === 'co-leader' && leaderData.teamRole !== 'leader') {
      throw new Error('Only team leaders can demote co-leaders.')
    }
    
    // Update team lists
    if (targetData.teamRole === 'co-leader') {
      await updateDoc(doc(db, 'teams', leaderData.teamId), {
        coLeaders: (teamData.coLeaders || []).filter(id => id !== targetUserId),
        seniors: newRole === 'senior' ? [...(teamData.seniors || []), targetUserId] : (teamData.seniors || [])
      })
    } else if (targetData.teamRole === 'senior') {
      await updateDoc(doc(db, 'teams', leaderData.teamId), {
        seniors: (teamData.seniors || []).filter(id => id !== targetUserId)
      })
    }
    
    // Update user role
    await updateDoc(doc(db, 'members', targetUserId), {
      teamRole: newRole,
      demotedAt: serverTimestamp()
    })
    
    return { success: true, newRole }
  } catch (error) {
    console.error('Error demoting member:', error)
    return { success: false, error: error.message }
  }
}

// Update team settings
export async function updateTeamSettings(leaderId, teamId, updates) {
  try {
    // Verify leader permissions
    const leaderDoc = await getDoc(doc(db, 'members', leaderId))
    const leaderData = leaderDoc.data()
    
    if (leaderData.teamRole !== 'leader' || leaderData.teamId !== teamId) {
      throw new Error('Only team leaders can update team settings.')
    }
    
    // Update team
    await updateDoc(doc(db, 'teams', teamId), {
      ...updates,
      updatedAt: serverTimestamp()
    })
    
    return { success: true }
  } catch (error) {
    console.error('Error updating team:', error)
    return { success: false, error: error.message }
  }
}

// Get team stats
export async function getTeamStats(teamId) {
  try {
    const teamDoc = await getDoc(doc(db, 'teams', teamId))
    const teamData = teamDoc.data()
    
    if (!teamData) {
      throw new Error('Team not found.')
    }
    
    // Get all team members' check-ins for the week
    const today = new Date()
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    const weekAgoKey = weekAgo.toISOString().split('T')[0]
    
    let totalCheckIns = 0
    let totalSales = 0
    let totalQuotes = 0
    let activeMembers = new Set()
    
    for (const memberId of teamData.members || []) {
      // Check last 7 days of check-ins
      for (let i = 0; i < 7; i++) {
        const checkDate = new Date(today.getTime() - i * 24 * 60 * 60 * 1000)
        const dateKey = checkDate.toISOString().split('T')[0]
        
        const checkInDoc = await getDoc(doc(db, 'checkins', `${memberId}_${dateKey}`))
        if (checkInDoc.exists()) {
          const checkInData = checkInDoc.data()
          if (checkInData.intentions_completed) totalCheckIns++
          if (checkInData.wrap_completed) totalCheckIns++
          totalSales += checkInData.sales || 0
          totalQuotes += checkInData.quotes || 0
          activeMembers.add(memberId)
        }
      }
    }
    
    return {
      memberCount: teamData.memberCount,
      weeklyActive: activeMembers.size,
      weeklyCheckIns: totalCheckIns,
      weeklySales: totalSales,
      weeklyQuotes: totalQuotes,
      avgCheckInsPerMember: teamData.memberCount > 0 ? (totalCheckIns / teamData.memberCount).toFixed(1) : 0
    }
  } catch (error) {
    console.error('Error getting team stats:', error)
    return null
  }
}