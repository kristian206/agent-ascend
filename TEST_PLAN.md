# User/Member Refactoring Test Plan

## Overview
This test plan verifies that the refactoring to clarify user vs member terminology has not broken any functionality.

## Key Changes Made
1. Created `NAMING_CONVENTIONS.md` documentation
2. Created `src/utils/userUtils.js` with centralized functions
3. Updated collection references from 'users' to 'members' where needed
4. Added clarifying comments throughout the codebase

## Test Cases

### 1. Authentication & User Creation
- [ ] User can sign up with email/password
- [ ] New user document is created in 'members' collection
- [ ] User can log in successfully
- [ ] User session persists on refresh

### 2. User Profile & Data
- [ ] User profile loads correctly
- [ ] User data updates work (name, avatar, etc.)
- [ ] Points display correctly (todayPoints, seasonPoints, lifetimePoints)
- [ ] Streak tracking works

### 3. Sales Logging
- [ ] Sales can be logged successfully
- [ ] Points are awarded correctly:
  - Home: 15 points
  - Life: 20 points
  - Car: 10 points
- [ ] Dashboard updates in real-time after sale
- [ ] Monthly totals are updated

### 4. Team Features
- [ ] Team roster displays correctly
- [ ] Team members show in team views
- [ ] Team commission overview works
- [ ] Team goals can be created and tracked

### 5. Real-time Updates
- [ ] Dashboard reflects changes immediately
- [ ] Points update without refresh
- [ ] Streak updates correctly
- [ ] Banner displays current data

### 6. Check-in System
- [ ] Daily check-in works
- [ ] Points awarded for check-in (5 points)
- [ ] Streak maintained with check-in

### 7. Leaderboard
- [ ] Leaderboard displays all users
- [ ] Sorting by points works
- [ ] Filtering by team works

## Database Verification

### Collections to Check
1. **members** - Should contain all user accounts
2. **sales** - Should reference userId from members
3. **activities** - Should reference userId from members
4. **checkins** - Should use userId_date format
5. **monthlyTotals** - Should aggregate correctly

## Console Checks
Monitor browser console for:
- No Firebase permission errors
- No undefined reference errors
- No collection mismatch warnings

## Performance
- [ ] Page load time < 3 seconds
- [ ] No unnecessary re-renders
- [ ] Real-time updates don't cause lag

## Status: READY FOR TESTING

All refactoring is complete. The application should function identically to before, but with clearer code organization and naming conventions.