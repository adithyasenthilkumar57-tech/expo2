import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { setSessionCookie } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    // Find user in database
    let user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    // If user does not exist but matches env ADMIN_EMAIL, auto-seed admin
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@ops3.com').toLowerCase();
    const adminPass = process.env.ADMIN_PASSWORD || 'ops3admin123';

    if (!user && normalizedEmail === adminEmail) {
      const hashedPassword = await bcrypt.hash(adminPass, 12);
      user = await prisma.user.create({
        data: {
          email: adminEmail,
          password: hashedPassword,
          name: 'Marcus Vance',
          role: 'Administrator',
          avatar: 'MV',
        },
      });
    }

    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Set HTTP-only session cookie
    await setSessionCookie({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json({ error: 'Authentication service error' }, { status: 500 });
  }
}
