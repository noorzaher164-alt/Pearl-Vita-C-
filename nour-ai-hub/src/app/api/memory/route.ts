import { NextRequest, NextResponse } from 'next/server';
import { getMemory, updateMemory, deleteMemory, resetMemory } from '@/core/memory';

export async function GET() {
  const memory = getMemory();
  return NextResponse.json(memory);
}

export async function POST(request: NextRequest) {
  try {
    const { action, category, key, value } = await request.json();

    switch (action) {
      case 'update':
        if (!category || !key) {
          return NextResponse.json({ error: 'Category and key are required' }, { status: 400 });
        }
        updateMemory(category, key, value);
        return NextResponse.json({ success: true, memory: getMemory() });

      case 'delete':
        if (!category || !key) {
          return NextResponse.json({ error: 'Category and key are required' }, { status: 400 });
        }
        deleteMemory(category, key);
        return NextResponse.json({ success: true, memory: getMemory() });

      case 'reset':
        resetMemory();
        return NextResponse.json({ success: true, memory: getMemory() });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Memory API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
