'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, PanInfo, useMotionValue, useTransform } from 'framer-motion'
import { UserProfileCard } from './UserProfileCard'
import type { UserProfile } from '@/lib/types'
import { Heart, X } from 'lucide-react'

interface SwipeableCardProps {
  user: UserProfile
  onSwipe: (direction: 'left' | 'right') => void
  isActive: boolean
}

export function SwipeableCard({ user, onSwipe, isActive }: SwipeableCardProps) {
  const [isDragging, setIsDragging] = useState(false)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotate = useTransform(x, [-300, 300], [-30, 30])
  const opacity = useTransform(x, [-300, -150, 0, 150, 300], [0, 1, 1, 1, 0])

  // Enhanced visual feedback transforms for smoother animations
  const likeOpacity = useTransform(x, [25, 150], [0, 1])
  const nopeOpacity = useTransform(x, [-150, -25], [1, 0])
  const likeScale = useTransform(x, [25, 150], [0.5, 1.1])
  const nopeScale = useTransform(x, [-150, -25], [1.1, 0.5])

  // Background color changes
  const backgroundTint = useTransform(
    x,
    [-150, -25, 0, 25, 150],
    [
      'rgba(239, 68, 68, 0.1)', // red tint for left swipe
      'rgba(0, 0, 0, 0)',
      'rgba(0, 0, 0, 0)',
      'rgba(0, 0, 0, 0)',
      'rgba(34, 197, 94, 0.1)', // green tint for right swipe
    ]
  )

  const handleDragStart = () => {
    setIsDragging(true)
  }

  const handleDragEnd = (event: any, info: PanInfo) => {
    setIsDragging(false)

    const swipeThreshold = 120
    const velocityThreshold = 300

    if (
      Math.abs(info.offset.x) > swipeThreshold ||
      Math.abs(info.velocity.x) > velocityThreshold
    ) {
      const direction = info.offset.x > 0 ? 'right' : 'left'
      onSwipe(direction)
    } else {
      // Smooth return to center if not swiped far enough
      x.set(0)
      y.set(0)
    }
  }

  // Reset position when card becomes active
  useEffect(() => {
    if (isActive) {
      x.set(0)
      y.set(0)
    }
  }, [isActive, x, y])

  return (
    <motion.div
      style={{
        x,
        y,
        rotate,
        opacity,
        position: 'absolute',
        width: '100%',
        height: '100%',
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
      drag={isActive ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.2}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      whileDrag={{ scale: 1.02, zIndex: 1000 }}
      transition={{
        type: 'spring',
        stiffness: 400,
        damping: 40,
        mass: 1,
      }}
      className="touch-none"
    >
      {/* Background color overlay for visual feedback */}
      <motion.div
        style={{
          backgroundColor: backgroundTint,
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          borderRadius: '1rem',
          zIndex: 1,
        }}
      />

      {/* Like indicator */}
      <motion.div
        style={{
          opacity: likeOpacity,
          scale: likeScale,
        }}
        className="absolute top-12 left-6 z-20 transform -rotate-12"
      >
        <div className="bg-green-500 text-white px-4 py-3 rounded-xl border-4 border-white shadow-2xl flex items-center gap-2">
          <Heart className="h-6 w-6 fill-white" />
          <span className="text-xl font-bold tracking-wide">LIKE</span>
        </div>
      </motion.div>

      {/* Nope indicator */}
      <motion.div
        style={{
          opacity: nopeOpacity,
          scale: nopeScale,
        }}
        className="absolute top-12 right-6 z-20 transform rotate-12"
      >
        <div className="bg-red-500 text-white px-4 py-3 rounded-xl border-4 border-white shadow-2xl flex items-center gap-2">
          <X className="h-6 w-6" />
          <span className="text-xl font-bold tracking-wide">NOPE</span>
        </div>
      </motion.div>

      {/* The actual card */}
      <div className="w-full h-full relative z-10">
        <UserProfileCard user={user} />
      </div>
    </motion.div>
  )
}
