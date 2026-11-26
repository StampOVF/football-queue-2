import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import { TEAMS } from '../../../lib/teams';

export const dynamic = 'force-dynamic';

// ใช้ Upstash Redis เมื่อมี environment variables (บน Vercel)
// ถ้าไม่มี (รันในเครื่อง) จะใช้หน่วยความจำแทน เพื่อให้ npm run dev ใช้ได้เลย
const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
const redis = url && token ? new Redis({ url, token }) : null;
const mem = (globalThis.__bookings ??= new Map());

async function list() {
  const all = redis ? Object.values((await redis.hgetall('bookings')) ?? {}) : [...mem.values()];
  return all.sort((a, b) => a.createdAt - b.createdAt);
}

export async function GET() {
  return NextResponse.json(await list());
}

export async function POST(req) {
  const { teamId, name } = await req.json();
  if (!TEAMS.some((t) => t.id === teamId) || !name?.trim()) {
    return NextResponse.json({ error: 'ข้อมูลไม่ถูกต้อง' }, { status: 400 });
  }
  const booking = {
    id: crypto.randomUUID(),
    teamId,
    name: name.trim().slice(0, 40),
    createdAt: Date.now(),
  };
  if (redis) await redis.hset('bookings', { [booking.id]: booking });
  else mem.set(booking.id, booking);
  return NextResponse.json(booking, { status: 201 });
}

export async function DELETE(req) {
  const id = new URL(req.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'ไม่พบ id' }, { status: 400 });
  if (redis) await redis.hdel('bookings', id);
  else mem.delete(id);
  return NextResponse.json({ ok: true });
}
