import { NextRequest, NextResponse } from 'next/server';
import { mockTemplates } from '@/lib/mock-data';
import type { Template } from '@/lib/types';

function normalizeTemplateExercises(payload: unknown): Template['exercises'] {
  if (!Array.isArray(payload)) return [];

  return payload
    .map((item) => {
      if (typeof item === 'number' || typeof item === 'string') {
        return { exercise_id: item };
      }
      if (item && typeof item === 'object') {
        const obj = item as Record<string, unknown>;
        if (typeof obj.exercise_id === 'number' || typeof obj.exercise_id === 'string') {
          return {
            exercise_id: obj.exercise_id,
            default_weight:
              typeof obj.default_weight === 'number' || obj.default_weight === null
                ? (obj.default_weight as number | null)
                : undefined,
            default_reps:
              typeof obj.default_reps === 'number' || obj.default_reps === null
                ? (obj.default_reps as number | null)
                : undefined,
            order: typeof obj.order === 'number' ? obj.order : undefined,
          };
        }
      }
      return null;
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);
}

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
      exercises: normalizeTemplateExercises(body.exercises),
    };
    templates.push(newTemplate);
    return NextResponse.json(newTemplate, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
