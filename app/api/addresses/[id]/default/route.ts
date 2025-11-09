import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import prisma from '@/lib/prisma'

type tParams = Promise<{ id: string }>

interface RouteProps {
  params: tParams
}

export async function PATCH(req: Request, { params }: RouteProps) {
  try {
    const session = await auth()
    const { id } = await params

    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const address = await prisma.address.findUnique({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!address) {
      return new NextResponse('Address not found', { status: 404 })
    }

    // Unset all other default addresses
    await prisma.address.updateMany({
      where: {
        userId: session.user.id,
        isDefault: true,
      },
      data: {
        isDefault: false,
      },
    })

    // Set this address as default
    const updatedAddress = await prisma.address.update({
      where: {
        id,
      },
      data: {
        isDefault: true,
      },
    })

    return NextResponse.json(updatedAddress)
  } catch (error) {
    console.error('[ADDRESS_DEFAULT]', error)
    return new NextResponse('Internal error', { status: 500 })
  }
}