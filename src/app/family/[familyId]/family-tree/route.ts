import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ familyId: string }> }
) {
  const { familyId } = await params;
  return NextResponse.redirect(new URL(`/family/${familyId}/tree`, request.url));
}
