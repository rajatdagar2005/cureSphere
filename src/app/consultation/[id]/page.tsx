'use client'

import { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth, db } from '@/app/Firebase/config'
import { doc, getDoc } from 'firebase/firestore'
import ChatWindow from '@/components/chat/chat-window'
import VideoCall from '@/components/video/video-call'
import { Button } from "@/components/ui/button"
import { Phone } from 'lucide-react'

export default function ConsultationPage() {
  const [user] = useAuthState(auth)
  const params = useParams()
  const [otherUser, setOtherUser] = useState<any>(null)
  const [isInCall, setIsInCall] = useState(false)
  const [loading, setLoading] = useState(true)
  const searchParams = useSearchParams()

  useEffect(() => {
    // Start call immediately if URL has call parameter
    if (searchParams.get('call') === 'true') {
      setIsInCall(true)
    }
  }, [searchParams])

  useEffect(() => {
    const fetchOtherUser = async () => {
      if (!user) return

      try {
        const docRef = doc(db, 'users', params.id.toString())
        const docSnap = await getDoc(docRef)
        
        if (docSnap.exists()) {
          setOtherUser({ id: docSnap.id, ...docSnap.data() })
        }
      } catch (error) {
        console.error('Error fetching user:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchOtherUser()
  }, [user, params.id])

  if (loading || !user || !otherUser) {
    return <div>Loading...</div>
  }

  const chatId = [user.uid, otherUser.id].sort().join('-')
  const callId = `call-${chatId}`

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="mb-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          Consultation with {otherUser.name}
        </h1>
        {!isInCall && (
          <Button onClick={() => setIsInCall(true)}>
            <Phone className="mr-2 h-4 w-4" />
            Start Video Call
          </Button>
        )}
      </div>

      {isInCall ? (
        <VideoCall
          callId={callId}
          currentUser={user}
          otherUser={otherUser}
          onEndCall={() => setIsInCall(false)}
          isDoctor={user.role === 'doctor'}
        />
      ) : (
        <ChatWindow
          chatId={chatId}
          currentUser={user}
          otherUser={otherUser}
        />
      )}
    </div>
  )
} 