// src/features/leave/components/EditStatusModal.jsx
import { X, AlertTriangle } from "lucide-react";

export default function EditStatusModal({
  isOpen,
  employeeName,
  leaveType,
  currentStatus,
  newStatus,
  onConfirm,
  onCancel,
  isUpdating,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative animate-fade-in">
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          disabled={isUpdating}
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
            <AlertTriangle className="text-orange-600" size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">Change Leave Status</h3>
            <p className="text-sm text-gray-500">This action will update the status</p>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Employee:</span>
            <span className="font-medium text-gray-800">{employeeName}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Leave Type:</span>
            <span className="font-medium text-gray-800">{leaveType}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Current Status:</span>
            <span className={`font-semibold ${
              currentStatus === "approved" ? "text-green-600" : "text-red-600"
            }`}>
              {currentStatus.toUpperCase()}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">New Status:</span>
            <span className={`font-semibold ${
              newStatus === "approved" ? "text-green-600" : "text-red-600"
            }`}>
              {newStatus.toUpperCase()}
            </span>
          </div>
        </div>

        <p className="text-sm text-gray-600 mb-6">
          Are you sure you want to change this leave status? The employee will be notified of this change.
        </p>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isUpdating}
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isUpdating}
            className="flex-1 px-4 py-2.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isUpdating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Updating...
              </>
            ) : (
              "Confirm Change"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
