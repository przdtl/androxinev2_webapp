import { NextRequest, NextResponse } from 'next/server';
import { mockSets } from '@/lib/mock-data';
import type { WorkoutSet } from '@/lib/types';

// Reference the same in-memory storage
let sets = [...mockSets];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const set = sets.find(s => s.id === parseInt(id));
  if (!set) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  return NextResponse.json(set);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();
    const index = sets.findIndex(s => s.id === parseInt(id));
    if (index === -1) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    const updatedSet: WorkoutSet = {
      ...sets[index],
      exercise_id: body.exercise_id ?? sets[index].exercise_id,
      reps: body.reps ?? sets[index].reps,
      weight: body.weight ?? sets[index].weight,
    };
    sets[index] = updatedSet;
    return NextResponse.json(updatedSet);
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const index = sets.findIndex(s => s.id === parseInt(id));
  if (index === -1) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  sets.splice(index, 1);
  return new NextResponse(null, { status: 204 });
}
