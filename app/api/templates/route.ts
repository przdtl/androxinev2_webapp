import { NextRequest, NextResponse } from 'next/server';
import { mockTemplates } from '@/lib/mock-data';
import type { Template } from '@/lib/types';

// In-memory storage for demo
let templates = [...mockTemplates];
let nextId = Math.max(...templates.map(t => t.id)) + 1;

export async function GET() {
  return NextResponse.json(templates);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const newTemplate: Template = {
      id: nextId++,
      title: body.title,
      day_of_week: body.day_of_week ?? null,
      exercises: body.exercises || [],
    };
    templates.push(newTemplate);
    return NextResponse.json(newTemplate, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
