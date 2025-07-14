import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  //ВИЗНАЧАЄ НАЗВУ ЗАПИТУ
  const query = req.nextUrl.searchParams.get('query') || '';

  //ЗАПИТ ДО БАЗИ ДАНИХ
  const users = await prisma.user.findMany({
    where: {
      //СИТНАКСИС ЯКИЙ ШУКАЄ НЕ СТРОГО ПО НАЗВІ
      name: {
        contains: query,
        mode: 'insensitive',
      },
    },
    take: 5,
  });

  return NextResponse.json(users);
}
