import { NextRequest, NextResponse } from 'next/server';
import { mockExercises } from '@/lib/mock-data';

// Reference the same in-memory storage
let exercises = [...mockExercises];

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const index = exercises.findIndex(e => e.id === parseInt(id));
  if (index === -1) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  exercises[index] = {
    ...exercises[index],
    is_archived: true,
    updated_at: new Date().toISOString(),
  };
  return NextResponse.json(exercises[index]);
}
