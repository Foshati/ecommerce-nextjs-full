'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Search } from 'lucide-react'

interface Order {
  id: string
  total: number
  status: string
  createdAt: string
  items: {
    id: string
    quantity: number
    price: number
    product: {
      name: string
      images: string[]
    }
  }[]
  shippingAddress: {
    street: string
    city: string
    state: string
    postalCode: string
    country: string
  }
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const ordersPerPage = 5

  useEffect(() => {
    fetchOrders()
  }, [])

  useEffect(() => {
    filterOrders()
  }, [orders, search, statusFilter])

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders')
      if (response.ok) {
        const data = await response.json()
        setOrders(data)
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterOrders = () => {
    let filtered = orders

    if (search) {
      filtered = filtered.filter(order => 
        order.id.toLowerCase().includes(search.toLowerCase()) ||
        order.items.some(item => 
          item.product.name.toLowerCase().includes(search.toLowerCase())
        )
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter.toUpperCase())
    }

    setFilteredOrders(filtered)
    setCurrentPage(1)
  }

  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage)
  const startIndex = (currentPage - 1) * ordersPerPage
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + ordersPerPage)

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className='space-y-8'>
      <div>
        <h2 className='text-3xl font-bold tracking-tight'>Order History</h2>
        <p className='text-muted-foreground'>
          View and manage your order history
        </p>
      </div>
      
      <div className='flex flex-col sm:flex-row gap-4'>
        <div className='relative flex-1'>
          <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4' />
          <Input
            placeholder='Search orders or products...'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className='pl-10'
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className='w-full sm:w-48'>
            <SelectValue placeholder='Filter by status' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All Status</SelectItem>
            <SelectItem value='pending'>Pending</SelectItem>
            <SelectItem value='processing'>Processing</SelectItem>
            <SelectItem value='shipped'>Shipped</SelectItem>
            <SelectItem value='delivered'>Delivered</SelectItem>
            <SelectItem value='cancelled'>Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className='space-y-4'>
        {paginatedOrders.length === 0 ? (
          <p className='text-muted-foreground'>No orders found</p>
        ) : (
          paginatedOrders.map((order) => (
            <Card key={order.id}>
              <CardContent className='p-6'>
                <div className='space-y-4'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='font-medium'>Order #{order.id.slice(-8)}</p>
                      <p className='text-sm text-muted-foreground'>
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge
                      variant={
                        order.status === 'DELIVERED'
                          ? 'default'
                          : order.status === 'CANCELLED'
                          ? 'destructive'
                          : 'secondary'
                      }
                      className='capitalize'
                    >
                      {order.status.toLowerCase()}
                    </Badge>
                  </div>
                  <div className='divide-y'>
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className='flex items-center justify-between py-4'
                      >
                        <div className='flex items-center space-x-4'>
                          <img
                            src={item.product.images[0]}
                            alt={item.product.name}
                            className='h-16 w-16 rounded-md object-cover'
                          />
                          <div>
                            <p className='font-medium'>{item.product.name}</p>
                            <p className='text-sm text-muted-foreground'>
                              Quantity: {item.quantity}
                            </p>
                          </div>
                        </div>
                        <p className='font-medium'>
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className='flex justify-between border-t pt-4'>
                    <div>
                      <p className='font-medium'>Shipping Address:</p>
                      <p className='text-sm text-muted-foreground'>
                        {order.shippingAddress.street}
                      </p>
                      <p className='text-sm text-muted-foreground'>
                        {order.shippingAddress.city},{' '}
                        {order.shippingAddress.state}{' '}
                        {order.shippingAddress.postalCode}
                      </p>
                      <p className='text-sm text-muted-foreground'>
                        {order.shippingAddress.country}
                      </p>
                    </div>
                    <div className='text-right'>
                      <p className='text-sm text-muted-foreground'>Total</p>
                      <p className='text-2xl font-bold'>
                        ${order.total.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className='flex items-center justify-between'>
          <p className='text-sm text-muted-foreground'>
            Showing {startIndex + 1} to {Math.min(startIndex + ordersPerPage, filteredOrders.length)} of {filteredOrders.length} orders
          </p>
          <div className='flex items-center space-x-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className='h-4 w-4' />
              Previous
            </Button>
            <span className='text-sm'>
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className='h-4 w-4' />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
