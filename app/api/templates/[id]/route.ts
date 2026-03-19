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

// Reference the same in-memory storage
let templates = [...mockTemplates];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const template = templates.find(t => t.id === parseInt(id));
  if (!template) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  return NextResponse.json(template);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();
    const index = templates.findIndex(t => t.id === parseInt(id));
    if (index === -1) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    const updatedTemplate: Template = {
      ...templates[index],
      title: body.title,
      day_of_week: body.day_of_week ?? templates[index].day_of_week,
      exercises: body.exercises ? normalizeTemplateExercises(body.exercises) : templates[index].exercises,
    };
    templates[index] = updatedTemplate;
    return NextResponse.json(updatedTemplate);
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return PUT(request, context);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const index = templates.findIndex(t => t.id === parseInt(id));
  if (index === -1) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  templates.splice(index, 1);
  return new NextResponse(null, { status: 204 });
}
