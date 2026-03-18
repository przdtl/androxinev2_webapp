import { NextRequest, NextResponse } from 'next/server';
import { mockExercises } from '@/lib/mock-data';
import type { Exercise } from '@/lib/types';

// Reference the same in-memory storage
let exercises = [...mockExercises];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const exercise = exercises.find(e => e.id === parseInt(id));
  if (!exercise) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  return NextResponse.json(exercise);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();
    const index = exercises.findIndex(e => e.id === parseInt(id));
    if (index === -1) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    const updatedExercise: Exercise = {
      ...exercises[index],
      title: body.title || exercises[index].title,
      short: body.short || exercises[index].short,
      category: body.category_id ?? body.category ?? exercises[index].category,
      updated_at: new Date().toISOString(),
    };
    exercises[index] = updatedExercise;
    return NextResponse.json(updatedExercise);
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

// Backward compatibility for older clients.
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return PATCH(request, context);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const index = exercises.findIndex(e => e.id === parseInt(id));
  if (index === -1) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  exercises.splice(index, 1);
  return new NextResponse(null, { status: 204 });
}
