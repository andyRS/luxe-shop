import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Search, Filter, Image as ImageIcon, DollarSign, Package, RefreshCw } from 'lucide-react';
import { productService } from '../../services/productService';
import api from '../../services/productService';
import { formatRD, formatUSD } from '../../utils/formatCurrency';
import toast from 'react-hot-toast';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Cargar productos
  useEffect(() => {
    loadProducts();
  }, []);

  // Filtrar productos
  useEffect(() => {
    let filtered = [...products];

    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter) {
      filtered = filtered.filter(p => p.category === categoryFilter);
    }

    setFilteredProducts(filtered);
  }, [searchTerm, categoryFilter, products]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await productService.getAll();
      const productList = data.products || data;
      setProducts(Array.isArray(productList) ? productList : []);
      setFilteredProducts(Array.isArray(productList) ? productList : []);
    } catch (error) {
      console.error('Error al cargar productos:', error);
      toast.error('Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowModal(true);
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('¿Estás seguro de eliminar este producto?')) return;

    try {
      await productService.delete(productId);
      setProducts(products.filter(p => p._id !== productId));
      toast.success('Producto eliminado correctamente');
    } catch (error) {
      toast.error('Error al eliminar producto');
    }
  };

  const handleCreate = () => {
    setEditingProduct(null);
    setShowModal(true);
  };

  const categories = ['vestidos', 'pantalones', 'camisas', 'blusas', 'accesorios', 'conjuntos', 'faldas', 'zapatos', 'casual', 'formal', 'deportivo'];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold mb-2">Gestión de Productos</h1>
            <p className="text-gray-600">Administra tu catálogo de productos</p>
          </div>
          <div className="flex gap-3">
            <button onClick={loadProducts} className="btn-outline flex items-center gap-2" title="Recargar">
              <RefreshCw size={20} />
            </button>
            <button onClick={handleCreate} className="btn-primary flex items-center gap-2">
              <Plus size={20} />
              Nuevo Producto
            </button>
          </div>
        </div>

        {/* Estadísticas Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Total Productos</p>
                <p className="text-2xl font-bold">{products.length}</p>
              </div>
              <Package className="text-primary-500" size={32} />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Stock Total</p>
                <p className="text-2xl font-bold">{products.reduce((acc, p) => acc + p.stock, 0)}</p>
              </div>
              <ImageIcon className="text-blue-500" size={32} />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Valor Inventario</p>
                <p className="text-2xl font-bold">{formatRD(products.reduce((acc, p) => acc + (p.price * p.stock), 0))}</p>
                <p className="text-xs text-gray-400">{formatUSD(products.reduce((acc, p) => acc + (p.price * p.stock), 0))}</p>
              </div>
              <DollarSign className="text-green-500" size={32} />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Categorías</p>
                <p className="text-2xl font-bold">{categories.length}</p>
              </div>
              <Filter className="text-purple-500" size={32} />
            </div>
          </div>
        </div>

        {/* Filtros y Búsqueda */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar productos por nombre o descripción..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Todas las categorías</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Tabla de Productos */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="spinner"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Imagen</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Producto</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Categoría</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Precio</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Stock</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Estado</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredProducts.map((product) => (
                    <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-gray-900">{product.name}</p>
                          <p className="text-sm text-gray-600 line-clamp-1">{product.description}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="badge bg-primary-100 text-primary-800">
                          {product.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-primary-500">{formatRD(product.price)}</p>
                        <p className="text-xs text-gray-400">{formatUSD(product.price)}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`font-semibold ${product.stock < 5 ? 'text-red-600' : 'text-gray-900'}`}>
                          {product.stock} unidades
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`badge ${product.isActive ? 'badge-success' : 'badge-danger'}`}>
                          {product.isActive ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEdit(product)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(product._id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredProducts.length === 0 && (
                <div className="text-center py-12">
                  <Package size={64} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">No se encontraron productos</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal de Crear/Editar */}
        {showModal && (
          <ProductFormModal
            product={editingProduct}
            onClose={() => {
              setShowModal(false);
              setEditingProduct(null);
            }}
            onSave={async (productData) => {
              try {
                if (editingProduct) {
                  const updated = await productService.update(editingProduct._id, productData);
                  toast.success('Producto actualizado correctamente');
                } else {
                  const created = await productService.create(productData);
                  toast.success('Producto creado correctamente');
                }
                setShowModal(false);
                setEditingProduct(null);
                loadProducts();
              } catch (error) {
                toast.error(error.response?.data?.message || 'Error al guardar producto');
              }
            }}
          />
        )}
      </div>
    </div>
  );
};

// Componente Modal para Crear/Editar Producto
const ProductFormModal = ({ product, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price || '',
    stock: product?.stock || '',
    category: product?.category || 'Formal',
    image: product?.image || '',
    isActive: product?.isActive !== undefined ? product.isActive : true
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(product?.image || '');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones
    if (!formData.name || !formData.price || !formData.stock) {
      toast.error('Por favor completa todos los campos requeridos');
      return;
    }

    try {
      let imageUrl = formData.image;

      // Si hay archivo de imagen, subirlo primero
      if (imageFile) {
        const uploadData = new FormData();
        uploadData.append('image', imageFile);
        try {
          const res = await api.post('/upload', uploadData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          imageUrl = res.data.url;
        } catch (uploadErr) {
          console.error('Error subiendo imagen, usando preview:', uploadErr);
        }
      }
      
      const productData = {
        name: formData.name,
        description: formData.description,
        price: Number(formData.price),
        stock: Number(formData.stock),
        category: formData.category,
        image: imageUrl || formData.image,
        isActive: formData.isActive
      };

      onSave(productData);
    } catch (error) {
      toast.error('Error al guardar producto');
    }
  };

  const categories = ['vestidos', 'pantalones', 'camisas', 'blusas', 'accesorios', 'conjuntos', 'faldas', 'zapatos', 'casual', 'formal', 'deportivo'];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b sticky top-0 bg-white">
          <h2 className="text-2xl font-bold">
            {product ? 'Editar Producto' : 'Nuevo Producto'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* Imagen */}
            <div>
              <label className="block text-sm font-medium mb-2">Imagen del Producto *</label>
              <div className="flex items-center gap-4">
                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-32 h-32 object-cover rounded-lg border-2 border-gray-200"
                  />
                )}
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="btn-outline cursor-pointer inline-flex items-center gap-2"
                  >
                    <ImageIcon size={20} />
                    {imagePreview ? 'Cambiar Imagen' : 'Subir Imagen'}
                  </label>
                  <p className="text-xs text-gray-500 mt-2">
                    JPG, PNG o WebP. Máximo 2MB. Recomendado: 600x800px
                  </p>
                </div>
              </div>
            </div>

            {/* Nombre */}
            <div>
              <label className="block text-sm font-medium mb-2">Nombre del Producto *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Ej: Vestido Elegante Premium"
                className="input-field"
                required
              />
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-sm font-medium mb-2">Descripción *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Descripción detallada del producto..."
                rows="3"
                className="input-field resize-none"
                required
              />
            </div>

            {/* Precio y Stock */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Precio (USD) *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className="input-field pl-8"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Stock *</label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                  className="input-field"
                  required
                />
              </div>
            </div>

            {/* Categoría */}
            <div>
              <label className="block text-sm font-medium mb-2">Categoría *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="input-field"
                required
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Estado */}
            <div className="flex items-center">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="mr-2 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                id="isActive"
              />
              <label htmlFor="isActive" className="text-sm font-medium">
                Producto activo (visible en la tienda)
              </label>
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-3 mt-8 pt-6 border-t">
            <button type="submit" className="btn-primary flex-1">
              {product ? 'Guardar Cambios' : 'Crear Producto'}
            </button>
            <button type="button" onClick={onClose} className="btn-outline flex-1">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductManagement;
