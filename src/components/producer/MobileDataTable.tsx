import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Search,
  Filter,
  ArrowUpDown
} from 'lucide-react';

interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (value: unknown, row: Record<string, unknown>) => React.ReactNode;
}

interface MobileDataTableProps {
  data: Record<string, unknown>[];
  columns: Column[];
  title?: string;
  searchable?: boolean;
  filterable?: boolean;
  onRowClick?: (row: Record<string, unknown>) => void;
  onEdit?: (row: Record<string, unknown>) => void;
  onDelete?: (row: Record<string, unknown>) => void;
  onView?: (row: Record<string, unknown>) => void;
}

export function MobileDataTable({
  data,
  columns,
  title = "Données",
  searchable = true,
  filterable = true,
  onRowClick,
  onEdit,
  onDelete,
  onView
}: MobileDataTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
  };

  const toggleRow = (rowId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(rowId)) {
      newExpanded.delete(rowId);
    } else {
      newExpanded.add(rowId);
    }
    setExpandedRows(newExpanded);
  };

  const getRowId = (row: any, index: number) => {
    return row.id || `row-${index}`;
  };

  const filteredData = data.filter(row => {
    if (!searchTerm) return true;
    return columns.some(column => {
      const value = row[column.key];
      if (typeof value === 'string') {
        return value.toLowerCase().includes(searchTerm.toLowerCase());
      }
      return false;
    });
  });

  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortColumn) return 0;

    const aValue = a[sortColumn];
    const bValue = b[sortColumn];

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const renderCellValue = (column: Column, row: any) => {
    if (column.render) {
      return column.render(row[column.key], row);
    }
    return row[column.key];
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'active': 'bg-green-100 text-green-800',
      'pending': 'bg-yellow-100 text-yellow-800',
      'completed': 'bg-blue-100 text-blue-800',
      'cancelled': 'bg-red-100 text-red-800',
      'draft': 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-4">
      {/* Header with Search and Filters */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {searchable && (
            <div className="flex gap-2 mb-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  className="w-full pl-10 pr-4 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              {filterable && (
                <Button variant="outline" size="icon" className="touch-manipulation">
                  <Filter className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mobile Table */}
      <div className="space-y-3">
        {sortedData.length === 0 ? (
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">Aucune donnée trouvée</p>
            </CardContent>
          </Card>
        ) : (
          sortedData.map((row, index) => {
            const rowId = getRowId(row, index);
            const isExpanded = expandedRows.has(rowId);

            return (
              <Card key={rowId} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  {/* Main Row */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm truncate">
                        {renderCellValue(columns[0], row)}
                      </h3>
                      <p className="text-xs text-muted-foreground truncate">
                        {columns.length > 1 && renderCellValue(columns[1], row)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                      {/* Status Badge */}
                      {row.status && (
                        <Badge className={`text-xs ${getStatusColor(row.status)}`}>
                          {row.status}
                        </Badge>
                      )}
                      {/* Expand/Collapse Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleRow(rowId)}
                        className="h-8 w-8 p-0 touch-manipulation"
                      >
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Key Information */}
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {columns.slice(2, 4).map((column, colIndex) => (
                      <div key={colIndex} className="text-xs">
                        <span className="text-muted-foreground">{column.label}: </span>
                        <span className="font-medium">
                          {renderCellValue(column, row)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Expandable Details */}
                  {isExpanded && (
                    <div className="border-t pt-3 mt-3">
                      <div className="space-y-2">
                        {columns.slice(4).map((column, colIndex) => (
                          <div key={colIndex} className="flex justify-between text-xs">
                            <span className="text-muted-foreground">{column.label}:</span>
                            <span className="font-medium text-right">
                              {renderCellValue(column, row)}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 mt-3 pt-3 border-t">
                        {onView && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onView(row)}
                            className="flex-1 touch-manipulation"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            Voir
                          </Button>
                        )}
                        {onEdit && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onEdit(row)}
                            className="flex-1 touch-manipulation"
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Modifier
                          </Button>
                        )}
                        {onDelete && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onDelete(row)}
                            className="text-destructive hover:text-destructive flex-1 touch-manipulation"
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Supprimer
                          </Button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Quick Actions (collapsed state) */}
                  {!isExpanded && (onView || onEdit) && (
                    <div className="flex justify-end gap-1 mt-2">
                      {onView && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onView(row)}
                          className="h-7 w-7 p-0 touch-manipulation"
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                      )}
                      {onEdit && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(row)}
                          className="h-7 w-7 p-0 touch-manipulation"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Sort Options */}
      {sortColumn && (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                Trié par: {columns.find(c => c.key === sortColumn)?.label}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSortColumn(null);
                  setSortDirection('asc');
                }}
                className="h-6 px-2 text-xs"
              >
                Annuler
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}