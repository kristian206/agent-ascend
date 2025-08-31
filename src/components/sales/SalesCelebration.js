'use client'
import { useEffect, useState } from 'react'

export default function SalesCelebration({ type = 'standard', points = 10, onComplete }) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(onComplete, 500)
    }, 3000)
    
    return () => clearTimeout(timer)
  }, [onComplete])

  const celebrations = {
    standard: {
      emoji: '🔔',
      message: 'SALE!',
      color: 'from-yellow-500 to-orange-500'
    },
    milestone: {
      emoji: '🏆',
      message: 'MILESTONE!',
      color: 'from-purple-500 to-pink-500'
    },
    streak: {
      emoji: '🔥',
      message: 'ON FIRE!',
      color: 'from-red-500 to-orange-500'
    }
  }

  const config = celebrations[type] || celebrations.standard

  return (
    <div className={`fixed inset-0 z-[100] pointer-events-none transition-opacity duration-500 ${
      isVisible ? 'opacity-100' : 'opacity-0'
    }`}>
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-gray-8500" />
      
      {/* Bell animation */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className={`relative ${isVisible ? 'animate-ring' : ''}`}>
          <div className="text-[120px] md:text-[200px] animate-bounce">
            {config.emoji}
          </div>
          
          {/* Points burst */}
          <div className={`absolute top-0 right-0 bg-gradient-to-r ${config.color} text-white text-2xl md:text-3xl font-black px-4 py-2 rounded-full animate-pulse`}>
            +{points}
          </div>
        </div>
      </div>
      
      {/* Message */}
      <div className="absolute inset-x-0 top-1/3 text-center">
        <h1 className={`text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r ${config.color} animate-pulse`}>
          {config.message}
        </h1>
      </div>
      
      {/* Confetti particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-confetti"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 0.5}s`,
              animationDuration: `${2 + Math.random()}s`
            }}
          >
            <div className={`w-2 h-2 md:w-3 md:h-3 bg-gradient-to-r ${
              ['from-yellow-400 to-yellow-600', 'from-pink-400 to-pink-600', 'from-blue-400 to-blue-600', 'from-green-400 to-green-600'][i % 4]
            } rounded-full`} />
          </div>
        ))}
      </div>
      
      <style jsx>{`
        @keyframes ring {
          0%, 100% { transform: rotate(0deg); }
          10%, 30%, 50%, 70%, 90% { transform: rotate(10deg); }
          20%, 40%, 60%, 80% { transform: rotate(-10deg); }
        }
        
        @keyframes confetti {
          0% {
            transform: translateY(-100vh) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        
        .animate-ring {
          animation: ring 0.5s ease-in-out;
        }
        
        .animate-confetti {
          animation: confetti linear;
        }
      `}</style>
    </div>
  )
}