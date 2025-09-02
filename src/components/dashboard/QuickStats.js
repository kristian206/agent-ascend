'use client'
import { useAnimatedValue } from '@/src/hooks/useRealtimeUser'
import { useState, useEffect } from 'react'

function AnimatedStat({ value, color, label, sublabel }) {
  const { displayValue, isAnimating } = useAnimatedValue(value || 0)
  const [highlighted, setHighlighted] = useState(false)
  const [prevValue, setPrevValue] = useState(value)

  useEffect(() => {
    if (value !== prevValue && value > prevValue) {
      setHighlighted(true)
      setPrevValue(value)
      setTimeout(() => setHighlighted(false), 1000)
    }
  }, [value, prevValue])

  return (
    <div className={`bg-gray-800 bg-gray-900 p-6 rounded-xl border border-gray-700 transition-all duration-300 ${
      highlighted ? 'ring-2 ring-white/20 scale-[1.02]' : ''
    }`}>
      <div className="text-xs text-gray-300 uppercase tracking-wide">{label}</div>
      <div className={`text-3xl font-black mt-1 transition-all duration-300 ${
        isAnimating ? 'scale-110' : 'scale-100'
      } ${color}`}>
        {displayValue}
        {isAnimating && (
          <span className="ml-2 text-xs text-green-400 animate-pulse">↑</span>
        )}
      </div>
      <div className="text-xs text-gray-400 mt-2">{sublabel}</div>
    </div>
  )
}

export default function QuickStats({ userData }) {
  return (
    <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <AnimatedStat 
        value={userData?.todayPoints}
        color="text-green-400"
        label="Today's Points"
        sublabel="Daily Goal: 50"
      />
      
      <AnimatedStat 
        value={userData?.seasonPoints}
        color="text-blue-400"
        label="Season Points"
        sublabel={`Season ${new Date().getMonth() + 1}`}
      />
      
      <AnimatedStat 
        value={userData?.achievements?.length}
        color="text-purple-400"
        label="Achievements"
        sublabel="Unlocked"
      />
      
      <AnimatedStat 
        value={userData?.streak}
        color="text-yellow-400"
        label="Streak"
        sublabel="Days"
      />
    </section>
  )
}