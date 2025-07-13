import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { GridFSBucket } from 'mongodb'
import type { PhotoDocument } from '@/services/photos'
import { z } from 'zod'

// Define a schema for the form data for validation
const uploadPhotoSchema = z.object({
  image: z.instanceof(File, { message: 'Image is required.' }),
  userId: z.string().min(1, { message: 'User ID is required.' }),
  userName: z.string().min(1, { message: 'User name is required.' }),
  userAvatarUrl: z.string().url().or(z.literal('')),
  caption: z.string().max(500).optional(),
  destinationName: z.string().max(100).optional(),
  tags: z.string().max(200).optional(),
})

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('image') as File | null
    const tagsString = formData.get('tags') as string | null

    // Validate the form data
    const validation = uploadPhotoSchema.safeParse({
      image: file,
      userId: formData.get('userId'),
      userName: formData.get('userName'),
      userAvatarUrl: formData.get('userAvatarUrl') || '',
      caption: formData.get('caption'),
      destinationName: formData.get('destinationName'),
      tags: tagsString,
    })

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid form data', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    const {
      image,
      userId,
      userName,
      userAvatarUrl,
      caption,
      destinationName,
    } = validation.data
    const tags = tagsString
      ? tagsString.split(',').map((tag: string) => tag.trim())
      : []

    // Convert file to buffer
    const buffer = Buffer.from(await image.arrayBuffer())

    // Store the image in MongoDB GridFS
    const db = await getDb()
    const bucket = new GridFSBucket(db)

    const uploadStream = bucket.openUploadStream(image.name, {
      metadata: {
        contentType: image.type,
        userId,
        userName,
        userAvatarUrl,
        caption,
        destinationName,
        tags,
      },
    })

    await new Promise((resolve, reject) => {
      uploadStream.on('finish', resolve)
      uploadStream.on('error', reject)
      uploadStream.end(buffer)
    })

    // Create a photo document
    const photoDoc: Omit<PhotoDocument, '_id'> = {
      userId,
      userName,
      userAvatarUrl,
      imageUrl: `/api/photos/${uploadStream.id}`, // URL to fetch the image
      destinationName,
      caption,
      tags,
      uploadedAt: new Date(),
      likesCount: 0,
      commentsCount: 0,
      likes: [],
    }

    const result = await db.collection('photos').insertOne(photoDoc)

    return NextResponse.json({
      id: result.insertedId.toString(),
      ...photoDoc,
    })
  } catch (error) {
    console.error('Error uploading photo:', error)
    return NextResponse.json(
      { error: 'Failed to upload photo' },
      { status: 500 }
    )
  }
}
