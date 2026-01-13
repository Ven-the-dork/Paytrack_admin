// src/features/leave/components/LeaveHistoryPanel.jsx
import { useState, useEffect, useRef } from "react";
import { Calendar, Paperclip, ChevronDown, CheckCircle, XCircle, DollarSign, Ban, Edit } from "lucide-react";

function ActionDropdown({ application, onApprove, onReject, onEditStatus, attachmentUrl, status }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label="Actions"
      >
        <ChevronDown className={`w-5 h-5 text-gray-600 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20 min-w-[180px]">
          {/* PENDING: Show Approve/Reject */}
          {status === "pending" && (
            <>
              <button
                onClick={() => {
                  onApprove();
                  setOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-green-600 hover:bg-green-50 flex items-center gap-2 transition-colors"
              >
                <CheckCircle size={16} />
                Approve
              </button>
              <button
                onClick={() => {
                  onReject();
                  setOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
              >
                <XCircle size={16} />
                Reject
              </button>
            </>
          )}

          {/* APPROVED: Show Change to Rejected */}
          {status === "approved" && (
            <button
              onClick={() => {
                onEditStatus("rejected");
                setOpen(false);
              }}
              className="w-full text-left px-4 py-2 text-sm text-orange-600 hover:bg-orange-50 flex items-center gap-2 transition-colors"
            >
              <Edit size={16} />
              Change to Rejected
            </button>
          )}

          {/* REJECTED: Show Change to Approved */}
          {status === "rejected" && (
            <button
              onClick={() => {
                onEditStatus("approved");
                setOpen(false);
              }}
              className="w-full text-left px-4 py-2 text-sm text-green-600 hover:bg-green-50 flex items-center gap-2 transition-colors"
            >
              <Edit size={16} />
              Change to Approved
            </button>
          )}

          {/* Divider before attachment */}
          {attachmentUrl && (status === "approved" || status === "rejected" || status === "pending") && (
            <div className="border-t border-gray-200 my-1" />
          )}

          {/* Show attachment for all statuses if exists */}
          {attachmentUrl && (
            <a
              href={attachmentUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 flex items-center gap-2 transition-colors"
            >
              <Paperclip size={16} />
              View Attachment
            </a>
          )}
        </div>
      )}
    </div>
  );
}

export default function LeaveHistoryPanel({ applications, loading, onApprove, onReject, onEditStatus }) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <p className="text-center text-gray-500">Loading leave applications...</p>
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="text-center">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No Leave Applications</p>
          <p className="text-sm text-gray-400 mt-1">
            Leave applications will appear here once employees submit them.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <Calendar className="text-green-600" size={20} />
          Leave Applications
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          Review and manage employee leave requests
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                Employee
              </th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                Dates
              </th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                Type & Reason
              </th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                Status
              </th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {applications.map((app) => (
              <tr key={app.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                {/* Employee */}
                <td className="py-3 px-4">
                  <div>
                    <p className="font-medium text-gray-800">
                      {app.employees?.full_name || "Unknown"}
                    </p>
                    <p className="text-sm text-gray-500">
                      {app.employees?.department}
                    </p>
                  </div>
                </td>

                {/* Dates */}
                <td className="py-3 px-4 text-sm text-gray-600">
                  <div>
                    <p>{new Date(app.start_date).toLocaleDateString()}</p>
                    <p className="text-gray-400">to</p>
                    <p>{new Date(app.end_date).toLocaleDateString()}</p>
                  </div>
                </td>

                {/* Type & Reason with Paid/Unpaid Badge */}
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-gray-800">
                      {app.leave_plans?.name}
                    </p>
                    {/* Paid/Unpaid Badge */}
                    {app.leave_plans?.is_paid ? (
                      <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-semibold">
                        <DollarSign size={10} />
                        Paid
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full text-xs font-semibold">
                        <Ban size={10} />
                        Unpaid
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 line-clamp-2">{app.reason}</p>
                </td>

                {/* Status */}
                <td className="py-3 px-4">
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                      app.status === "approved"
                        ? "bg-green-100 text-green-700"
                        : app.status === "rejected"
                        ? "bg-red-100 text-red-700"
                        : app.status === "pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {app.status === "approved" && <CheckCircle size={12} />}
                    {app.status === "rejected" && <XCircle size={12} />}
                    {app.status.toUpperCase()}
                  </span>
                </td>

                {/* Actions */}
                <td className="py-3 px-4">
                  <ActionDropdown
                    application={app}
                    onApprove={() => onApprove(app)}
                    onReject={() => onReject(app)}
                    onEditStatus={(newStatus) => onEditStatus(app, newStatus)}
                    attachmentUrl={app.attachment_url}
                    status={app.status}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
