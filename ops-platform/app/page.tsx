'use client';
export default function Home() {
  // redirect to main app
  if (typeof window !== 'undefined') window.location.href = '/app';
  return null;
}
