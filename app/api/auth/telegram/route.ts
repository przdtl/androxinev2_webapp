import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // In development, just return a mock token
    // In production, validate init_data and return a real JWT
    if (!body.init_data) {
      return NextResponse.json({ error: 'init_data required' }, { status: 400 });
    }
    
    // Mock token for development
    const mockToken = 'dev_token_' + Date.now();
    
    return NextResponse.json({ access_token: mockToken });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
