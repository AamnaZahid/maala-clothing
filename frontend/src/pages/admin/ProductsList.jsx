import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { adminService } from '../../services/settingsService';
import { formatPrice } from '../../utils/formatPrice';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';

export default function ProductsList() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [deleteId, setDeleteId] = useState(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['adminProducts', page],
    queryFn: () => adminService.getProducts(page),
  });

  const handleDelete = async () => {
    try {
      await adminService.deleteProduct(deleteId);
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
      toast.success('Product deleted');
      setDeleteId(null);
    } catch {
      toast.error('Failed to delete');
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Products</h1>
        <Link to="/admin/products/new"><Button>Add New Product</Button></Link>
      </div>

      {isError ? (
        <p className="rounded-lg bg-red-50 p-4 text-sm text-red-700">Could not load products. Refresh the page or log in again as admin.</p>
      ) : isLoading ? (
        <LoadingSkeleton type="list" />
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left">
                <tr>
                  <th className="px-4 py-3">Image</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Stock</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(data?.content || []).map((p) => (
                  <tr key={p.id} className="border-t">
                    <td className="px-4 py-3">
                      <img src={p.imageUrls?.[0]} alt="" className="h-10 w-10 rounded object-cover" />
                    </td>
                    <td className="px-4 py-3 font-medium">{p.name}</td>
                    <td className="px-4 py-3">{p.categoryName}</td>
                    <td className="px-4 py-3">{formatPrice(p.discountedPrice || p.price)}</td>
                    <td className={`px-4 py-3 ${p.stockQuantity < 5 ? 'font-bold text-red-600' : ''}`}>
                      {p.stockQuantity}
                    </td>
                    <td className="px-4 py-3">{p.isActive ? 'Active' : 'Inactive'}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Link to={`/admin/products/${p.id}/edit`}>
                          <Button size="sm" variant="ghost">Edit</Button>
                        </Link>
                        <Button size="sm" variant="danger" onClick={() => setDeleteId(p.id)}>Delete</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!(data?.content || []).length && (
              <p className="px-4 py-8 text-center text-sm text-gray-500">No products yet. Add your first product.</p>
            )}
          </div>
          {data?.totalPages > 1 && (
            <div className="mt-4 flex justify-center gap-2">
              <Button variant="secondary" disabled={page === 0} onClick={() => setPage(page - 1)}>Previous</Button>
              <span className="flex items-center px-4 text-sm">Page {page + 1}</span>
              <Button variant="secondary" disabled={data.last} onClick={() => setPage(page + 1)}>Next</Button>
            </div>
          )}
        </>
      )}

      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Product">
        <p className="mb-4 text-sm text-gray-600">Are you sure you want to delete this product?</p>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => setDeleteId(null)} className="flex-1">Cancel</Button>
          <Button variant="danger" onClick={handleDelete} className="flex-1">Delete</Button>
        </div>
      </Modal>
    </div>
  );
}
