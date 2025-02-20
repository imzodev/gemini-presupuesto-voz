import { useReactTable, createColumnHelper, flexRender, getCoreRowModel } from '@tanstack/react-table';
import { useBudget } from '../contexts/BudgetContext';

const columnHelper = createColumnHelper<any>();

export default function CategoriesTable({ data }) {
  console.log('CategoriesTable received data:', data);
  const { deleteCategory } = useBudget();

  const columns = [
    columnHelper.accessor('name', {
      header: 'Category Name',
      cell: info => info.getValue()
    }),
    columnHelper.accessor('budget', {
      header: 'Monthly Budget',
      cell: info => `$${info.getValue().toFixed(2)}`
    }),
    columnHelper.accessor('spent', {
      header: 'Amount Spent',
      cell: info => {
        const value = info.getValue();
        console.log('Rendering spent amount for row:', info.row.original);
        console.log('Spent value:', value, 'type:', typeof value);
        return `$${value.toFixed(2)}`;
      }
    }),
    {
      id: 'actions',
      cell: ({ row }) => (
        <button 
          onClick={() => deleteCategory(row.original.id)}
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
