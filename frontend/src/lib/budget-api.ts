import { api } from './api'

export interface BudgetCategory {
  id: number
  budget_id: number
  name: string
  allocated_cents: number
  order: number
  description?: string
  category_group?: string
  is_active: number
  created_at: string
  updated_at: string
}

export interface CategoryTemplate {
  id: number
  user_id: number
  name: string
  category_type: 'income' | 'expense' | 'savings'
  icon?: string
  color?: string
  default_allocation_cents: number
  description?: string
  category_group?: string
  tags?: string
  is_active: boolean
  order: number
  created_at: string
  updated_at: string
}

export interface BudgetCategoryUpdate {
  category_id: number
  name?: string
  allocated_cents?: number
  order?: number
  description?: string
  category_group?: string
}

export interface BulkUpdateRequest {
  updates: BudgetCategoryUpdate[]
}

export interface BulkUpdateResponse {
  updated_count: number
  errors: string[]
  success: boolean
}

export interface CategoryListResponse {
  categories: BudgetCategory[]
  total: number
  limit: number
  offset: number
  has_more: boolean
}

export interface CategoryGroup {
  name: string
  count: number
  total_allocated_cents: number
}

export class BudgetAPI {
  /**
   * Get paginated budget categories with filtering and sorting
   */
  static async getCategories(
    budgetId: number,
    options: {
      limit?: number
      offset?: number
      search?: string
      group?: string
      sortBy?: 'order' | 'name' | 'allocated_cents'
      sortDesc?: boolean
    } = {}
  ): Promise<CategoryListResponse> {
    const params = new URLSearchParams()
    
    if (options.limit) params.append('limit', options.limit.toString())
    if (options.offset) params.append('offset', options.offset.toString())
    if (options.search) params.append('search', options.search)
    if (options.group) params.append('group', options.group)
    if (options.sortBy) params.append('sort_by', options.sortBy)
    if (options.sortDesc) params.append('sort_desc', 'true')

    const response = await api.get(`/api/budgets/${budgetId}/categories?${params}`)
    return response.data
  }

  /**
   * Bulk update multiple budget categories
   */
  static async bulkUpdateCategories(
    budgetId: number,
    updates: BudgetCategoryUpdate[]
  ): Promise<BulkUpdateResponse> {
    const response = await api.post(`/api/budgets/${budgetId}/categories/bulk`, {
      updates
    })
    return response.data
  }

  /**
   * Reorder budget categories
   */
  static async reorderCategories(
    budgetId: number,
    categoryOrders: Array<{ id: number; order: number }>
  ): Promise<{ updated_count: number; message: string }> {
    const response = await api.post(`/api/budgets/${budgetId}/categories/reorder`, categoryOrders)
    return response.data
  }

  /**
   * Get category groups with counts
   */
  static async getCategoryGroups(budgetId: number): Promise<CategoryGroup[]> {
    const response = await api.get(`/api/budgets/${budgetId}/groups`)
    return response.data
  }

  /**
   * Get category templates with pagination and filtering
   */
  static async getTemplates(options: {
    activeOnly?: boolean
    categoryType?: string
    categoryGroup?: string
    search?: string
    limit?: number
    offset?: number
  } = {}): Promise<{
    templates: CategoryTemplate[]
    total: number
    limit?: number
    offset?: number
    has_more?: boolean
  }> {
    const params = new URLSearchParams()
    
    if (options.activeOnly !== undefined) params.append('active_only', options.activeOnly.toString())
    if (options.categoryType) params.append('category_type', options.categoryType)
    if (options.categoryGroup) params.append('category_group', options.categoryGroup)
    if (options.search) params.append('search', options.search)
    if (options.limit) params.append('limit', options.limit.toString())
    if (options.offset) params.append('offset', options.offset.toString())

    const response = await api.get(`/api/category-templates?${params}`)
    return response.data
  }

  /**
   * Create multiple categories from templates
   */
  static async createCategoriesFromTemplates(
    budgetId: number,
    templateIds: number[]
  ): Promise<BulkUpdateResponse> {
    // First get the templates
    const templatesResponse = await api.get('/api/category-templates')
    const templates = templatesResponse.data.templates.filter((t: CategoryTemplate) => 
      templateIds.includes(t.id)
    )

    // Create category updates from templates
    const updates: BudgetCategoryUpdate[] = templates.map((template: CategoryTemplate, index: number) => ({
      category_id: 0, // Will be created
      name: template.name,
      allocated_cents: template.default_allocation_cents,
      order: template.order || index,
      description: template.description,
      category_group: template.category_group
    }))

    // Use the bulk update endpoint to create categories
    return this.bulkUpdateCategories(budgetId, updates)
  }

