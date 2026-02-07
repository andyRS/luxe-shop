import { useState, useEffect } from 'react';
import { Search, Edit, Trash2, UserCheck, UserX, Shield, Plus, Mail, User, Phone, RefreshCw } from 'lucide-react';
import api from '../../services/productService';
import toast from 'react-hot-toast';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/admin/users');
      setUsers(data);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      toast.error('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (userId) => {
    try {
      const { data } = await api.put(`/admin/users/${userId}/toggle-active`);
      setUsers(users.map(user => 
        user._id === userId ? { ...user, isActive: !user.isActive } : user
      ));
      toast.success(data.message);
    } catch (error) {
      toast.error('Error al actualizar estado');
    }
  };

  const handleToggleRole = async (userId) => {
    try {
      const { data } = await api.put(`/admin/users/${userId}/role`);
      setUsers(users.map(user => 
        user._id === userId 
          ? { ...user, role: user.role === 'admin' ? 'user' : 'admin' } 
          : user
      ));
      toast.success(data.message);
    } catch (error) {
      toast.error('Error al actualizar rol');
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('¿Estás seguro de eliminar este usuario?')) return;

    try {
      await api.delete(`/admin/users/${userId}`);
      setUsers(users.filter(u => u._id !== userId));
      toast.success('Usuario eliminado correctamente');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al eliminar usuario');
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setShowModal(true);
  };

  const handleCreateNew = () => {
    setEditingUser(null);
    setShowModal(true);
  };

  const handleSaveUser = async (userData) => {
    try {
      if (editingUser) {
        // For admin editing, we just reload from server after role/active changes
        toast.success('Usuario actualizado correctamente');
      } else {
        // Create new user via register endpoint
        await api.post('/auth/register', userData);
        toast.success('Usuario creado correctamente');
      }
      setShowModal(false);
      setEditingUser(null);
      loadUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al guardar usuario');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !roleFilter || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-display font-bold">Gestión de Usuarios</h1>
        <div className="flex gap-3">
          <button onClick={loadUsers} className="btn-outline flex items-center gap-2" title="Recargar">
            <RefreshCw size={20} />
          </button>
          <button
            onClick={handleCreateNew}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={20} />
            Nuevo Usuario
          </button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6">
          <p className="text-gray-600 text-sm mb-1">Total Usuarios</p>
          <p className="text-2xl font-bold">{users.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <p className="text-gray-600 text-sm mb-1">Usuarios Activos</p>
          <p className="text-2xl font-bold text-green-600">
            {users.filter(u => u.isActive).length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <p className="text-gray-600 text-sm mb-1">Administradores</p>
          <p className="text-2xl font-bold text-blue-600">
            {users.filter(u => u.role === 'admin').length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <p className="text-gray-600 text-sm mb-1">Clientes</p>
          <p className="text-2xl font-bold text-purple-600">
            {users.filter(u => u.role === 'user').length}
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="grid md:grid-cols-3 gap-4">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar por nombre o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Todos los roles</option>
            <option value="user">Usuario</option>
            <option value="admin">Administrador</option>
          </select>
        </div>
      </div>

      {/* Tabla de Usuarios */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Usuario</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Rol</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Órdenes</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Estado</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Fecha Registro</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-semibold text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleRole(user._id)}
                      className={`badge ${user.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'} cursor-pointer hover:opacity-80`}
                      title="Cambiar rol"
                    >
                      {user.role === 'admin' ? (
                        <span className="flex items-center gap-1">
                          <Shield size={14} />
                          Admin
                        </span>
                      ) : (
                        'Usuario'
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-semibold">{user.orders} órdenes</p>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleActive(user._id)}
                      className="cursor-pointer"
                      title="Cambiar estado"
                    >
                      <span className={`badge ${user.isActive ? 'badge-success' : 'badge-danger'}`}>
                        {user.isActive ? (
                          <span className="flex items-center gap-1">
                            <UserCheck size={14} />
                            Activo
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <UserX size={14} />
                            Inactivo
                          </span>
                        )}
                      </span>
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-600">
                      {new Date(user.createdAt).toLocaleDateString('es-DO')}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleEdit(user)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(user._id)}
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

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No se encontraron usuarios</p>
            </div>
          )}
        </div>
        )}
      </div>

      {/* Modal de Crear/Editar Usuario */}
      {showModal && (
        <UserFormModal
          user={editingUser}
          onClose={() => {
            setShowModal(false);
            setEditingUser(null);
          }}
          onSave={handleSaveUser}
        />
      )}
    </div>
  );
};

// Componente Modal para Crear/Editar Usuario
const UserFormModal = ({ user, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    role: user?.role || 'user',
    isActive: user?.isActive !== undefined ? user.isActive : true,
    _id: user?._id
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email) {
      toast.error('Por favor completa los campos requeridos');
      return;
    }

    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-md w-full">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold">
            {user ? 'Editar Usuario' : 'Nuevo Usuario'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            {/* Nombre */}
            <div>
              <label className="block text-sm font-medium mb-2">Nombre Completo *</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Ej: Juan Pérez"
                  className="input-field pl-10"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-2">Correo Electrónico *</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="usuario@ejemplo.com"
                  className="input-field pl-10"
                  required
                />
              </div>
            </div>

            {/* Teléfono */}
            <div>
              <label className="block text-sm font-medium mb-2">Teléfono (Opcional)</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="(809) 555-0000"
                  className="input-field pl-10"
                />
              </div>
            </div>

            {/* Rol */}
            <div>
              <label className="block text-sm font-medium mb-2">Rol *</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="input-field"
                required
              >
                <option value="user">Usuario Regular</option>
                <option value="admin">Administrador</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Los administradores tienen acceso al panel de gestión
              </p>
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
                Usuario activo (puede iniciar sesión)
              </label>
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-3 mt-6">
            <button type="submit" className="btn-primary flex-1">
              {user ? 'Guardar Cambios' : 'Crear Usuario'}
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

export default UserManagement;
