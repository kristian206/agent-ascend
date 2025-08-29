'use client'
import { useEffect, useState } from 'react'

export default function MicroCelebration({ type = 'morning' }) {
  const [particles, setParticles] = useState([])
  
  useEffect(() => {
    // Generate confetti particles
    const newParticles = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 0.3,
      duration: 0.8 + Math.random() * 0.4
    }))
    setParticles(newParticles)
  }, [])
  
  const colors = type === 'morning' 
    ? ['#FDE047', '#FB923C', '#FBBF24'] // Yellow/orange for morning
    : ['#A78BFA', '#E879F9', '#C084FC'] // Purple/pink for evening
  
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        {/* Central burst effect */}
        <div className="animate-ping absolute h-32 w-32 rounded-full bg-gradient-to-r from-yellow-400/20 to-orange-400/20" />
        
        {/* Confetti particles */}
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute w-2 h-2 animate-float"
            style={{
              left: `${particle.x}px`,
              top: '0px',
              backgroundColor: colors[particle.id % colors.length],
              animationDelay: `${particle.delay}s`,
              animationDuration: `${particle.duration}s`,
              transform: `rotate(${Math.random() * 360}deg)`
            }}
          />
        ))}
        
        {/* Success message */}
        <div className="relative bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-full font-bold shadow-2xl animate-bounce-in">
          {type === 'morning' ? '🌟 Great start!' : '🎉 Day complete!'}
        </div>
      </div>
      
      <style jsx>{`
        @keyframes float {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(200px) rotate(360deg);
            opacity: 0;
          }
        }
        
        @keyframes bounce-in {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        .animate-float {
          animation: float 1s ease-out forwards;
        }
        
        .animate-bounce-in {
          animation: bounce-in 0.5s ease-out;
        }
      `}</style>
    </div>
  )
}