  /**
   * Search categories across all budgets for a user
   */
  static async searchCategories(
    searchTerm: string,
    options: {
      limit?: number
      categoryType?: string
      budgetId?: number
    } = {}
  ): Promise<BudgetCategory[]> {
    const params = new URLSearchParams()
    params.append('search', searchTerm)
    
    if (options.limit) params.append('limit', options.limit.toString())
    if (options.categoryType) params.append('category_type', options.categoryType)
    if (options.budgetId) params.append('budget_id', options.budgetId.toString())

    const response = await api.get(`/api/categories/search?${params}`)
    return response.data
  }

  /**
   * Get category usage analytics
   */
  static async getCategoryAnalytics(options: {
    period?: 'month' | 'quarter' | 'year'
    categoryGroup?: string
  } = {}): Promise<{
    most_used: Array<{ name: string; usage_count: number }>
    avg_allocations: Array<{ name: string; avg_allocation: number }>
    group_totals: Array<{ group: string; total_allocated: number }>
  }> {
    const params = new URLSearchParams()
    
    if (options.period) params.append('period', options.period)
    if (options.categoryGroup) params.append('category_group', options.categoryGroup)

    const response = await api.get(`/api/categories/analytics?${params}`)
    return response.data
  }

  /**
   * Duplicate categories from one budget to another
   */
  static async duplicateCategories(
    sourceBudgetId: number,
    targetBudgetId: number,
    categoryIds?: number[]
  ): Promise<BulkUpdateResponse> {
    const response = await api.post(`/api/budgets/${targetBudgetId}/categories/duplicate`, {
      source_budget_id: sourceBudgetId,
      category_ids: categoryIds
    })
    return response.data
  }

  /**
   * Export categories to CSV
   */
  static async exportCategories(
    budgetId: number,
    format: 'csv' | 'json' = 'csv'
  ): Promise<Blob> {
    const response = await api.get(`/api/budgets/${budgetId}/categories/export?format=${format}`, {
      responseType: 'blob'
    })
    return response.data
  }

  /**
   * Import categories from CSV
   */
  static async importCategories(
    budgetId: number,
    file: File,
    options: {
      skipDuplicates?: boolean
      updateExisting?: boolean
    } = {}
  ): Promise<BulkUpdateResponse> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('skip_duplicates', options.skipDuplicates ? 'true' : 'false')
    formData.append('update_existing', options.updateExisting ? 'true' : 'false')

    const response = await api.post(`/api/budgets/${budgetId}/categories/import`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  }
}

// Utility functions for category management
export const CategoryUtils = {
  /**
   * Format currency from cents
   */
  formatCurrency: (cents: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100)
  },

  /**
   * Calculate total allocated for categories
   */
  calculateTotal: (categories: BudgetCategory[]): number => {
    return categories.reduce((sum, cat) => sum + cat.allocated_cents, 0)
  },

  /**
   * Group categories by category_group
   */
  groupCategories: (categories: BudgetCategory[]): Record<string, BudgetCategory[]> => {
    return categories.reduce((groups, category) => {
      const group = category.category_group || 'Ungrouped'
      if (!groups[group]) groups[group] = []
      groups[group].push(category)
      return groups
    }, {} as Record<string, BudgetCategory[]>)
  },

  /**
   * Sort categories by multiple criteria
   */
  sortCategories: (
    categories: BudgetCategory[],
    sortBy: 'name' | 'allocated_cents' | 'order' = 'order',
    descending = false
  ): BudgetCategory[] => {
    return [...categories].sort((a, b) => {
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

      if (aVal < bVal) return descending ? 1 : -1
      if (aVal > bVal) return descending ? -1 : 1
      return 0
    })
  },

  /**
   * Filter categories by search term
   */
  filterCategories: (
    categories: BudgetCategory[],
    searchTerm: string
  ): BudgetCategory[] => {
    if (!searchTerm) return categories
    
    const term = searchTerm.toLowerCase()
    return categories.filter(cat => 
      cat.name.toLowerCase().includes(term) ||
      cat.description?.toLowerCase().includes(term) ||
      cat.category_group?.toLowerCase().includes(term)
    )
  },

  /**
   * Validate category data
   */
  validateCategory: (category: Partial<BudgetCategory>): string[] => {
    const errors: string[] = []
    
    if (!category.name || category.name.trim().length === 0) {
      errors.push('Category name is required')
    }
    
    if (category.name && category.name.length > 255) {
      errors.push('Category name must be less than 255 characters')
    }
    
    if (category.allocated_cents !== undefined && category.allocated_cents < 0) {
      errors.push('Allocated amount cannot be negative')
    }
    
    if (category.order !== undefined && category.order < 0) {
      errors.push('Order cannot be negative')
    }
    
    return errors
  }
}