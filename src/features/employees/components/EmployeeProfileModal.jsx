// src/features/employee/components/EmployeeProfileModal.jsx
import { useState } from "react";
import { 
  X, 
  Mail, 
  CalendarDays, 
  User, 
  Briefcase, 
  Phone, 
  MapPin, 
  Edit, 
  Save 
} from "lucide-react";
import { supabase } from "../../../supabaseClient";
import SuccessToast from "../../leave_management/components/SuccessToast";


export default function EmployeeProfileModal({ employee, open, onClose, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showSuccessToast, setShowSuccessToast] = useState(false); 
  
  // Editable state
  const [editData, setEditData] = useState({
    full_name: employee?.name || "",
    department: employee?.department || "",
    position: employee?.position || "",
    contact: employee?.contact || "",
    address: employee?.address || "",
    category: employee?.category || "",
    gender: employee?.gender || "",
  });

  if (!open || !employee) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");

    try {
      // Update employee in Supabase
      const { error: updateError } = await supabase
        .from("employees")
        .update({
          full_name: editData.full_name,
          department: editData.department,
          position: editData.position,
          contact: editData.contact,
          address: editData.address,
          category: editData.category,
          gender: editData.gender,
        })
        .eq("id", employee.id);

      if (updateError) throw updateError;

      // Call parent callback to refresh employee list
      if (onUpdate) {
        onUpdate();
      }

      setIsEditing(false);
      
      // ✅ SHOW SUCCESS TOAST INSTEAD OF ALERT
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);
      
    } catch (err) {
      console.error("Error updating employee:", err);
      setError("Failed to update employee details");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset to original values
    setEditData({
      full_name: employee?.name || "",
      department: employee?.department || "",
      position: employee?.position || "",
      contact: employee?.contact || "",
      address: employee?.address || "",
      category: employee?.category || "",
      gender: employee?.gender || "",
    });
    setIsEditing(false);
    setError("");
  };

  return (
    <>
      {/* ✅ SUCCESS TOAST */}
      <SuccessToast
        show={showSuccessToast}
        onClose={() => setShowSuccessToast(false)}
        message="Employee details updated successfully!"
      />

      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-green-600 to-green-700 p-6 text-white flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                {employee.profile_image_url ? (
                  <img
                    src={employee.profile_image_url}
                    alt={employee.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="text-green-600" size={32} />
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold">{employee.name}</h2>
                <p className="text-green-100 text-sm">
                  {employee.position} • {employee.department}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Edit/Save Button */}
            <div className="flex justify-end">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Edit size={18} />
                  Edit Details
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    <Save size={18} />
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={saving}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Personal Information */}
            <div className="bg-green-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <User className="text-green-600" size={20} />
                Personal Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="full_name"
                      value={editData.full_name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-800 font-medium py-2.5">{employee.name}</p>
                  )}
                </div>

                {/* Email (Read-only) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="flex items-center gap-2 text-gray-600 py-2.5">
                    <Mail size={18} className="text-gray-400" />
                    <span>{employee.email}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Email cannot be modified</p>
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gender
                  </label>
                  {isEditing ? (
                    <select
                      name="gender"
                      value={editData.gender}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="">Select...</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  ) : (
                    <p className="text-gray-800 py-2.5">{employee.gender || "Not specified"}</p>
                  )}
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Employee Category
                  </label>
                  {isEditing ? (
                    <select
                      name="category"
                      value={editData.category}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="">Select...</option>
                      <option value="Job Order">Job Order</option>
                      <option value="Regular">Regular</option>

                    </select>
                  ) : (
                    <p className="text-gray-800 py-2.5">{employee.category || "Not specified"}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Job Information */}
            <div className="bg-yellow-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Briefcase className="text-yellow-600" size={20} />
                Job Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Department */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Department
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="department"
                      value={editData.department}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-800 font-medium py-2.5">{employee.department}</p>
                  )}
                </div>

                {/* Position */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Position
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="position"
                      value={editData.position}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-800 font-medium py-2.5">{employee.position}</p>
                  )}
                </div>

                {/* Start Date (Read-only) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                  </label>
                  <div className="flex items-center gap-2 text-gray-600 py-2.5">
                    <CalendarDays size={18} className="text-gray-400" />
                    <span>{employee.startDate || "Not specified"}</span>
                  </div>
                </div>

                {/* Status (Read-only) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <span
                    className={`inline-block px-3 py-1.5 rounded-full text-sm font-semibold ${
                      employee.status === "Active"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {employee.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Contact Details */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Phone className="text-blue-600" size={20} />
                Contact Details
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Phone Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="contact"
                      value={editData.contact}
                      onChange={handleInputChange}
                      placeholder="09331092334"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-800 py-2.5">{employee.contact || "Not provided"}</p>
                  )}
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="address"
                      value={editData.address}
                      onChange={handleInputChange}
                      placeholder="Cavite"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-800 py-2.5">{employee.address || "Not provided"}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
