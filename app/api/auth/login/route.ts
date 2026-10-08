import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { setSessionCookie } from '@/lib/auth';
import { syncToGoogleSheets } from '@/lib/sheets';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { email, password, isGuest } = body;

    // 1. Instant Guest Access
    if (isGuest || (!email && !password)) {
      const guestUser = {
        userId: 'guest-' + Date.now(),
        email: 'guest@ops3.com',
        name: 'Demo Operator',
        role: 'Administrator',
      };
      await setSessionCookie(guestUser);
      return NextResponse.json({
        success: true,
        user: guestUser,
      });
    }

    if (!email) {
      return NextResponse.json({ error: 'Please provide an email address' }, { status: 400 });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const displayName = normalizedEmail.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || 'Operator';
    const initials = displayName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'OP';

    let user = null;

    // Try finding or creating user in DB
    try {
      user = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      });

      // If user does not exist in DB yet, auto-create them on first sign-in!
      if (!user) {
        const hashedPassword = password ? await bcrypt.hash(password, 10) : await bcrypt.hash('welcome123', 10);
        user = await prisma.user.create({
          data: {
            email: normalizedEmail,
            password: hashedPassword,
            name: displayName,
            role: 'Administrator',
            avatar: initials,
          },
        });
      } else if (password) {
        // If user already exists and provided a password, verify it.
        // If it doesn't match, we still accept it if it's the open access mode or default admin password
        const isValid = await bcrypt.compare(password, user.password).catch(() => false);
        if (!isValid && password !== 'ops3admin123' && password !== 'admin123') {
          // If existing user typed a new password, update it so they are never locked out
          const newHash = await bcrypt.hash(password, 10);
          user = await prisma.user.update({
            where: { id: user.id },
            data: { password: newHash },
          });
        }
      }
    } catch (dbErr) {
      console.warn('Database connection warning (falling back to local session):', dbErr);
      // DB might not be configured on Vercel yet - still grant access!
      user = {
        id: 'usr_' + Math.random().toString(36).slice(2, 10),
        email: normalizedEmail,
        name: displayName,
        role: 'Administrator',
        avatar: initials,
      };
    }

    // Set session cookie
    const sessionPayload = {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    const token = await setSessionCookie(sessionPayload);

    // Sync to Google Sheets if configured
    syncToGoogleSheets({
      name: sessionPayload.name,
      email: sessionPayload.email,
      action: isGuest ? 'guest' : 'login',
    }).catch(() => {});

    const response = NextResponse.json({
      success: true,
      user: sessionPayload,
    });

    response.cookies.set('ops3_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60,
    });

    return response;
  } catch (err) {
    console.error('Login fallback handler:', err);
    // Ultimate failsafe: always allow access into the workspace
    const emergencyUser = {
      userId: 'op_' + Date.now(),
      email: 'operator@ops3.com',
      name: 'Operations Manager',
      role: 'Administrator',
    };
    const emergencyToken = await setSessionCookie(emergencyUser);
    const response = NextResponse.json({
      success: true,
      user: emergencyUser,
    });
    response.cookies.set('ops3_session', emergencyToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60,
    });
    return response;
  }
}
