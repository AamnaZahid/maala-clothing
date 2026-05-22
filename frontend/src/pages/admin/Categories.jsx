import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { productService } from '../../services/productService';
import { adminService } from '../../services/settingsService';
import { uploadService } from '../../services/uploadService';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { Modal } from '../../components/ui/Modal';

export default function Categories() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editCat, setEditCat] = useState(null);
  const [name, setName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: productService.getCategories,
  });

  const openAdd = () => {
    setEditCat(null);
    setName('');
    setImageUrl('');
    setShowForm(true);
  };

  const openEdit = (cat) => {
    setEditCat(cat);
    setName(cat.name);
    setImageUrl(cat.imageUrl || '');
    setShowForm(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadService.uploadImage(file);
      setImageUrl(url);
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Name is required');
      return;
    }
    try {
      if (editCat) {
        await adminService.updateCategory(editCat.id, { name, imageUrl });
        toast.success('Category updated');
      } else {
        await adminService.createCategory({ name, imageUrl });
        toast.success('Category created');
      }
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setShowForm(false);
    } catch {
      toast.error('Failed to save');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this category?')) return;
    try {
      await adminService.deleteCategory(id);
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  if (isLoading) return <LoadingSkeleton count={4} />;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Categories</h1>
        <Button onClick={openAdd}>Add Category</Button>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {(categories || []).map((cat) => (
          <div key={cat.id} className="overflow-hidden rounded-xl bg-white shadow-sm">
            <img
              src={cat.imageUrl || 'https://placehold.co/400x400/fce7f3/e11d48?text=Category'}
              alt={cat.name}
              className="aspect-square w-full object-cover"
            />
            <div className="p-4">
              <p className="font-medium">{cat.name}</p>
              <div className="mt-2 flex gap-2">
                <Button size="sm" variant="ghost" onClick={() => openEdit(cat)}>Edit</Button>
                <Button size="sm" variant="danger" onClick={() => handleDelete(cat.id)}>Delete</Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)} title={editCat ? 'Edit Category' : 'Add Category'}>
        <div className="space-y-4">
          <Input label="Category Name" value={name} onChange={(e) => setName(e.target.value)} />
          <div>
            <label className="mb-2 block text-sm font-medium">Image</label>
            {imageUrl && <img src={imageUrl} alt="" className="mb-2 h-32 w-32 rounded object-cover" />}
            <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed p-3 text-sm">
              {uploading ? 'Uploading...' : 'Upload image'}
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </label>
          </div>
          <Button onClick={handleSave} className="w-full">Save</Button>
        </div>
      </Modal>
    </div>
  );
}
