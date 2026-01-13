// src/features/leave/pages/LeaveManagement.jsx
import { useState, useEffect } from "react";
import { Menu, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../../firebaseConfig";

import AdminBell from "../../../components/AdminBell";
import AdminSidebar from "../components/Leavedashvar";
import FontSizeMenu from "../../../components/hooks/FontSizeMenu";
import AdminSetting from "../../../components/Adminsetting";
import DeletePlanModal from "../components/DeletePlanModal";
import SuccessToast from "../components/SuccessToast";
import ApproveLeaveModal from "../components/ApproveLeaveModal";
import RejectLeaveModal from "../components/RejectLeaveModal";
import EditStatusModal from "../components/EditStatusModal"; // ✅ NEW IMPORT

import {
  fetchLeavePlans,
  fetchAdminLeaveApplications,
  createLeavePlan,
  updateLeavePlan,
  softDeleteLeavePlan,
  updateLeaveStatus,
  getLeaveApplicationForNotification,
  insertNotification,
} from "../../../services/leaveService";

import LeaveHistoryPanel from "../components/LeaveHistoryPanel";
import LeaveSettingsPanel from "../components/LeaveSettingsPanel";

export default function LeaveManagement() {
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("history");
  const [currentUser, setCurrentUser] = useState(null);

  const [leaveApplications, setLeaveApplications] = useState([]);
  const [loadingApplications, setLoadingApplications] = useState(true);

  const [leavePlans, setLeavePlans] = useState([]);

  // Create form
  const [leavePlanName, setLeavePlanName] = useState("");
  const [durationDays, setDurationDays] = useState("");
  const [isPaid, setIsPaid] = useState("");

  // Edit plan
  const [editingPlan, setEditingPlan] = useState(null);
  const [editName, setEditName] = useState("");
  const [editDuration, setEditDuration] = useState("");
  const [editIsPaid, setEditIsPaid] = useState("");
  const [openDropdown, setOpenDropdown] = useState(null);

  // Delete Pop up modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [planToDelete, setPlanToDelete] = useState(null);
  const [isDeletingPlan, setIsDeletingPlan] = useState(false);

  // Success popup modal
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Approve/Reject modals
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [isApprovingLeave, setIsApprovingLeave] = useState(false);
  const [isRejectingLeave, setIsRejectingLeave] = useState(false);

  // ✅ NEW: Edit Status modal
  const [showEditStatusModal, setShowEditStatusModal] = useState(false);
  const [editStatusApplication, setEditStatusApplication] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [isEditingStatus, setIsEditingStatus] = useState(false);

  const handleLogout = async () => {
    await signOut(auth);
    sessionStorage.removeItem("user");
    navigate("/", { replace: true });
  };

  const createLeaveNotification = async ({
    employeeId,
    leaveApplicationId,
    type,
    title,
    message,
  }) => {
    if (!employeeId || !leaveApplicationId) return;
    try {
      await insertNotification({
        employee_id: employeeId,
        leave_application_id: leaveApplicationId,
        type,
        title,
        message,
      });
    } catch (error) {
      console.error("Failed to create notification:", error);
    }
  };

  // Load current user from session
  useEffect(() => {
    const stored = sessionStorage.getItem("user");
    if (stored) {
      try {
        setCurrentUser(JSON.parse(stored));
      } catch {
        setCurrentUser(null);
      }
    }
  }, []);

  // Fetch leave plans
  useEffect(() => {
    async function loadPlans() {
      try {
        const plans = await fetchLeavePlans();
        setLeavePlans(plans);
      } catch (error) {
        console.error(error);
      }
    }
    loadPlans();
  }, []);

  // Fetch applications
  useEffect(() => {
    async function loadApplications() {
      setLoadingApplications(true);
      try {
        const apps = await fetchAdminLeaveApplications();
        setLeaveApplications(apps);
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingApplications(false);
      }
    }
    loadApplications();
  }, []);

  async function handleCreateLeaveSetting(e) {
    e.preventDefault();
    if (!leavePlanName || !durationDays || !isPaid) {
      alert("Please fill in all fields including Paid Leave option");
      return;
    }

    const payload = {
      name: leavePlanName,
      duration_days: Number(durationDays),
      is_active: true,
      allow_recall: false, // Default false since recall removed
      is_paid: isPaid === "Yes",
    };

    try {
      const data = await createLeavePlan(payload);
      setLeavePlans((prev) => [...prev, data]);

      setSuccessMessage(`Leave plan "${leavePlanName}" created successfully!`);
      setShowSuccessToast(true);

      // Clear form
      setLeavePlanName("");
      setDurationDays("");
      setIsPaid("");
    } catch (error) {
      console.error(error);
      alert("Failed to create leave plan");
    }
  }

  function handleApproveLeaveClick(application) {
    setSelectedApplication(application);
    setShowApproveModal(true);
  }

  async function confirmApproveLeave() {
    if (!selectedApplication) return;

    setIsApprovingLeave(true);
    try {
      const applicationId = selectedApplication.id;

      if (!applicationId) {
        throw new Error("Application ID is missing");
      }

      const appRow = await getLeaveApplicationForNotification(applicationId);

      await updateLeaveStatus(applicationId, {
        status: "approved",
        reviewed_at: new Date().toISOString(),
        reviewed_by: currentUser?.uid,
      });

      await createLeaveNotification({
        employeeId: appRow.employee_id,
        leaveApplicationId: appRow.id,
        type: "leave_approved",
        title: "Leave approved",
        message: `Your ${appRow.leave_plans?.name || "leave"} request was approved.`,
      });

      setLeaveApplications((prev) =>
        prev.map((app) =>
          app.id === applicationId ? { ...app, status: "approved" } : app
        )
      );

      setShowApproveModal(false);
      setSelectedApplication(null);

      setSuccessMessage("Leave application approved successfully!");
      setShowSuccessToast(true);
    } catch (error) {
      console.error("Error approving leave:", error);
      alert(`Failed to approve leave application: ${error.message}`);
    } finally {
      setIsApprovingLeave(false);
    }
  }

  function handleRejectLeaveClick(application) {
    setSelectedApplication(application);
    setShowRejectModal(true);
  }

  async function confirmRejectLeave() {
    if (!selectedApplication) return;

    setIsRejectingLeave(true);
    try {
      const applicationId = selectedApplication.id;

      if (!applicationId) {
        throw new Error("Application ID is missing");
      }

      const appRow = await getLeaveApplicationForNotification(applicationId);

      await updateLeaveStatus(applicationId, {
        status: "rejected",
        reviewed_at: new Date().toISOString(),
        reviewed_by: currentUser?.uid,
      });

      await createLeaveNotification({
        employeeId: appRow.employee_id,
        leaveApplicationId: appRow.id,
        type: "leave_declined",
        title: "Leave declined",
        message: `Your ${appRow.leave_plans?.name || "leave"} request was declined.`,
      });

      setLeaveApplications((prev) =>
        prev.map((app) =>
          app.id === applicationId ? { ...app, status: "rejected" } : app
        )
      );

      setShowRejectModal(false);
      setSelectedApplication(null);

      setSuccessMessage("Leave application rejected successfully!");
      setShowSuccessToast(true);
    } catch (error) {
      console.error("Error rejecting leave:", error);
      alert(`Failed to reject leave application: ${error.message}`);
    } finally {
      setIsRejectingLeave(false);
    }
  }

  // ✅ NEW: Edit Status Handler
  function handleEditStatusClick(application, targetStatus) {
    setEditStatusApplication(application);
    setNewStatus(targetStatus);
    setShowEditStatusModal(true);
  }

  // ✅ NEW: Confirm Edit Status
  async function confirmEditStatus() {
    if (!editStatusApplication || !newStatus) return;

    setIsEditingStatus(true);
    try {
      const applicationId = editStatusApplication.id;

      if (!applicationId) {
        throw new Error("Application ID is missing");
      }

      const appRow = await getLeaveApplicationForNotification(applicationId);

      await updateLeaveStatus(applicationId, {
        status: newStatus,
        reviewed_at: new Date().toISOString(),
        reviewed_by: currentUser?.uid,
      });

      const notificationType = newStatus === "approved" ? "leave_approved" : "leave_declined";
      const notificationTitle = newStatus === "approved" ? "Leave approved" : "Leave declined";
      const notificationMessage = `Your ${appRow.leave_plans?.name || "leave"} status was changed to ${newStatus}.`;

      await createLeaveNotification({
        employeeId: appRow.employee_id,
        leaveApplicationId: appRow.id,
        type: notificationType,
        title: notificationTitle,
        message: notificationMessage,
      });

      setLeaveApplications((prev) =>
        prev.map((app) =>
          app.id === applicationId ? { ...app, status: newStatus } : app
        )
      );

      setShowEditStatusModal(false);
      setEditStatusApplication(null);
      setNewStatus("");

      setSuccessMessage(`Leave status changed to ${newStatus} successfully!`);
      setShowSuccessToast(true);
    } catch (error) {
      console.error("Error editing leave status:", error);
      alert(`Failed to edit leave status: ${error.message}`);
    } finally {
      setIsEditingStatus(false);
    }
  }

  function handleStartEdit(plan) {
    setEditingPlan(plan);
    setEditName(plan.name);
    setEditDuration(plan.duration_days);
    setEditIsPaid(plan.is_paid ? "Yes" : "No");
    setOpenDropdown(null);
  }

  async function handleSaveEdit(e) {
    e.preventDefault();
    try {
      await updateLeavePlan(editingPlan.id, {
        name: editName,
        duration_days: Number(editDuration),
        allow_recall: false, // Keep as false
        is_paid: editIsPaid === "Yes",
      });

      setLeavePlans((prev) =>
        prev.map((p) =>
          p.id === editingPlan.id
            ? {
                ...p,
                name: editName,
                duration_days: Number(editDuration),
                is_paid: editIsPaid === "Yes",
              }
            : p
        )
      );
      setEditingPlan(null);
      setSuccessMessage("Leave plan updated successfully!");
      setShowSuccessToast(true);
    } catch (error) {
      console.error(error);
      alert("Failed to update leave plan");
    }
  }

  function handleDeleteLeavePlan(plan) {
    setPlanToDelete(plan);
    setShowDeleteModal(true);
    setOpenDropdown(null);
  }

  async function confirmDeletePlan() {
    if (!planToDelete) return;

    setIsDeletingPlan(true);
    try {
      await softDeleteLeavePlan(planToDelete.id);
      setLeavePlans((prev) => prev.filter((p) => p.id !== planToDelete.id));
      setShowDeleteModal(false);
      setPlanToDelete(null);

      setSuccessMessage(`Leave plan "${planToDelete.name}" deleted successfully!`);
      setShowSuccessToast(true);
    } catch (error) {
      console.error(error);
      alert("Failed to delete leave plan");
    } finally {
      setIsDeletingPlan(false);
    }
  }

  function cancelDeletePlan() {
    setShowDeleteModal(false);
    setPlanToDelete(null);
  }

  const currentTime = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="min-h-screen flex bg-gray-50 font-sans text-gray-800">
      {/* Sidebar */}
      <AdminSidebar
        isOpen={isOpen}
        currentUser={currentUser}
        onLogout={handleLogout}
        onNavigate={(path) => navigate(path)}
      />

      <main className={`flex-1 flex flex-col transition-all duration-300 ${isOpen ? "lg:ml-0" : ""}`}>
        {/* Header */}
        <header className="bg-white border-b border-gray-100 px-6 py-4 sticky top-0 z-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsOpen((s) => !s)}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
            >
              <Menu size={24} />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-800 tracking-tight">
                Leave Management
              </h1>
              <p className="text-xs text-gray-500 hidden sm:block">
                Manage employee time-off and policies
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden md:block text-xs text-gray-400 font-medium">
              Last updated: {currentTime}
            </span>
            <div className="h-6 w-px bg-gray-200 mx-2 hidden md:block" />
            <AdminBell />
            <AdminSetting
              trigger={
                <button className="w-10 h-10 rounded-full bg-yellow-50 text-yellow-600 hover:bg-yellow-100 border border-yellow-200 flex items-center justify-center">
                  <Settings size={20} />
                </button>
              }
            >
              {({ close }) => <FontSizeMenu closeMenu={close} />}
            </AdminSetting>
          </div>
        </header>

        <div className="p-6 md:p-8 max-w-7xl mx-auto w-full space-y-6">
          {/* Tabs */}
          <div className="flex justify-center mb-2">
            <div className="bg-white p-1 rounded-xl border border-gray-200 shadow-sm inline-flex">
              {["history", "settings"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-2.5 rounded-lg cursor-pointer text-sm font-bold transition-all ${
                    activeTab === tab
                      ? "bg-green-700 text-white shadow-md"
                      : "text-gray-500 hover:bg-gray-50 hover:text-green-700"
                  }`}
                >
                  {tab === "history" ? "Leave History" : "Settings"}
                </button>
              ))}
            </div>
          </div>

          {/* History */}
          {activeTab === "history" && (
            <LeaveHistoryPanel
              applications={leaveApplications}
              loading={loadingApplications}
              onApprove={handleApproveLeaveClick}
              onReject={handleRejectLeaveClick}
              onEditStatus={handleEditStatusClick} // ✅ NEW PROP
            />
          )}

          {/* Settings */}
          {activeTab === "settings" && (
            <LeaveSettingsPanel
              leavePlans={leavePlans}
              leavePlanName={leavePlanName}
              durationDays={durationDays}
              isPaid={isPaid}
              editingPlan={editingPlan}
              editName={editName}
              editDuration={editDuration}
              editIsPaid={editIsPaid}
              openDropdown={openDropdown}
              onChangeLeavePlanName={setLeavePlanName}
              onChangeDurationDays={setDurationDays}
              onChangeIsPaid={setIsPaid}
              onCreate={handleCreateLeaveSetting}
              onStartEdit={handleStartEdit}
              onSaveEdit={handleSaveEdit}
              onCancelEdit={() => setEditingPlan(null)}
              onChangeEditName={setEditName}
              onChangeEditDuration={setEditDuration}
              onChangeEditIsPaid={setEditIsPaid}
              onDeletePlan={handleDeleteLeavePlan}
              setOpenDropdown={setOpenDropdown}
            />
          )}
        </div>

        {/* Delete Confirmation Modal */}
        <DeletePlanModal
          isOpen={showDeleteModal}
          planName={planToDelete?.name || ""}
          onConfirm={confirmDeletePlan}
          onCancel={cancelDeletePlan}
          isDeleting={isDeletingPlan}
        />

        {/* Approve Modal */}
        <ApproveLeaveModal
          isOpen={showApproveModal}
          employeeName={selectedApplication?.employees?.full_name || "Employee"}
          leaveType={selectedApplication?.leave_plans?.name || "Leave"}
          onConfirm={confirmApproveLeave}
          onCancel={() => setShowApproveModal(false)}
          isApproving={isApprovingLeave}
        />

        {/* Reject Modal */}
        <RejectLeaveModal
          isOpen={showRejectModal}
          employeeName={selectedApplication?.employees?.full_name || "Employee"}
          leaveType={selectedApplication?.leave_plans?.name || "Leave"}
          onConfirm={confirmRejectLeave}
          onCancel={() => setShowRejectModal(false)}
          isRejecting={isRejectingLeave}
        />

        {/* ✅ NEW: Edit Status Modal */}
        <EditStatusModal
          isOpen={showEditStatusModal}
          employeeName={editStatusApplication?.employees?.full_name || "Employee"}
          leaveType={editStatusApplication?.leave_plans?.name || "Leave"}
          currentStatus={editStatusApplication?.status || ""}
          newStatus={newStatus}
          onConfirm={confirmEditStatus}
          onCancel={() => setShowEditStatusModal(false)}
          isUpdating={isEditingStatus}
        />

        {/* Success Toast */}
        <SuccessToast
          isOpen={showSuccessToast}
          message={successMessage}
          onClose={() => setShowSuccessToast(false)}
        />
      </main>
    </div>
  );
}
