'use client'
import { useState } from 'react'
import AvatarSelectorV2 from '@/src/components/common/AvatarSelectorV2'

export default function TestAvatarsPage() {
  const [selectedAvatar, setSelectedAvatar] = useState(null)

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Avatar System Test</h1>
        
        <div className="bg-gray-800 rounded-lg p-6">
          <AvatarSelectorV2
            userName="Test User"
            currentAvatar={selectedAvatar?.url}
            showUpload={true}
            showStatus={true}
            onSelect={(avatarInfo) => {
              console.log('Selected avatar:', avatarInfo)
              setSelectedAvatar(avatarInfo)
            }}
          />
        </div>

        {selectedAvatar && (
          <div className="mt-8 p-6 bg-gray-800 rounded-lg">
            <h2 className="text-xl font-semibold text-white mb-4">Selected Avatar Details</h2>
            <div className="grid grid-cols-2 gap-4 text-gray-300">
              <div>
                <p className="text-sm text-gray-400">URL:</p>
                <p className="text-xs break-all">{selectedAvatar.url}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Type:</p>
                <p>{selectedAvatar.type}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Source:</p>
                <p>{selectedAvatar.source}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Data:</p>
                <pre className="text-xs">{JSON.stringify(selectedAvatar.data, null, 2)}</pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}