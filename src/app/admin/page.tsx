'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  MapPin,
  Plus,
  TrendingUp,
  Mountain,
  Image,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface Stats {
  totalDestinations: number
  withAltitude: number
  countriesCount: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/admin/destinations')
        if (res.ok) {
          const destinations = await res.json()
          const withAltitude = destinations.filter(
            (d: { altitude?: number }) => d.altitude && d.altitude > 0
          ).length
          const countries = new Set(
            destinations.map((d: { country?: string }) => d.country)
          )

          setStats({
            totalDestinations: destinations.length,
            withAltitude,
            countriesCount: countries.size,
          })
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

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
          <h1 className="text-3xl font-bold font-heading">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Manage your TrekConnect destinations and content
          </p>
        </div>
        <Link href="/admin/destinations/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Destination
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Destinations
            </CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {stats?.totalDestinations || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Trek destinations in database
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              With Altitude Data
            </CardTitle>
            <Mountain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.withAltitude || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats && stats.totalDestinations > 0
                ? `${Math.round(
                    (stats.withAltitude / stats.totalDestinations) * 100
                  )}% complete`
                : 'No destinations yet'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Countries
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {stats?.countriesCount || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Countries covered
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Need Attention
            </CardTitle>
            <Image className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {stats ? stats.totalDestinations - stats.withAltitude : 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Missing altitude data
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common tasks for managing your trek destinations
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/admin/destinations/create">
            <div className="p-4 rounded-lg border hover:border-primary hover:bg-primary/5 transition-all cursor-pointer group">
              <div className="p-3 rounded-full bg-primary/10 w-fit mb-3 group-hover:bg-primary/20 transition-colors">
                <Plus className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold">Add New Destination</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Create a new trek destination with details
              </p>
            </div>
          </Link>

          <Link href="/admin/destinations">
            <div className="p-4 rounded-lg border hover:border-primary hover:bg-primary/5 transition-all cursor-pointer group">
              <div className="p-3 rounded-full bg-primary/10 w-fit mb-3 group-hover:bg-primary/20 transition-colors">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold">Manage Destinations</h3>
              <p className="text-sm text-muted-foreground mt-1">
                View, edit, or delete existing destinations
              </p>
            </div>
          </Link>

          <Link href="/explore">
            <div className="p-4 rounded-lg border hover:border-primary hover:bg-primary/5 transition-all cursor-pointer group">
              <div className="p-3 rounded-full bg-primary/10 w-fit mb-3 group-hover:bg-primary/20 transition-colors">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold">View Public Site</h3>
              <p className="text-sm text-muted-foreground mt-1">
                See how destinations appear to users
              </p>
            </div>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
