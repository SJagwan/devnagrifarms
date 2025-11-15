import { useEffect, useRef, useState } from "react";
import Button from "./Button";
import TextField from "./TextField";
import Spinner from "./Spinner";

export default function Table({
  columns = [],
  data = [],

  onQueryChange,
  totalItems = 0,
  loading = false,
  showRowsPerPage = false,
  showPagination = true,

  enableSearch = false,
  searchPlaceholder = "Search...",
  filters = [],
  enableSorting = false,
  emptyMessage = "No data available",
  rowsPerPageOptions = [5, 10, 25, 50],
  defaultRowsPerPage = 10,
  initialSort = null, // { sortBy, sortDir }
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(defaultRowsPerPage);
  const [activeFilters, setActiveFilters] = useState({});
  const [sort, setSort] = useState(
    initialSort || { sortBy: null, sortDir: "ASC" }
  );

  const onQueryRef = useRef(onQueryChange);
  useEffect(() => {
    onQueryRef.current = onQueryChange;
  }, [onQueryChange]);

  const suppressImmediateRef = useRef(false);

  useEffect(() => {
    if (typeof onQueryRef.current !== "function") return;
    if (suppressImmediateRef.current) {
      suppressImmediateRef.current = false;
      return;
    }
    onQueryRef.current({
      page: currentPage,
      limit: rowsPerPage,
      search: searchTerm,
      filters: activeFilters,
      sortBy: sort.sortBy,
      sortDir: sort.sortDir,
    });
  }, [currentPage, rowsPerPage, sort]);

  useEffect(() => {
    if (typeof onQueryRef.current !== "function") return;
    const handle = setTimeout(() => {
      onQueryRef.current({
        page: currentPage,
        limit: rowsPerPage,
        search: searchTerm,
        filters: activeFilters,
        sortBy: sort.sortBy,
        sortDir: sort.sortDir,
      });
    }, 350);
    return () => clearTimeout(handle);
  }, [searchTerm, activeFilters, currentPage, rowsPerPage, sort]);

  // Pagination
  const totalPages = Math.ceil(totalItems / rowsPerPage) || 1;
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedData = data;

  const handleSearch = (value) => {
    suppressImmediateRef.current = true;
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleFilterChange = (filterKey, value) => {
    suppressImmediateRef.current = true;
    setActiveFilters((prev) => {
      const updated = { ...prev };
      if (value === "" || value === null) {
        delete updated[filterKey];
      } else {
        updated[filterKey] = value;
      }
      return updated;
    });
    setCurrentPage(1);
  };

  const handleRowsPerPageChange = (value) => {
    setRowsPerPage(Number(value));
    setCurrentPage(1);
  };

  const handleSort = (column) => {
    if (!enableSorting) return;
    const key = column.sortKey;
    if (!key) return;
    setCurrentPage(1);
    setSort((prev) => {
      if (prev.sortBy !== key) return { sortBy: key, sortDir: "ASC" };
      return { sortBy: key, sortDir: prev.sortDir === "ASC" ? "DESC" : "ASC" };
    });
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      {(enableSearch || (filters && filters.length > 0)) && (
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          {enableSearch && (
            <div className="flex-1">
              <TextField
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full"
              />
            </div>
          )}

          {/* Filters */}
          {filters.map((filter) => (
            <div key={filter.key} className="sm:w-48">
              <select
                value={activeFilters[filter.key] || ""}
                onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
              >
                <option value="">{filter.label}</option>
                {filter.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}

      {/* Table */}
      <div
        className="bg-white rounded-lg shadow overflow-hidden relative border border-gray-200"
        aria-busy={loading}
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((column) => {
                  const sortable =
                    enableSorting && (column.sortable || !!column.sortKey);
                  const isActive =
                    sort.sortBy &&
                    sort.sortBy === (column.sortKey || column.key);
                  return (
                    <th
                      key={column.key}
                      scope="col"
                      aria-sort={
                        isActive
                          ? sort.sortDir === "ASC"
                            ? "ascending"
                            : "descending"
                          : "none"
                      }
                      onClick={() => sortable && handleSort(column)}
                      className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider select-none sticky top-0 z-10 bg-gray-50 ${
                        column.headerClassName || ""
                      } ${
                        sortable
                          ? "text-gray-700 cursor-pointer"
                          : "text-gray-500"
                      }`}
                    >
                      <span className="inline-flex items-center gap-1">
                        {column.label}
                        {sortable && (
                          <span className="text-gray-400">
                            {isActive
                              ? sort.sortDir === "ASC"
                                ? "▲"
                                : "▼"
                              : "⇅"}
                          </span>
                        )}
                      </span>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedData.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                paginatedData.map((row, rowIndex) => (
                  <tr
                    key={row.id || rowIndex}
                    className={`hover:bg-gray-50 ${
                      rowIndex % 2 === 1 ? "bg-gray-50/30" : "bg-white"
                    }`}
                  >
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className={`px-6 py-4 ${column.className || ""}`}
                      >
                        {column.render
                          ? column.render(row, rowIndex)
                          : column.accessor
                          ? column.accessor(row)
                          : row[column.key]}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Loading overlay */}
        {loading && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center">
            <Spinner />
          </div>
        )}

        {/* Pagination */}
        {totalItems > 0 && (showRowsPerPage || showPagination) && (
          <div className="px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            {showRowsPerPage && (
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <span>Show</span>
                <select
                  value={rowsPerPage}
                  onChange={(e) => handleRowsPerPageChange(e.target.value)}
                  className="px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {rowsPerPageOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <span>
                  entries (Showing {startIndex + 1}-
                  {Math.min(endIndex, totalItems)} of {totalItems})
                </span>
              </div>
            )}

            {showPagination && totalPages > 1 && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>

                <div className="flex gap-1">
                  {[...Array(totalPages)].map((_, i) => {
                    const page = i + 1;
                    // Show first, last, current, and adjacent pages
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? "primary" : "ghost"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          className="min-w-[2.5rem]"
                        >
                          {page}
                        </Button>
                      );
                    } else if (
                      page === currentPage - 2 ||
                      page === currentPage + 2
                    ) {
                      return (
                        <span key={page} className="px-2 py-1 text-gray-500">
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}
                </div>

                <span className="hidden sm:inline text-sm text-gray-600 px-1">
                  Page {currentPage} of {totalPages}
                </span>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
