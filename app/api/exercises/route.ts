import { NextRequest, NextResponse } from 'next/server';
import { mockExercises } from '@/lib/mock-data';
import type { Exercise } from '@/lib/types';

// In-memory storage for demo
let exercises = [...mockExercises];
let nextId = Math.max(...exercises.map(e => e.id)) + 1;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const categoryId = searchParams.get('category');
  
  let result = exercises;
  if (categoryId) {
    result = exercises.filter(e => {
      const catId = typeof e.category === 'object' ? e.category : e.category;
      return catId === parseInt(categoryId);
    });
  }
  
  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const now = new Date().toISOString();
    const newExercise: Exercise = {
      id: nextId++,
      title: body.title,
      short: body.short || '',
      category: body.category,
      is_archived: false,
      created_at: now,
      updated_at: now,
    };
    exercises.push(newExercise);
    return NextResponse.json(newExercise, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
