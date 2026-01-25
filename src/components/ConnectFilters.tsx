'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Filter, RotateCcw } from 'lucide-react'

export interface UserFilters {
  gender: ('Male' | 'Female')[]
  trekkingExperience: ('Beginner' | 'Intermediate' | 'Advanced' | 'Expert')[]
  travelStyle: ('Solo' | 'Group' | 'Flexible')[]
  budget: ('Budget' | 'Mid-range' | 'Luxury' | 'Flexible')[]
}

interface ConnectFiltersProps {
  filters: UserFilters
  onFiltersChange: (filters: UserFilters) => void
}

const defaultFilters: UserFilters = {
  gender: [],
  trekkingExperience: [],
  travelStyle: [],
  budget: [],
}

export function ConnectFilters({
  filters,
  onFiltersChange,
}: ConnectFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [localFilters, setLocalFilters] = useState<UserFilters>(filters)

  const handleCheckboxChange = (
    category: keyof UserFilters,
    value: string,
    checked: boolean
  ) => {
    setLocalFilters((prev) => ({
      ...prev,
      [category]: checked
        ? [...prev[category], value]
        : prev[category].filter((v) => v !== value),
    }))
  }

  const handleApply = () => {
    onFiltersChange(localFilters)
    setIsOpen(false)
  }

  const handleReset = () => {
    setLocalFilters(defaultFilters)
    onFiltersChange(defaultFilters)
  }

  const hasActiveFilters =
    filters.gender.length > 0 ||
    filters.trekkingExperience.length > 0 ||
    filters.travelStyle.length > 0 ||
    filters.budget.length > 0

  const activeFiltersCount =
    filters.gender.length +
    filters.trekkingExperience.length +
    filters.travelStyle.length +
    filters.budget.length

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={hasActiveFilters ? 'border-primary text-primary' : ''}
        >
          <Filter className="mr-2 h-4 w-4" />
          Filters
          {activeFiltersCount > 0 && (
            <span className="ml-2 bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs">
              {activeFiltersCount}
            </span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Filter Trekkers</DialogTitle>
          <DialogDescription>
            Customize your preferences to find the perfect trekking companion.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Gender Filter */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Gender</Label>
            <div className="flex flex-wrap gap-4">
              {(['Male', 'Female'] as const).map((gender) => (
                <div key={gender} className="flex items-center space-x-2">
                  <Checkbox
                    id={`gender-${gender}`}
                    checked={localFilters.gender.includes(gender)}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange('gender', gender, checked as boolean)
                    }
                  />
                  <Label
                    htmlFor={`gender-${gender}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {gender}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Trekking Experience Filter */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Trekking Experience</Label>
            <div className="grid grid-cols-2 gap-3">
              {(
                ['Beginner', 'Intermediate', 'Advanced', 'Expert'] as const
              ).map((exp) => (
                <div key={exp} className="flex items-center space-x-2">
                  <Checkbox
                    id={`exp-${exp}`}
                    checked={localFilters.trekkingExperience.includes(exp)}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange(
                        'trekkingExperience',
                        exp,
                        checked as boolean
                      )
                    }
                  />
                  <Label
                    htmlFor={`exp-${exp}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {exp}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Travel Style Filter */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Travel Style</Label>
            <div className="flex flex-wrap gap-4">
              {(['Solo', 'Group', 'Flexible'] as const).map((style) => (
                <div key={style} className="flex items-center space-x-2">
                  <Checkbox
                    id={`style-${style}`}
                    checked={localFilters.travelStyle.includes(style)}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange(
                        'travelStyle',
                        style,
                        checked as boolean
                      )
                    }
                  />
                  <Label
                    htmlFor={`style-${style}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {style}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Budget Filter */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Budget</Label>
            <div className="grid grid-cols-2 gap-3">
              {(['Budget', 'Mid-range', 'Luxury', 'Flexible'] as const).map(
                (budget) => (
                  <div key={budget} className="flex items-center space-x-2">
                    <Checkbox
                      id={`budget-${budget}`}
                      checked={localFilters.budget.includes(budget)}
                      onCheckedChange={(checked) =>
                        handleCheckboxChange(
                          'budget',
                          budget,
                          checked as boolean
                        )
                      }
                    />
                    <Label
                      htmlFor={`budget-${budget}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {budget}
                    </Label>
                  </div>
                )
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleReset}
            className="w-full sm:w-auto"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>
          <Button onClick={handleApply} className="w-full sm:w-auto">
            Apply Filters
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
