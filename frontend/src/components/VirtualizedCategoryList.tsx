'use client'

import { useState, useMemo, useCallback } from 'react'
const ReactWindow = require('react-window')
const FixedSizeList = ReactWindow.FixedSizeList

interface Category {
  id?: number
  name: string
  allocated_cents: number
  spent_cents?: number
  order: number
  description?: string
  category_group?: string
  is_active: number
}

interface CategoryGroup {
  name: string
  categories: Category[]
  total_allocated: number
  collapsed: boolean
}

interface VirtualizedCategoryListProps {
  categories: Category[]
  onCategoryUpdate: (categoryId: number, updates: Partial<Category>) => void
  onCategoryDelete: (categoryId: number) => void
  editable?: boolean
  showProgress?: boolean
  height?: number
  itemHeight?: number
  groupBy?: 'none' | 'category_group'
  searchTerm?: string
  sortBy?: 'name' | 'allocated_cents' | 'order'
  sortDesc?: boolean
}

interface CategoryItemProps {
  index: number
  style: React.CSSProperties
  data: {
    items: (Category | CategoryGroup)[]
    onCategoryUpdate: (categoryId: number, updates: Partial<Category>) => void
    onCategoryDelete: (categoryId: number) => void
    editable: boolean
    showProgress: boolean
    onGroupToggle: (groupName: string) => void
  }
}

