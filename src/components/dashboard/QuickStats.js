export default function QuickStats({ userData }) {
  return (
    <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="bg-gray-800 bg-gray-900 p-6 rounded-xl border border-gray-700">
        <div className="text-xs text-gray-300 uppercase tracking-wide">Today&apos;s Points</div>
        <div className="text-3xl font-black text-green-400 mt-1">
          {userData?.todayPoints || 0}
        </div>
        <div className="text-xs text-gray-400 mt-2">Daily Goal: 50</div>
      </div>
      
      <div className="bg-gray-800 bg-gray-900 p-6 rounded-xl border border-gray-700">
        <div className="text-xs text-gray-300 uppercase tracking-wide">Season Points</div>
        <div className="text-3xl font-black text-blue-400 mt-1">
          {userData?.seasonPoints || 0}
        </div>
        <div className="text-xs text-gray-400 mt-2">Season {new Date().getMonth() + 1}</div>
      </div>
      
      <div className="bg-gray-800 bg-gray-900 p-6 rounded-xl border border-gray-700">
        <div className="text-xs text-gray-300 uppercase tracking-wide">Achievements</div>
        <div className="text-3xl font-black text-purple-400 mt-1">
          {userData?.achievements?.length || 0}
        </div>
        <div className="text-xs text-gray-400 mt-2">Unlocked</div>
      </div>
      
      <div className="bg-gray-800 bg-gray-900 p-6 rounded-xl border border-gray-700">
        <div className="text-xs text-gray-300 uppercase tracking-wide">Streak</div>
        <div className="text-3xl font-black text-yellow-400 mt-1">
          {userData?.streak || 0}
        </div>
        <div className="text-xs text-gray-400 mt-2">Days</div>
      </div>
    </section>
  )
}