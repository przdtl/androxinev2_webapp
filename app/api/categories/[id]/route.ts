import { NextRequest, NextResponse } from 'next/server';
import { mockCategories } from '@/lib/mock-data';
import type { Category } from '@/lib/types';

// Reference the same in-memory storage
let categories = [...mockCategories];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const category = categories.find(c => c.id === parseInt(id));
  if (!category) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  return NextResponse.json(category);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();
    const index = categories.findIndex(c => c.id === parseInt(id));
    if (index === -1) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    const updatedCategory: Category = {
      ...categories[index],
      title: body.title,
    };
    categories[index] = updatedCategory;
    return NextResponse.json(updatedCategory);
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const index = categories.findIndex(c => c.id === parseInt(id));
  if (index === -1) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  categories.splice(index, 1);
  return new NextResponse(null, { status: 204 });
}
