import { NextRequest, NextResponse } from 'next/server'
import { createPhoto } from '@/services/photos'
import { z } from 'zod'
import type { CreatePhotoInput } from '@/lib/types'

// Schema for validating photo upload data
const photoUploadSchema = z.object({
  imageUrl: z.string().min(1, 'Image URL is required'),
  caption: z.string().max(500).optional(),
  destinationName: z.string().max(100).optional(),
  tags: z.array(z.string()).optional(),
  userId: z.string().min(1, 'User ID is required'),
  userName: z.string().min(1, 'User name is required'),
  userAvatarUrl: z.string().nullable().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate the incoming data
    const validationResult = photoUploadSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid photo data',
          details: validationResult.error.errors,
        },
        { status: 400 }
      )
    }

    const photoData: CreatePhotoInput = validationResult.data

    // Create the photo using the existing service
    const newPhoto = await createPhoto(photoData)

    return NextResponse.json(
      {
        message: 'Photo uploaded successfully',
        photo: newPhoto,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error uploading photo:', error)
    return NextResponse.json(
      { error: 'Failed to upload photo' },
      { status: 500 }
    )
  }
}
