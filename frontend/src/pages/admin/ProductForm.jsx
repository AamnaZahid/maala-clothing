import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Upload, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { productService } from '../../services/productService';
import { adminService } from '../../services/settingsService';
import { uploadService } from '../../services/uploadService';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { getApiError } from '../../services/api';

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size'];

const schema = z.object({
  name: z.string().min(2, 'Name required'),
  categoryId: z.coerce.number().min(1, 'Category required'),
  description: z.string().optional(),
  price: z.coerce.number().min(1, 'Price required'),
  discountedPrice: z.coerce.number().optional().nullable(),
  stockQuantity: z.coerce.number().min(0),
  isActive: z.boolean(),
  isFeatured: z.boolean(),
});

export default function ProductForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [images, setImages] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [colors, setColors] = useState([]);
  const [colorInput, setColorInput] = useState('');
  const [uploading, setUploading] = useState(false);

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: productService.getCategories,
  });

  const { isLoading, isError } = useQuery({
    queryKey: ['adminProduct', id],
    queryFn: async () => {
      const product = await adminService.getProduct(id);
      reset({
        name: product.name,
        categoryId: product.categoryId,
        description: product.description || '',
        price: product.price,
        discountedPrice: product.discountedPrice,
        stockQuantity: product.stockQuantity,
        isActive: product.isActive,
        isFeatured: product.isFeatured,
      });
      setImages(product.imageUrls || []);
      setSizes(product.sizes || []);
      setColors(product.colors || []);
      return product;
    },
    enabled: isEdit,
  });

  const { register, handleSubmit, reset, watch, setValue, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { isActive: true, isFeatured: false, stockQuantity: 10 },
  });

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    setUploading(true);
    try {
      for (const file of files) {
        const url = await uploadService.uploadImage(file);
        setImages((prev) => [...prev, url]);
      }
    } catch {
      toast.error('Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  const toggleSize = (size) => {
    setSizes((prev) => prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]);
  };

  const addColor = (e) => {
    if (e.key === 'Enter' && colorInput.trim()) {
      e.preventDefault();
      if (!colors.includes(colorInput.trim())) {
        setColors([...colors, colorInput.trim()]);
      }
      setColorInput('');
    }
  };

  const onSubmit = async (data) => {
    if (images.length === 0) {
      toast.error('Add at least one image');
      return;
    }
    const payload = {
      ...data,
      discountedPrice: data.discountedPrice || null,
      imageUrls: images,
      sizes,
      colors,
    };
    try {
      if (isEdit) {
        await adminService.updateProduct(id, payload);
        toast.success('Product updated');
      } else {
        await adminService.createProduct(payload);
        toast.success('Product created');
      }
      navigate('/admin/products');
    } catch (err) {
      toast.error(typeof getApiError(err) === 'string' ? getApiError(err) : 'Failed to save');
    }
  };

  if (isEdit && isLoading) return <LoadingSkeleton />;
  if (isEdit && isError) {
    return (
      <p className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
        Product not found or failed to load.
      </p>
    );
  }

  return (
    <div className="max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold">{isEdit ? 'Edit Product' : 'Add Product'}</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-xl bg-white p-6 shadow-sm">
        <Input label="Product Name" {...register('name')} error={errors.name?.message} />

        <div>
          <label className="mb-1 block text-sm font-medium">Category</label>
          <select {...register('categoryId')} className="w-full rounded-lg border px-3 py-2 text-sm">
            <option value="">Select category</option>
            {(categories || []).map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          {errors.categoryId && <p className="mt-1 text-xs text-red-600">{errors.categoryId.message}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Description</label>
          <textarea {...register('description')} rows={3} className="w-full rounded-lg border px-3 py-2 text-sm" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input label="Price (PKR)" type="number" {...register('price')} error={errors.price?.message} />
          <Input label="Discounted Price (optional)" type="number" {...register('discountedPrice')} />
        </div>

        <Input label="Stock Quantity" type="number" {...register('stockQuantity')} error={errors.stockQuantity?.message} />

        <div>
          <p className="mb-2 text-sm font-medium">Sizes</p>
          <div className="flex flex-wrap gap-2">
            {SIZES.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => toggleSize(size)}
                className={`rounded-lg border px-3 py-1 text-sm ${sizes.includes(size) ? 'border-rose-600 bg-rose-50' : ''}`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium">Colors (press Enter to add)</p>
          <input
            value={colorInput}
            onChange={(e) => setColorInput(e.target.value)}
            onKeyDown={addColor}
            className="w-full rounded-lg border px-3 py-2 text-sm"
            placeholder="Type color name"
          />
          <div className="mt-2 flex flex-wrap gap-2">
            {colors.map((c) => (
              <span key={c} className="flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-sm">
                {c}
                <button type="button" onClick={() => setColors(colors.filter((x) => x !== c))}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium">Images</p>
          <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed p-4 text-sm text-gray-500">
            <Upload className="h-5 w-5" />
            {uploading ? 'Uploading...' : 'Click or drag to upload'}
            <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} disabled={uploading} />
          </label>
          <div className="mt-3 grid grid-cols-4 gap-2">
            {images.map((url, i) => (
              <div key={i} className="relative aspect-square">
                <img src={url} alt="" className="h-full w-full rounded object-cover" />
                <button
                  type="button"
                  onClick={() => setImages(images.filter((_, j) => j !== i))}
                  className="absolute right-1 top-1 rounded-full bg-red-500 p-0.5 text-white"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" {...register('isFeatured')} /> Featured
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" {...register('isActive')} defaultChecked /> Active
          </label>
        </div>

        <Button type="submit" loading={isSubmitting} className="w-full">
          {isEdit ? 'Update Product' : 'Save Product'}
        </Button>
      </form>
    </div>
  );
}
