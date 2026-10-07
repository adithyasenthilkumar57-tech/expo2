import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const deleted = await prisma.teamMember.delete({
      where: { id },
    });

    await prisma.activityEvent.create({
      data: {
        type: 'team_member_removed',
        title: 'Team member removed',
        description: `${deleted.name} (${deleted.email}) was removed from the workspace.`,
      },
    });

    return NextResponse.json({ success: true, deletedMember: deleted });
  } catch (err) {
    console.error('Error deleting team member:', err);
    return NextResponse.json({ error: 'Team member not found or deletion failed' }, { status: 404 });
  }
}
