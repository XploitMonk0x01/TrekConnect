import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import type { PhotoDocument } from '@/services/photos'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('image') as File
    const userId = formData.get('userId') as string
    const userName = formData.get('userName') as string
    const userAvatarUrl = formData.get('userAvatarUrl') as string
    const caption = formData.get('caption') as string
    const destinationName = formData.get('destinationName') as string
    const tags = formData.get('tags') as string

    if (!file || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer())

    // Store the image in MongoDB GridFS
    const db = await getDb()
    const bucket = new db.mongo.GridFSBucket(db)

    const uploadStream = bucket.openUploadStream(file.name, {
      metadata: {
        contentType: file.type,
        userId,
        userName,
        userAvatarUrl,
        caption,
        destinationName,
        tags: tags ? tags.split(',').map((tag: string) => tag.trim()) : [],
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
      tags: tags ? tags.split(',').map((tag: string) => tag.trim()) : [],
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
