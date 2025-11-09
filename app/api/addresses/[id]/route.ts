import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import prisma from '@/lib/prisma'

type tParams = Promise<{ id: string }>

interface RouteProps {
  params: tParams
}

export async function DELETE(req: Request, { params }: RouteProps) {
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

    await prisma.address.delete({
      where: {
        id,
      },
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('[ADDRESS_DELETE]', error)
    return new NextResponse('Internal error', { status: 500 })
  }
}