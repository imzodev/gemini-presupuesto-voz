import { useReactTable, createColumnHelper, flexRender, getCoreRowModel } from '@tanstack/react-table';
import { format } from 'date-fns';
import { useBudget } from '../contexts/BudgetContext';

const columnHelper = createColumnHelper<any>();

export default function TransactionsTable({ data }) {
  const { categories, deleteTransaction } = useBudget();

  // Function to get category name from ID
  const getCategoryName = (categoryId: string) => {
    console.log('Looking up category:', categoryId, 'in categories:', categories);
    const category = categories.find(c => c.id === categoryId);
    console.log('Found category:', category);
    return category ? category.name : 'Unknown Category';
  };

  const columns = [
    columnHelper.accessor('description', {
      header: 'Description',
      cell: info => info.getValue()
    }),
    columnHelper.accessor('amount', {
      header: 'Amount',
      cell: info => `$${info.getValue().toFixed(2)}`
    }),
    columnHelper.accessor('category', {
      header: 'Category',
      cell: info => getCategoryName(info.getValue())
    }),
    columnHelper.accessor('date', {
      header: 'Date',
      cell: info => format(new Date(info.getValue()), 'MMM dd, yyyy')
    }),
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <button
          onClick={() => {
            console.log('Deleting transaction:', row.original);
            deleteTransaction(row.original.id);
          }}
          className="text-red-600 hover:text-red-800"
        >
          Delete
        </button>
      )
    }
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel()
  });

  return (
    <div className="border rounded-lg overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50">
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th key={header.id} className="px-4 py-2 text-left text-sm font-medium">
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map(row => (
            <tr key={row.id} className="border-t hover:bg-gray-50">
              {row.getVisibleCells().map(cell => (
                <td key={cell.id} className="px-4 py-2 text-sm">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
