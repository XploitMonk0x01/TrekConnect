'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Mountain,
  MapPin,
  Loader2,
  Eye,
  MoreVertical,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useToast } from '@/hooks/use-toast'

interface Destination {
  _id: string
  name: string
  country: string
  region: string
  description: string
  imageUrl: string
  altitude?: number
  attractions?: string[]
}

export default function AdminDestinationsPage() {
  const { toast } = useToast()
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Fetch destinations
  useEffect(() => {
    fetchDestinations()
  }, [])

  const fetchDestinations = async () => {
    try {
      const res = await fetch('/api/admin/destinations', {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store',
      })
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setDestinations(data)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load destinations',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return

    setDeleting(true)
    try {
      const res = await fetch(`/api/admin/destinations/${deleteId}`, {
        method: 'DELETE',
        credentials: 'include',
        cache: 'no-store',
      })

      if (!res.ok) throw new Error('Failed to delete')

      setDestinations((prev) => prev.filter((d) => d._id !== deleteId))
      toast({
        title: 'Deleted',
        description: 'Destination has been deleted successfully.',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete destination',
        variant: 'destructive',
      })
    } finally {
      setDeleting(false)
      setDeleteId(null)
    }
  }

  const filteredDestinations = destinations.filter(
    (d) =>
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.country?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.region?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold font-heading">Destinations</h1>
          <p className="text-muted-foreground mt-1">
            Manage all trek destinations ({destinations.length} total)
          </p>
        </div>
        <Link href="/admin/destinations/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Destination
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search destinations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Altitude</TableHead>
              <TableHead>Attractions</TableHead>
              <TableHead className="w-20 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDestinations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12">
                  <MapPin className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">No destinations found</p>
                  {searchQuery && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Try adjusting your search query
                    </p>
                  )}
                </TableCell>
              </TableRow>
            ) : (
              filteredDestinations.map((destination) => (
                <TableRow key={destination._id}>
                  <TableCell>
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted">
                      {destination.imageUrl ? (
                        <img
                          src={destination.imageUrl}
                          alt={destination.name}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Mountain className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{destination.name}</p>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {destination.description?.slice(0, 50)}...
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <MapPin className="h-3 w-3" />
                      {destination.region}, {destination.country}
                    </div>
                  </TableCell>
                  <TableCell>
                    {destination.altitude ? (
                      <Badge variant="secondary">
                        {destination.altitude.toLocaleString()}m
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-sm">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {destination.attractions?.length || 0} items
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/explore/${destination._id}`}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Public
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link
                            href={`/admin/destinations/${destination._id}/edit`}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => setDeleteId(destination._id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Destination?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              destination from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
