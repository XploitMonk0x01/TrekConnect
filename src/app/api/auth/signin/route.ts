
import { compare } from 'bcryptjs';
import { sign } from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import type { UserProfile } from '@/lib/types'; // Assuming UserProfile is adapted
import { ObjectId } from 'mongodb';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in the environment variables');
}

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Missing required fields: email and password' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const usersCollection = db.collection('users');

    const userDoc = await usersCollection.findOne({ email });
    if (!userDoc) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const isValidPassword = await compare(password, userDoc.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }
    
    // Update lastLoginAt
    const updatedUser = await usersCollection.findOneAndUpdate(
        { _id: userDoc._id },
        { $set: { lastLoginAt: new Date() } },
        { returnDocument: 'after' }
    );

    const effectiveUserDoc = updatedUser || userDoc;


    const token = sign(
      {
        id: effectiveUserDoc._id.toString(),
        email: effectiveUserDoc.email,
        name: effectiveUserDoc.name,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Prepare user object for response (excluding password)
    const { password: _, ...userSafeForResponse } = effectiveUserDoc;

    const userForResponse: UserProfile = {
      id: effectiveUserDoc._id.toString(),
      email: userSafeForResponse.email,
      name: userSafeForResponse.name,
      photoUrl: userSafeForResponse.photoUrl || null,
      age: userSafeForResponse.age,
      gender: userSafeForResponse.gender,
      bio: userSafeForResponse.bio,
      travelPreferences: userSafeForResponse.travelPreferences || {},
      languagesSpoken: userSafeForResponse.languagesSpoken || [],
      trekkingExperience: userSafeForResponse.trekkingExperience,
      wishlistDestinations: userSafeForResponse.wishlistDestinations || [],
      travelHistory: userSafeForResponse.travelHistory || [],
      plannedTrips: userSafeForResponse.plannedTrips || [],
      badges: userSafeForResponse.badges || [],
      createdAt: userSafeForResponse.createdAt,
      updatedAt: userSafeForResponse.updatedAt,
      lastLoginAt: userSafeForResponse.lastLoginAt,
    };

    return NextResponse.json({
      user: userForResponse,
      token,
    });

  } catch (error) {
    console.error('Signin error:', error);
    return NextResponse.json(
      { error: 'Internal server error during signin' },
      { status: 500 }
    );
  }
}
