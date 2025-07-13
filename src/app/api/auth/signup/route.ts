// This file is no longer needed as sign-up is handled on the client-side
// by the CustomAuthContext. It can be safely deleted.
// We are keeping it here but empty to avoid breaking any potential lingering references,
// but it should be removed in a future cleanup.

import {NextResponse} from 'next/server';

export async function POST() {
  return NextResponse.json(
    {error: 'This API route is deprecated. Use the client-side auth context.'},
    {status: 410} // 410 Gone
  );
}
