import { useEffect, useState } from "react";
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
} from "../../services/api";
import CustomSelect from "../Layout/CustomSelect";
import DeleteModal from "../Layout/DeleteModal";
import TagPicker from "../Layout/TagPicker";
const userRole = ["Admin", "Manager", "Admin Tech", "Tech"];
interface User {
  user_id: string;
  username: string;
  email: string;
  role_name: string;
  is_active: boolean;
  created_at: string;
  last_login: string | null;
  company_id: string;
}

interface UserFormData {
  username: string;
  email: string;
  password: string;
  role_name: string;
  company_id: string;
}
const groupOptions = ["Group A", "Group B", "Group C", "Group D"];

function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    username: "",
    email: "",
    password: "",
    role_name: "Tech",
    company_id: "",
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await getUsers();
      setUsers(response.users || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await updateUser(editingUser.user_id, formData);
      } else {
        await createUser(formData);
      }
      setShowModal(false);
      setEditingUser(null);
      setFormData({
        username: "",
        email: "",
        password: "",
        role_name: "Tech",
        company_id: "",
      });
      fetchUsers();
    } catch (error) {
      console.error("Error saving user:", error);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      password: "",
      role_name: user.role_name,
      company_id: user.company_id,
    });
    setShowModal(true);
  };

  const handleDelete = async (userId: string) => {
    try {
      await deleteUser(userId);
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const handleToggleActive = async (user: User) => {
    try {
      await updateUser(user.user_id, { is_active: !user.is_active } as any);
      fetchUsers();
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-[22px] font-medium leading-[100%] text-[#0A0A0A] tracking-[-0.02em]  text-gray-900">
              User Management
            </h1>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="px-5 py-2 font-medium bg-[rgba(48,164,108,1)] text-white rounded-lg hover:bg-primary-700 flex items-center space-x-2"
          >
            <svg
              className="w-5 h-5 font-medium text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            <span>Add User</span>
          </button>
        </div>

        {/* Users Table */}
        <div className="bg-white border border-[#E6E6E6] rounded-lg p-6 shadow-[0px_11px_16px_0px_rgba(220,220,221,0.4)]">
          {/* Header with Filters */}
          <div className=" mb-6">
            <h3 className="text-[22px] font-medium leading-[100%] text-[#0A0A0A] tracking-[-0.02em]  text-gray-900">
              User Accounts
            </h3>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-[#E6E6E6]">
                  {["User", "Role", "Status", ""].map((heading) => (
                    <th
                      key={heading}
                      className="min-w-[160px] px-4 py-3 text-left font-medium text-[rgba(28,32,36,1)] text-sm"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {users.map((user) => (
                  <tr
                    key={user.user_id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    {/* USERNAME */}
                    <td className="min-w-[160px] px-4 py-4 text-[14px] text-[rgba(28,32,36,1)]">
                      {user.username}
                    </td>

                    {/* ROLE */}
                    <td className="min-w-[160px] px-4 py-4 text-[14px]">
                      <span
                        className={`px-2 py-1 rounded-[5px] text-sm font-medium bg-[rgba(0,71,241,0.07)] ${
                          user.role_name === "Admin"
                            ? " text-[rgba(0,43,183,0.77)]"
                            : user.role_name === "Manager"
                            ? " text-[rgba(182,0,116,0.84)]"
                            : user.role_name === "Admin Tech"
                            ? " text-yellow-800"
                            : " text-[rgba(0,101,20,0.84)]"
                        }`}
                      >
                        {user.role_name}
                      </span>
                    </td>

                    {/* STATUS */}
                    <td className="min-w-[160px] px-4 py-4">
                      <button onClick={() => handleToggleActive(user)}>
                        {user.is_active ? "Active" : "Inactive"}
                      </button>
                    </td>

                    {/* ACTIONS */}
                    <td className="min-w-[160px] px-4 py-4">
                      <div className="flex items-center space-x-2">
                        <button onClick={() => handleEdit(user)}>Edit</button>
                        <button
                          onClick={() => {
                            setSelectedUserId(user.user_id);
                            setOpenDelete(true);
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {/* <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">
                    User
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">
                    Role
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">
                    Last Login
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.user_id} className="border-b border-gray-100">
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium text-gray-900">
                          {user.username}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.email}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.role_name === "Admin"
                            ? "bg-red-100 text-red-800"
                            : user.role_name === "Manager"
                            ? "bg-blue-100 text-blue-800"
                            : user.role_name === "Admin Tech"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {user.role_name}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleToggleActive(user)}
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.is_active
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {user.is_active ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500">
                      {user.last_login
                        ? new Date(user.last_login).toLocaleString()
                        : "Never"}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(user)}
                          className="text-primary-600 hover:text-primary-800 text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(user.user_id)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div> */}
      </div>
      {/* Add/Edit User Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="mb-6">
              <h2 className="text-[22px] font-semibold text-gray-900 leading-[100%] tracking-[-0.02em]">
                {editingUser ? "Edit User" : "Add New User"}
              </h2>
              <p className="font-sans font-normal text-sm leading-[20px] tracking-[0.2px] mt-3">
                Add new member to your organization.
              </p>
            </div>
            {/* <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingUser ? "Edit User" : "Add New User"}
            </h3> */}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  placeholder="john.doe"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-[16px] font-medium text-[rgba(0,0,0,1)] mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="reginaphanalge@mail.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password {editingUser && "(leave blank to keep current)"}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder={editingUser ? "Leave blank to keep existing password" : "Enter a secure password"}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-transparent"
                  required={!editingUser}
                />
              </div>

              <div>
                <label className="block text-[16px] font-medium text-[rgba(0,0,0,1)] mb-1">
                  Assign Role
                </label>
                <CustomSelect
                  options={userRole}
                  value={formData.role_name}
                  multiSelect={false}
                  containerClassName="w-full"
                  onChange={(val) =>
                    setFormData({
                      ...formData,
                      role_name: Array.isArray(val)
                        ? (val[0] ?? formData.role_name)
                        : val,
                    })
                  }
                />

                {/* <select
                  value={formData.role_name}
                  onChange={(e) =>
                    setFormData({ ...formData, role_name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="Admin">Admin</option>
                  <option value="Manager">Manager</option>
                  <option value="Admin Tech">Admin Tech</option>
                  <option value="Tech">Tech</option>
                </select> */}
              </div>
              <div>
                <label className="block text-[16px] font-medium text-[rgba(0,0,0,1)] mb-1">
                  Groups
                </label>
                <TagPicker
                  options={groupOptions}
                  value={selectedGroups}
                  containerClassName="w-full"
                  onChange={(val) => setSelectedGroups(val)}
                />
              </div>
              <div>
                <label className="block text-[16px] font-medium text-[rgba(0,0,0,1)] mb-1">
                  Select Devices
                </label>
                <TagPicker
                  options={groupOptions}
                  value={selectedGroups}
                  containerClassName="w-full"
                  onChange={(val) => setSelectedGroups(val)}
                />
              </div>
              {/* <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company ID
                </label>
                <input
                  type="text"
                  value={formData.company_id}
                  onChange={(e) =>
                    setFormData({ ...formData, company_id: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div> */}

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingUser(null);
                    setFormData({
                      username: "",
                      email: "",
                      password: "",
                      role_name: "Tech",
                      company_id: "",
                    });
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  {editingUser ? "Update User" : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <DeleteModal
        open={openDelete}
        onClose={() => setOpenDelete(false)}
        onConfirm={async () => {
          if (selectedUserId) {
            await handleDelete(selectedUserId);
            setOpenDelete(false);
          }
        }}
      />
    </>
  );
}

export default UserManagement;
