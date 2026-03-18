import { NextRequest, NextResponse } from 'next/server';
import { mockCategories } from '@/lib/mock-data';
import type { Category } from '@/lib/types';

// In-memory storage for demo (resets on server restart)
let categories = [...mockCategories];
let nextId = Math.max(...categories.map(c => c.id)) + 1;

export async function GET() {
  return NextResponse.json(categories);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const newCategory: Category = {
      id: nextId++,
      title: body.title,
    };
    categories.push(newCategory);
    return NextResponse.json(newCategory, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
