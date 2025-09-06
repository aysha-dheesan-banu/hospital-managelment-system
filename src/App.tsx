import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trash2, Building2, Users, UserCheck, Stethoscope, Plus, Edit3 } from 'lucide-react';

const API_BASE = 'http://localhost:8000';

interface Hospital {
  id: number;
  name: string;
  address: string;
  created_at: string; // FastAPI returns this
}

interface Role {
  id: number;
  role_name: string;
  permissions: string;
  hospital_id: number | null; // Can be null
  hospital_name?: string; // Populated by backend
}

interface User {
  id: number;
  username: string;
  full_name: string;
  email: string;
  role_id: number | null; // Can be null
  role_name?: string; // Populated by backend
}

interface Doctor {
  id: number;
  user_id: number;
  hospital_id: number;
  specialty: string;
  short_bio: string | null; // Can be null
  username?: string; // Populated by backend
  full_name?: string; // Populated by backend
  hospital_name?: string; // Populated by backend
}

function App() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(false);

  // Form states
  const [hospitalForm, setHospitalForm] = useState({ name: '', address: '' });
  const [roleForm, setRoleForm] = useState({ role_name: '', permissions: '', hospital_id: '' });
  const [userForm, setUserForm] = useState({ username: '', full_name: '', email: '', password: '', role_id: '' });
  const [doctorForm, setDoctorForm] = useState({ user_id: '', hospital_id: '', specialty: '', short_bio: '' });

  // Edit states
  const [editingHospital, setEditingHospital] = useState<Hospital | null>(null);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);

  // Fetch all data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [hospitalsRes, rolesRes, usersRes, doctorsRes] = await Promise.all([
        axios.get(`${API_BASE}/hospitals`),
        axios.get(`${API_BASE}/roles`),
        axios.get(`${API_BASE}/users`),
        axios.get(`${API_BASE}/doctors`)
      ]);
      
      setHospitals(hospitalsRes.data);
      setRoles(rolesRes.data);
      setUsers(usersRes.data);
      setDoctors(doctorsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Hospital operations
  const handleHospitalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingHospital) {
        await axios.put(`${API_BASE}/hospitals/${editingHospital.id}`, hospitalForm);
        setEditingHospital(null);
      } else {
        await axios.post(`${API_BASE}/hospitals`, hospitalForm);
      }
      setHospitalForm({ name: '', address: '' });
      fetchData();
    } catch (error) {
      console.error('Error with hospital operation:', error);
    }
  };

  const editHospital = (hospital: Hospital) => {
    setEditingHospital(hospital);
    setHospitalForm({ name: hospital.name, address: hospital.address });
  };

  const deleteHospital = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this hospital?')) {
      try {
        await axios.delete(`${API_BASE}/hospitals/${id}`);
        fetchData();
      } catch (error) {
        console.error('Error deleting hospital:', error);
      }
    }
  };

  // Role operations
  const handleRoleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const roleData = {
        ...roleForm,
        hospital_id: roleForm.hospital_id ? parseInt(roleForm.hospital_id) : null
      };
      
      if (editingRole) {
        await axios.put(`${API_BASE}/roles/${editingRole.id}`, roleData);
        setEditingRole(null);
      } else {
        await axios.post(`${API_BASE}/roles`, roleData);
      }
      setRoleForm({ role_name: '', permissions: '', hospital_id: '' });
      fetchData();
    } catch (error) {
      console.error('Error with role operation:', error);
    }
  };

  const editRole = (role: Role) => {
    setEditingRole(role);
    setRoleForm({ 
      role_name: role.role_name, 
      permissions: role.permissions, 
      hospital_id: role.hospital_id?.toString() || '' 
    });
  };

  const deleteRole = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this role?')) {
      try {
        await axios.delete(`${API_BASE}/roles/${id}`);
        fetchData();
      } catch (error) {
        console.error('Error deleting role:', error);
      }
    }
  };

  // User operations
  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userData = {
        ...userForm,
        role_id: userForm.role_id ? parseInt(userForm.role_id) : null
      };
      
      if (editingUser) {
        await axios.put(`${API_BASE}/users/${editingUser.id}`, userData);
        setEditingUser(null);
      } else {
        await axios.post(`${API_BASE}/users`, userData);
      }
      setUserForm({ username: '', full_name: '', email: '', password: '', role_id: '' });
      fetchData();
    } catch (error) {
      console.error('Error with user operation:', error);
    }
  };

  const editUser = (user: User) => {
    setEditingUser(user);
    setUserForm({ 
      username: user.username, 
      full_name: user.full_name, 
      email: user.email, 
      password: '', 
      role_id: user.role_id?.toString() || '' 
    });
  };

  const deleteUser = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axios.delete(`${API_BASE}/users/${id}`);
        fetchData();
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  // Doctor operations
  const handleDoctorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const doctorData = {
        ...doctorForm,
        user_id: parseInt(doctorForm.user_id),
        hospital_id: parseInt(doctorForm.hospital_id)
      };
      
      if (editingDoctor) {
        await axios.put(`${API_BASE}/doctors/${editingDoctor.id}`, doctorData);
        setEditingDoctor(null);
      } else {
        await axios.post(`${API_BASE}/doctors`, doctorData);
      }
      setDoctorForm({ user_id: '', hospital_id: '', specialty: '', short_bio: '' });
      fetchData();
    } catch (error) {
      console.error('Error with doctor operation:', error);
    }
  };

  const editDoctor = (doctor: Doctor) => {
    setEditingDoctor(doctor);
    setDoctorForm({ 
      user_id: doctor.user_id.toString(), 
      hospital_id: doctor.hospital_id.toString(), 
      specialty: doctor.specialty, 
      short_bio: doctor.short_bio || '' 
    });
  };

  const deleteDoctor = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this doctor?')) {
      try {
        await axios.delete(`${API_BASE}/doctors/${id}`);
        fetchData();
      } catch (error) {
        console.error('Error deleting doctor:', error);
      }
    }
  };

  const cancelEdit = () => {
    setEditingHospital(null);
    setEditingRole(null);
    setEditingUser(null);
    setEditingDoctor(null);
    setHospitalForm({ name: '', address: '' });
    setRoleForm({ role_name: '', permissions: '', hospital_id: '' });
    setUserForm({ username: '', full_name: '', email: '', password: '', role_id: '' });
    setDoctorForm({ user_id: '', hospital_id: '', specialty: '', short_bio: '' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Building2 className="w-12 h-12 text-indigo-600 mr-3" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Hospital Management System
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Comprehensive healthcare administration platform for managing hospitals, roles, users, and medical staff
          </p>
          {loading && (
            <div className="mt-4 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <span className="ml-2 text-gray-600">Loading...</span>
            </div>
          )}
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Hospitals Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6">
              <div className="flex items-center text-white">
                <Building2 className="w-8 h-8 mr-3" />
                <h2 className="text-2xl font-bold">Hospitals</h2>
              </div>
            </div>
            
            <div className="p-6">
              <form onSubmit={handleHospitalSubmit} className="space-y-4 mb-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Hospital Name</label>
                  <input
                    type="text"
                    placeholder="Enter hospital name"
                    value={hospitalForm.name}
                    onChange={(e) => setHospitalForm({ ...hospitalForm, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200 bg-gray-50 focus:bg-white"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Address</label>
                  <input
                    type="text"
                    placeholder="Enter hospital address"
                    value={hospitalForm.address}
                    onChange={(e) => setHospitalForm({ ...hospitalForm, address: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200 bg-gray-50 focus:bg-white"
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white py-3 px-6 rounded-xl transition duration-200 font-semibold shadow-lg hover:shadow-xl flex items-center justify-center"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    {editingHospital ? 'Update Hospital' : 'Add Hospital'}
                  </button>
                  {editingHospital && (
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition duration-200"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>

              <div className="space-y-3 max-h-80 overflow-y-auto">
                {hospitals.map((hospital) => (
                  <div key={hospital.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl border border-purple-200 hover:shadow-md transition duration-200">
                    <div className="flex-1">
                      <div className="font-semibold text-gray-800 text-lg">{hospital.name}</div>
                      <div className="text-gray-600 text-sm">{hospital.address}</div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => editHospital(hospital)}
                        className="text-purple-600 hover:text-purple-800 transition duration-200 p-2 hover:bg-white rounded-lg"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteHospital(hospital.id)}
                        className="text-red-600 hover:text-red-800 transition duration-200 p-2 hover:bg-white rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                {hospitals.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Building2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No hospitals added yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Roles Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-pink-500 to-pink-600 p-6">
              <div className="flex items-center text-white">
                <UserCheck className="w-8 h-8 mr-3" />
                <h2 className="text-2xl font-bold">Roles</h2>
              </div>
            </div>
            
            <div className="p-6">
              <form onSubmit={handleRoleSubmit} className="space-y-4 mb-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Hospital</label>
                  <select
                    value={roleForm.hospital_id}
                    onChange={(e) => setRoleForm({ ...roleForm, hospital_id: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition duration-200 bg-gray-50 focus:bg-white"
                  >
                    <option value="">Select Hospital (Optional)</option>
                    {hospitals.map((hospital) => (
                      <option key={hospital.id} value={hospital.id}>{hospital.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Role Name</label>
                  <input
                    type="text"
                    placeholder="e.g., Doctor, Nurse, Admin"
                    value={roleForm.role_name}
                    onChange={(e) => setRoleForm({ ...roleForm, role_name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition duration-200 bg-gray-50 focus:bg-white"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Permissions</label>
                  <input
                    type="text"
                    placeholder="read, write, delete (comma-separated)"
                    value={roleForm.permissions}
                    onChange={(e) => setRoleForm({ ...roleForm, permissions: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition duration-200 bg-gray-50 focus:bg-white"
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white py-3 px-6 rounded-xl transition duration-200 font-semibold shadow-lg hover:shadow-xl flex items-center justify-center"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    {editingRole ? 'Update Role' : 'Add Role'}
                  </button>
                  {editingRole && (
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition duration-200"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>

              <div className="space-y-3 max-h-80 overflow-y-auto">
                {roles.map((role) => (
                  <div key={role.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-pink-50 to-pink-100 rounded-xl border border-pink-200 hover:shadow-md transition duration-200">
                    <div className="flex-1">
                      <div className="font-semibold text-gray-800 text-lg">{role.role_name}</div>
                      <div className="text-gray-600 text-sm">{role.hospital_name || 'Global role'}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        <span className="bg-pink-200 px-2 py-1 rounded-full">{role.permissions}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => editRole(role)}
                        className="text-pink-600 hover:text-pink-800 transition duration-200 p-2 hover:bg-white rounded-lg"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteRole(role.id)}
                        className="text-red-600 hover:text-red-800 transition duration-200 p-2 hover:bg-white rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                {roles.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <UserCheck className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No roles defined yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Users Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-green-600 p-6">
              <div className="flex items-center text-white">
                <Users className="w-8 h-8 mr-3" />
                <h2 className="text-2xl font-bold">Users</h2>
              </div>
            </div>
            
            <div className="p-6">
              <form onSubmit={handleUserSubmit} className="space-y-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Username</label>
                    <input
                      type="text"
                      placeholder="Enter username"
                      value={userForm.username}
                      onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200 bg-gray-50 focus:bg-white"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Full Name</label>
                    <input
                      type="text"
                      placeholder="Enter full name"
                      value={userForm.full_name}
                      onChange={(e) => setUserForm({ ...userForm, full_name: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200 bg-gray-50 focus:bg-white"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    placeholder="Enter email address"
                    value={userForm.email}
                    onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200 bg-gray-50 focus:bg-white"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Password</label>
                  <input
                    type="password"
                    placeholder={editingUser ? "Leave blank to keep current password" : "Enter password"}
                    value={userForm.password}
                    onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200 bg-gray-50 focus:bg-white"
                    required={!editingUser}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Role</label>
                  <select
                    value={userForm.role_id}
                    onChange={(e) => setUserForm({ ...userForm, role_id: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200 bg-gray-50 focus:bg-white"
                  >
                    <option value="">Select Role (Optional)</option>
                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>{role.role_name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-3 px-6 rounded-xl transition duration-200 font-semibold shadow-lg hover:shadow-xl flex items-center justify-center"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    {editingUser ? 'Update User' : 'Create User'}
                  </button>
                  {editingUser && (
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition duration-200"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>

              <div className="space-y-3 max-h-80 overflow-y-auto">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border border-green-200 hover:shadow-md transition duration-200">
                    <div className="flex-1">
                      <div className="font-semibold text-gray-800 text-lg">{user.full_name}</div>
                      <div className="text-gray-600 text-sm">@{user.username} • {user.email}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        <span className="bg-green-200 px-2 py-1 rounded-full">
                          {user.role_name || 'No role assigned'}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => editUser(user)}
                        className="text-green-600 hover:text-green-800 transition duration-200 p-2 hover:bg-white rounded-lg"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteUser(user.id)}
                        className="text-red-600 hover:text-red-800 transition duration-200 p-2 hover:bg-white rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                {users.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No users created yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Doctors Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 p-6">
              <div className="flex items-center text-white">
                <Stethoscope className="w-8 h-8 mr-3" />
                <h2 className="text-2xl font-bold">Doctors</h2>
              </div>
            </div>
            
            <div className="p-6">
              <form onSubmit={handleDoctorSubmit} className="space-y-4 mb-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">User</label>
                  <select
                    value={doctorForm.user_id}
                    onChange={(e) => setDoctorForm({ ...doctorForm, user_id: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition duration-200 bg-gray-50 focus:bg-white"
                    required
                  >
                    <option value="">Select User</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>{user.full_name} (@{user.username})</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Hospital</label>
                  <select
                    value={doctorForm.hospital_id}
                    onChange={(e) => setDoctorForm({ ...doctorForm, hospital_id: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition duration-200 bg-gray-50 focus:bg-white"
                    required
                  >
                    <option value="">Select Hospital</option>
                    {hospitals.map((hospital) => (
                      <option key={hospital.id} value={hospital.id}>{hospital.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Specialty</label>
                  <input
                    type="text"
                    placeholder="e.g., Cardiology, Neurology, Pediatrics"
                    value={doctorForm.specialty}
                    onChange={(e) => setDoctorForm({ ...doctorForm, specialty: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition duration-200 bg-gray-50 focus:bg-white"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Short Bio</label>
                  <textarea
                    placeholder="Brief description of the doctor's background and expertise"
                    value={doctorForm.short_bio}
                    onChange={(e) => setDoctorForm({ ...doctorForm, short_bio: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition duration-200 bg-gray-50 focus:bg-white resize-none"
                    rows={3}
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white py-3 px-6 rounded-xl transition duration-200 font-semibold shadow-lg hover:shadow-xl flex items-center justify-center"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    {editingDoctor ? 'Update Doctor' : 'Add Doctor'}
                  </button>
                  {editingDoctor && (
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition duration-200"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>

              <div className="space-y-3 max-h-80 overflow-y-auto">
                {doctors.map((doctor) => (
                  <div key={doctor.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-xl border border-yellow-200 hover:shadow-md transition duration-200">
                    <div className="flex-1">
                      <div className="font-semibold text-gray-800 text-lg">Dr. {doctor.full_name}</div>
                      <div className="text-gray-600 text-sm">{doctor.specialty}</div>
                      <div className="text-xs text-gray-500 mt-1">{doctor.hospital_name}</div>
                      {doctor.short_bio && (
                        <div className="text-xs text-gray-500 mt-1 italic">"{doctor.short_bio}"</div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => editDoctor(doctor)}
                        className="text-yellow-600 hover:text-yellow-800 transition duration-200 p-2 hover:bg-white rounded-lg"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteDoctor(doctor.id)}
                        className="text-red-600 hover:text-red-800 transition duration-200 p-2 hover:bg-white rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                {doctors.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Stethoscope className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No doctors registered yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-gray-500">
          <p className="text-sm">
            Hospital Management System • Built with React, Node.js, Express & SQLite
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
