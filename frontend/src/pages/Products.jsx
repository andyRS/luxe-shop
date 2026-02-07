import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { productService } from '../services/productService';
import { formatRD, formatUSD } from '../utils/formatCurrency';
import { Filter, Search, ChevronDown } from 'lucide-react';
import SEO from '../components/SEO';
import { SkeletonProductGrid } from '../components/Skeleton';

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    search: searchParams.get('search') || '',
    minPrice: '',
    maxPrice: '',
    sort: 'newest'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [searchInput, setSearchInput] = useState(filters.search);
  const debounceRef = useRef(null);

  // Debounce search input
  const handleSearchChange = useCallback((value) => {
    setSearchInput(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: value }));
    }, 400);
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [filters]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      // Cargar productos del backend
      const data = await productService.getAll(filters);
      let filtered = Array.isArray(data) ? data : (data.products || []);

      // Filtrar por categoría (si el backend no lo hace)
      if (filters.category) {
        filtered = filtered.filter(p => p.category === filters.category);
      }

      // Filtrar por búsqueda
      if (filters.search) {
        filtered = filtered.filter(p => 
          p.name.toLowerCase().includes(filters.search.toLowerCase()) ||
          p.description.toLowerCase().includes(filters.search.toLowerCase())
        );
      }

      // Filtrar por precio
      if (filters.minPrice) {
        filtered = filtered.filter(p => p.price >= Number(filters.minPrice));
      }
      if (filters.maxPrice) {
        filtered = filtered.filter(p => p.price <= Number(filters.maxPrice));
      }

      // Ordenar
      switch (filters.sort) {
        case 'price-asc':
          filtered.sort((a, b) => a.price - b.price);
          break;
        case 'price-desc':
          filtered.sort((a, b) => b.price - a.price);
          break;
        case 'name':
          filtered.sort((a, b) => a.name.localeCompare(b.name));
          break;
        default:
          // newest - ya está ordenado por createdAt desc
          break;
      }

      setProducts(filtered);
    } catch (error) {
      console.error('Error al cargar productos:', error);
      // Si falla el backend, mostrar array vacío
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      search: '',
      minPrice: '',
      maxPrice: '',
      sort: 'newest'
    });
    setSearchParams({});
  };

  const categories = ['vestidos', 'pantalones', 'blusas', 'faldas', 'conjuntos', 'accesorios'];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <SEO 
        title="Productos"
        description="Explora nuestra colección exclusiva de moda premium. Encuentra vestidos, blusas, accesorios y más."
        url="/productos"
      />
      <div className="container-custom">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-display font-bold mb-2">Nuestros Productos</h1>
          <p className="text-gray-600">Descubre nuestra colección exclusiva</p>
        </div>

        {/* Búsqueda y Filtros */}
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          {/* Barra de búsqueda */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar productos..."
              value={searchInput}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Botón de filtros móvil */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden btn-outline flex items-center justify-center gap-2"
          >
            <Filter size={20} />
            Filtros
          </button>

          {/* Ordenar */}
          <div className="relative">
            <select
              value={filters.sort}
              onChange={(e) => handleFilterChange('sort', e.target.value)}
              className="appearance-none pl-4 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white cursor-pointer"
            >
              <option value="newest">Más recientes</option>
              <option value="price-asc">Precio: Menor a Mayor</option>
              <option value="price-desc">Precio: Mayor a Menor</option>
              <option value="name">Nombre A-Z</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar de Filtros */}
          <aside className={`md:w-64 ${showFilters ? 'block' : 'hidden md:block'}`}>
            <div className="bg-white rounded-xl p-6 shadow-sm sticky top-24">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg">Filtros</h3>
                <button
                  onClick={clearFilters}
                  className="text-sm text-primary-500 hover:text-primary-600"
                >
                  Limpiar
                </button>
              </div>

              {/* Categorías */}
              <div className="mb-6">
                <h4 className="font-semibold mb-3">Categoría</h4>
                <div className="space-y-2">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="category"
                      checked={filters.category === ''}
                      onChange={() => handleFilterChange('category', '')}
                      className="mr-2"
                    />
                    <span className="text-sm">Todas</span>
                  </label>
                  {categories.map((cat) => (
                    <label key={cat} className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="category"
                        checked={filters.category === cat}
                        onChange={() => handleFilterChange('category', cat)}
                        className="mr-2"
                      />
                      <span className="text-sm">{cat}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Rango de Precio */}
              <div className="mb-6">
                <h4 className="font-semibold mb-3">Precio</h4>
                <div className="space-y-3">
                  <input
                    type="number"
                    placeholder="Mínimo"
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <input
                    type="number"
                    placeholder="Máximo"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              {/* Badges de filtros activos */}
              {(filters.category || filters.minPrice || filters.maxPrice) && (
                <div className="pt-4 border-t">
                  <h4 className="font-semibold mb-2 text-sm">Filtros activos:</h4>
                  <div className="flex flex-wrap gap-2">
                    {filters.category && (
                      <span className="badge bg-primary-100 text-primary-800">
                        {filters.category}
                      </span>
                    )}
                    {filters.minPrice && (
                      <span className="badge bg-primary-100 text-primary-800">
                        Min: {formatRD(filters.minPrice)} ({formatUSD(filters.minPrice)})
                      </span>
                    )}
                    {filters.maxPrice && (
                      <span className="badge bg-primary-100 text-primary-800">
                        Max: {formatRD(filters.maxPrice)} ({formatUSD(filters.maxPrice)})
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </aside>

          {/* Grid de Productos */}
          <div className="flex-1">
            {loading ? (
              <SkeletonProductGrid count={8} />
            ) : products.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-500 text-lg mb-4">No se encontraron productos</p>
                <button onClick={clearFilters} className="btn-primary">
                  Ver todos los productos
                </button>
              </div>
            ) : (
              <>
                <div className="mb-4 text-sm text-gray-600">
                  Mostrando {products.length} producto{products.length !== 1 ? 's' : ''}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;
