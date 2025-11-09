import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import prisma from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const session = await auth()

    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await req.json()
    const { street, city, state, postalCode, country, isDefault } = body

    if (!street || !city || !state || !postalCode || !country) {
      return new NextResponse('Missing required fields', { status: 400 })
    }

    // If this is set as default, unset all other default addresses
    if (isDefault) {
      await prisma.address.updateMany({
        where: {
          userId: session.user.id,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      })
    }

    const address = await prisma.address.create({
      data: {
        userId: session.user.id,
        street,
        city,
        state,
        postalCode,
        country,
        isDefault: isDefault || false,
      },
    })

    return NextResponse.json(address)
  } catch (error) {
    console.error('[ADDRESSES_POST]', error)
    return new NextResponse('Internal error', { status: 500 })
  }
}