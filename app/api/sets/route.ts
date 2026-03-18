import { NextRequest, NextResponse } from 'next/server';
import { mockSets } from '@/lib/mock-data';
import type { WorkoutSet } from '@/lib/types';

// In-memory storage for demo
let sets = [...mockSets];
let nextId = Math.max(...sets.map(s => s.id)) + 1;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const exerciseId = searchParams.get('exercise_id');
  const createdFrom = searchParams.get('created_from');
  const createdTo = searchParams.get('created_to');
  
  let result = [...sets];
  
  if (exerciseId) {
    result = result.filter(s => s.exercise_id === parseInt(exerciseId));
  }
  
  if (createdFrom) {
    const fromDate = new Date(createdFrom);
    result = result.filter(s => {
      const setDate = new Date(s.created_at);
      return setDate >= fromDate;
    });
  }
  
  if (createdTo) {
    const toDate = new Date(createdTo);
    toDate.setHours(23, 59, 59, 999);
    result = result.filter(s => {
      const setDate = new Date(s.created_at);
      return setDate <= toDate;
    });
  }
  
  // Sort by date descending
  result.sort((a, b) => {
    const dateA = new Date(a.created_at);
    const dateB = new Date(b.created_at);
    return dateB.getTime() - dateA.getTime();
  });
  
  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const newSet: WorkoutSet = {
      id: nextId++,
      exercise_id: body.exercise_id,
      reps: body.reps,
      weight: body.weight,
      created_at: body.created_at || new Date().toISOString(),
    };
    sets.push(newSet);
    return NextResponse.json(newSet, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
