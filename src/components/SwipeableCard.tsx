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
  const rotate = useTransform(x, [-200, 200], [-25, 25])
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0])

  // Visual feedback transforms
  const likeOpacity = useTransform(x, [0, 100, 200], [0, 0.5, 1])
  const nopeOpacity = useTransform(x, [-200, -100, 0], [1, 0.5, 0])
  const likeScale = useTransform(x, [0, 100, 200], [0.8, 1, 1.2])
  const nopeScale = useTransform(x, [-200, -100, 0], [1.2, 1, 0.8])

  const handleDragStart = () => {
    setIsDragging(true)
  }

  const handleDragEnd = (event: any, info: PanInfo) => {
    setIsDragging(false)

    const swipeThreshold = 100
    const velocityThreshold = 500

    if (
      Math.abs(info.offset.x) > swipeThreshold ||
      Math.abs(info.velocity.x) > velocityThreshold
    ) {
      const direction = info.offset.x > 0 ? 'right' : 'left'
      onSwipe(direction)
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
      dragElastic={0.8}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      whileDrag={{ scale: 1.05 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="touch-none"
    >
      {/* Like indicator */}
      <motion.div
        style={{
          opacity: likeOpacity,
          scale: likeScale,
        }}
        className="absolute top-8 left-8 z-10 transform -rotate-12"
      >
        <div className="bg-green-500 text-white px-6 py-2 rounded-lg border-4 border-white shadow-lg">
          <Heart className="h-8 w-8 fill-white" />
          <span className="block text-sm font-bold">LIKE</span>
        </div>
      </motion.div>

      {/* Nope indicator */}
      <motion.div
        style={{
          opacity: nopeOpacity,
          scale: nopeScale,
        }}
        className="absolute top-8 right-8 z-10 transform rotate-12"
      >
        <div className="bg-red-500 text-white px-6 py-2 rounded-lg border-4 border-white shadow-lg">
          <X className="h-8 w-8" />
          <span className="block text-sm font-bold">NOPE</span>
        </div>
      </motion.div>

      {/* The actual card */}
      <div className="w-full h-full">
        <UserProfileCard user={user} />
      </div>
    </motion.div>
  )
}
