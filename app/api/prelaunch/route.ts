import { NextResponse } from 'next/server'

const BASE_COUNT = 23
const DAILY_GROWTH = 0.0009 // 0.09%
const START_DATE = new Date('2026-02-12')
const TARGET = 10000

export async function GET() {
  const days = (Date.now() - START_DATE.getTime()) / 86_400_000
  const count = Math.floor(BASE_COUNT * Math.pow(1 + DAILY_GROWTH, days))

  return NextResponse.json({ count, target: TARGET, live: false })
}