const CategoryItem = ({ index, style, data }: CategoryItemProps) => {
  const item = data.items[index]
  const { onCategoryUpdate, onCategoryDelete, editable, showProgress, onGroupToggle } = data

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100)
  }

  // Check if item is a group header
  if ('categories' in item) {
    const group = item as CategoryGroup
    return (
      <div style={style} className="px-4 py-2">
        <button
          onClick={() => onGroupToggle(group.name)}
          className="w-full flex items-center justify-between p-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className={`transform transition-transform ${group.collapsed ? '' : 'rotate-90'}`}>
              ▶
            </span>
            <span className="font-semibold text-gray-900">{group.name}</span>
            <span className="text-sm text-gray-500">({group.categories.length} items)</span>
          </div>
          <span className="font-semibold text-gray-900">
            {formatCurrency(group.total_allocated)}
          </span>
        </button>
      </div>
    )
  }

  // Regular category item
  const category = item as Category
  const spentCents = category.spent_cents || 0
  const remainingCents = category.allocated_cents - spentCents
  const progressPercentage = category.allocated_cents > 0 
    ? Math.min((spentCents / category.allocated_cents) * 100, 100) 
    : 0

  const [amount, setAmount] = useState(category.allocated_cents / 100)
  const [isEditing, setIsEditing] = useState(false)

  const handleAmountChange = (value: string) => {
    const numValue = parseFloat(value || '0')
    setAmount(numValue)
  }

  const handleSave = () => {
    if (category.id) {
      onCategoryUpdate(category.id, { allocated_cents: Math.round(amount * 100) })
    }
    setIsEditing(false)
  }

  const handleCancel = () => {
    setAmount(category.allocated_cents / 100)
    setIsEditing(false)
  }

  return (
    <div style={style} className="px-4 py-1">
      <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium text-gray-900 truncate">{category.name}</h3>
              {category.category_group && (
                <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                  {category.category_group}
                </span>
              )}
            </div>
            
            {category.description && (
              <p className="text-sm text-gray-600 mb-2 line-clamp-2">{category.description}</p>
            )}

            {showProgress && (
              <div className="mt-2">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Spent: {formatCurrency(spentCents)}</span>
                  <span>Remaining: {formatCurrency(remainingCents)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      progressPercentage > 100 ? 'bg-red-500' : 
                      progressPercentage > 90 ? 'bg-yellow-500' : 
                      'bg-green-500'
                    }`}
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
                {remainingCents < 0 && (
                  <div className="text-xs text-red-600 font-medium mt-1">
                    ⚠️ Over budget by {formatCurrency(Math.abs(remainingCents))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 ml-4">
            {editable && isEditing ? (
              <div className="flex items-center gap-2">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => handleAmountChange(e.target.value)}
                    step="0.01"
                    min="0"
                    className="w-32 pl-7 pr-3 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    autoFocus
                  />
                </div>
                <button
                  onClick={handleSave}
                  className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Save
                </button>
                <button
                  onClick={handleCancel}
                  className="px-2 py-1 text-xs bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <>
                <div className="text-right">
                  <div className="text-lg font-semibold text-gray-900">
                    {formatCurrency(category.allocated_cents)}
                  </div>
                  {showProgress && (
                    <div className="text-sm text-gray-500">
                      {Math.round(progressPercentage)}% used
                    </div>
                  )}
                </div>
                
                {editable && (
                  <div className="flex gap-1">
                    <button
                      onClick={() => setIsEditing(true)}
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                      title="Edit amount"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => category.id && onCategoryDelete(category.id)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                      title="Delete category"
                    >
                      🗑️
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function VirtualizedCategoryList({
  categories,
  onCategoryUpdate,
  onCategoryDelete,
  editable = false,
  showProgress = false,
  height = 600,
  itemHeight = 120,
  groupBy = 'none',
  searchTerm = '',
  sortBy = 'order',
  sortDesc = false
}: VirtualizedCategoryListProps) {
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set())

  // Filter and sort categories
  const filteredCategories = useMemo(() => {
    let filtered = categories.filter(cat => 
      cat.is_active === 1 && 
      (!searchTerm || cat.name.toLowerCase().includes(searchTerm.toLowerCase()))
    )

    // Sort categories
    filtered.sort((a, b) => {
      let aVal: any, bVal: any
      
      switch (sortBy) {
        case 'name':
          aVal = a.name.toLowerCase()
          bVal = b.name.toLowerCase()
          break
        case 'allocated_cents':
          aVal = a.allocated_cents
          bVal = b.allocated_cents
          break
        case 'order':
        default:
          aVal = a.order
          bVal = b.order
          break
      }

      if (aVal < bVal) return sortDesc ? 1 : -1
      if (aVal > bVal) return sortDesc ? -1 : 1
      return 0
    })

    return filtered
  }, [categories, searchTerm, sortBy, sortDesc])

  // Group categories if needed
  const displayItems = useMemo(() => {
    if (groupBy === 'none') {
      return filteredCategories
    }

    const groups: { [key: string]: Category[] } = {}
    const ungrouped: Category[] = []

    filteredCategories.forEach(cat => {
      const groupKey = cat.category_group || 'Ungrouped'
      if (groupKey === 'Ungrouped') {
        ungrouped.push(cat)
      } else {
        if (!groups[groupKey]) groups[groupKey] = []
        groups[groupKey].push(cat)
      }
    })

    const items: (Category | CategoryGroup)[] = []

    // Add grouped items
    Object.entries(groups).forEach(([groupName, groupCategories]) => {
      const total_allocated = groupCategories.reduce((sum, cat) => sum + cat.allocated_cents, 0)
      const group: CategoryGroup = {
        name: groupName,
        categories: groupCategories,
        total_allocated,
        collapsed: collapsedGroups.has(groupName)
      }
      
      items.push(group)
      
      if (!group.collapsed) {
        items.push(...groupCategories)
      }
    })

    // Add ungrouped items
    if (ungrouped.length > 0) {
      const total_allocated = ungrouped.reduce((sum, cat) => sum + cat.allocated_cents, 0)
      const ungroupedGroup: CategoryGroup = {
        name: 'Ungrouped',
        categories: ungrouped,
        total_allocated,
        collapsed: collapsedGroups.has('Ungrouped')
      }
      
      items.push(ungroupedGroup)
      
      if (!ungroupedGroup.collapsed) {
        items.push(...ungrouped)
      }
    }

    return items
  }, [filteredCategories, groupBy, collapsedGroups])

  const handleGroupToggle = useCallback((groupName: string) => {
    setCollapsedGroups(prev => {
      const newSet = new Set(prev)
      if (newSet.has(groupName)) {
        newSet.delete(groupName)
      } else {
        newSet.add(groupName)
      }
      return newSet
    })
  }, [])

  const itemData = {
    items: displayItems,
    onCategoryUpdate,
    onCategoryDelete,
    editable,
    showProgress,
    onGroupToggle: handleGroupToggle
  }

  if (displayItems.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-gray-500">
        {searchTerm ? 'No categories match your search' : 'No categories found'}
      </div>
    )
  }

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <FixedSizeList
        height={height}
        itemCount={displayItems.length}
        itemSize={itemHeight}
        itemData={itemData}
        overscanCount={5}
        width="100%"
      >
        {CategoryItem}
      </FixedSizeList>
    </div>
  )
}