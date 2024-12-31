import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useSelector, useDispatch } from 'react-redux';
import { checkAuth } from './redux/features/authSlice';

// Auth Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminLogin from "./pages/admin/AdminLogin";

// Admin Dashboard
import AdminDashboard from "./pages/admin/Dashboard";

// Doctor Management
import DoctorList from "./pages/admin/doctors/DoctorList";
import DoctorDashboard from "./pages/doctor/dashboard/Dashboard";
import DoctorPatientList from "./pages/doctor/patients/DoctorPatientList";
import DoctorPatientDetails from "./pages/doctor/patients/DoctorPatientDetails";
import DoctorMedicalRecords from "./pages/doctor/patients/DoctorMedicalRecords";
import DoctorTreatmentPlan from "./pages/doctor/patients/DoctorTreatmentPlan";
import DoctorPrescription from "./pages/doctor/prescriptions/DoctorPrescription";
import CalendarView from "./pages/doctor/appointments/CalendarView";
import AppointmentList from "./pages/doctor/appointments/AppointmentList";
import ScheduleManagement from "./pages/doctor/schedule/ScheduleManagement";
import PatientQueue from "./pages/doctor/queue/PatientQueue";
import FollowUpList from "./pages/doctor/followup/FollowUpList";
import CreatePrescription from "./pages/doctor/prescription/CreatePrescription";
import PrescriptionHistory from "./pages/doctor/prescription/PrescriptionHistory";
import MedicineDatabase from "./pages/doctor/medicine/MedicineDatabase";
// import PrescriptionDetails from "./pages/doctor/prescription/PrescriptionDetails";
import DigitalSignature from "./components/common/DigitalSignature";
import PatientHistory from './pages/doctor/patients/PatientHistory';
import DiagnosisRecords from './pages/doctor/patients/DiagnosisRecords';
import LabReports from './pages/doctor/patients/LabReports';
import TreatmentHistory from './pages/doctor/patients/TreatmentHistory';
import DoctorProfile from './pages/doctor/profile/DoctorProfile';
import ScheduleSettings from './pages/doctor/settings/ScheduleSettings';
import NotificationSettings from './pages/doctor/settings/NotificationSettings';
import AddDoctor from "./pages/admin/doctors/AddDoctor";
import Specialization from "./pages/admin/doctors/Specialization";
import DoctorSchedule from "./pages/admin/doctors/DoctorSchedule";
import EditDoctor from "./pages/admin/doctors/EditDoctor";
import DoctorDetails from "./pages/admin/doctors/DoctorDetails";

// Patient Dashboard
import PatientDashboard from "./pages/patient/Dashboard";
import PatientLayout from './components/patient/Layout';
import AppointmentBooking from './components/patient/AppointmentBooking';
import MyAppointments from './components/patient/MyAppointments';
import PrescriptionList from './components/patient/PrescriptionList';
import PrescriptionDetail from './components/patient/PrescriptionDetail';
import LabReportList from './components/patient/LabReportList';
import LabReportDetail from './components/patient/LabReportDetail';
import PatientProfile from './components/patient/PatientProfile';
import FindDoctor from './components/patient/FindDoctor';
import UpcomingAppointments from './components/patient/UpcomingAppointments';
import ActivePrescriptions from './components/patient/ActivePrescriptions';
import PendingReports from './components/patient/PendingReports';
import RecentPayments from './components/patient/RecentPayments';


// Patient Management
import PatientList from "./pages/admin/patients/PatientList";
import AddPatient from "./pages/admin/patients/AddPatient";
import EditPatient from "./pages/admin/patients/EditPatient";
import PatientDetails from "./pages/admin/patients/PatientDetails";
import PatientAppointment from "./pages/admin/patients/PatientAppointment";
import PatientBilling from "./pages/admin/patients/PatientBilling";
import AdminLabReports from "./pages/admin/patients/AdminLabReports";
import Documents from "./pages/admin/patients/Documents";
import MedicalRecords from "./pages/admin/patients/MedicalRecords";
import VisitHistory from "./pages/admin/patients/VisitHistory";
import Prescriptions from "./pages/admin/patients/Prescriptions";

// Appointment Management
import AllAppointments from "./pages/admin/appointments/AllAppointments";
import PendingAppointments from "./pages/admin/appointments/PendingAppointments";
import ConfirmedAppointments from "./pages/admin/appointments/ConfirmedAppointments";
import CancelledAppointments from "./pages/admin/appointments/CancelledAppointments";
import AppointmentCalendar from "./pages/admin/appointments/AppointmentCalendar";
import TimeSlots from "./pages/admin/appointments/TimeSlots";

// Admin Staff Management
import ReceptionistManagement from './pages/admin/staff/ReceptionistManagement';
import PharmacistManagement from './pages/admin/staff/PharmacistManagement';

// Staff Management Dashboard
import Dashboard from './pages/receptionist/Dashboard';
import ReceptionistLayout from './components/layout/ReceptionistLayout';
import PatientRegistration from './pages/receptionist/PatientRegistration';
import BookAppointment from './pages/receptionist/BookAppointment';
import CheckInPatient from './pages/receptionist/CheckInPatient';
import QueueManagement from './pages/receptionist/QueueManagement';
import EmergencyRegistration from './pages/receptionist/EmergencyRegistration';
import SearchPatient from './pages/receptionist/SearchPatient';
import PatientDetail from './pages/receptionist/PatientDetail';
import UpdatePatient from './pages/receptionist/UpdatePatient';
import ReceptionistPatientHistory from './pages/receptionist/PatientHistory';
import PrintPatientCard from './pages/receptionist/PrintPatientCard';
import TodayAppointments from './pages/receptionist/appointments/TodayAppointments';
import ScheduleAppointment from './pages/receptionist/appointments/ScheduleAppointment';
import RescheduleCancel from './pages/receptionist/appointments/RescheduleCancel';
import SendReminders from './pages/receptionist/appointments/SendReminders';
import ReceptionistDoctorSchedules from './pages/receptionist/appointments/DoctorSchedules';
import CurrentStatus from './pages/receptionist/queue/CurrentStatus';
import AddToQueue from './pages/receptionist/queue/AddToQueue';
import UpdatePosition from './pages/receptionist/queue/UpdatePosition';
import WaitTimes from './pages/receptionist/queue/WaitTimes';
import CallPatient from './pages/receptionist/queue/CallNextPatient';
import GenerateBill from './pages/receptionist/billing/GenerateBill';
import ProcessPayment from './pages/receptionist/billing/ProcessPayment';
import ReceptionistPaymentHistory from './pages/receptionist/billing/PaymentHistory';
import HandleRefund from './pages/receptionist/billing/HandleRefunds';
import DailyPatientCount from './pages/receptionist/reports/DailyPatientCount';
import AppointmentStats from './pages/receptionist/reports/AppointmentStats';
import RevenueReports from './pages/receptionist/reports/RevenueReports';
import QueueAnalytics from './pages/receptionist/reports/QueueAnalytics';
import DoctorStats from './pages/receptionist/reports/DoctorReports';
import SMSEmailReminders from './pages/receptionist/communication/SMSEmailReminders';
import ScanAndUpload from './pages/receptionist/documents/ScanAndUpload';
import ReceptionistGenerateReports from './pages/receptionist/documents/GenerateReports';
import ReceptionistFileManagement from './pages/receptionist/documents/FileManagement';


// Pharmacy Dashboard
import PharmacyDashboard from './pages/pharmacy/Dashboard';
import Medicines from './pages/pharmacy/Medicines';
import PharmacySales from './pages/pharmacy/Sales';
import PharmacyInventory from './pages/pharmacy/Inventory';
import PharmacyReports from './pages/pharmacy/Reports';
import PharmacyProfile from './pages/pharmacy/Profile';
import PharmacySettings from './pages/pharmacy/Settings';
import AddMedicineForm from './components/pharmacy/AddMedicineForm';
import NewSaleForm from './components/pharmacy/NewSaleForm';
import LowStockList from './components/pharmacy/LowStockList';

// Billing/Invoices
import CreateInvoice from './pages/admin/billing/CreateInvoice';
import PaymentHistory from './pages/admin/billing/PaymentHistory';
import DuePayments from './pages/admin/billing/DuePayments';
import GenerateReports from './pages/admin/billing/GenerateReports';
import PrintInvoice from './pages/admin/billing/PrintInvoice';

// Pharmacy
import MedicineInventory from './pages/admin/pharmacy/MedicineInventory';
import StockManagement from './pages/admin/pharmacy/StockManagement';
import MedicineSales from './pages/admin/pharmacy/MedicineSales';
import PurchaseOrders from './pages/admin/pharmacy/PurchaseOrders';
import ExpiryTracking from './pages/admin/pharmacy/ExpiryTracking';
import LowStockAlert from './pages/admin/pharmacy/LowStockAlert';
import PharmacyLayout from './components/pharmacy/Layout';

// Communication
import SMSNotifications from './pages/admin/communication/SMSNotifications';
import EmailReminders from './pages/admin/communication/EmailReminders';
import PatientFeedback from './pages/admin/communication/PatientFeedback';
import InternalMessaging from './pages/admin/communication/InternalMessaging';

// Setting
import ClinicDetails from './pages/admin/settings/ClinicDetails';
import UserManagement from './pages/admin/settings/UserManagement';
import RolesPermissions from './pages/admin/settings/RolesPermissions';
import BackupRestore from './pages/admin/settings/BackupRestore';

//AdminProfile
import AdminProfile from './pages/admin/profile/AdminProfile';
import AdminProfileSettings from './pages/admin/profile/ProfileSettings';
import SystemLogs from './pages/admin/settings/SystemLogs';


// Components
import ProtectedRoute from "./components/common/ProtectedRoute";
import NotFound from "./pages/NotFound";

const App = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Protected Admin Routes */}
        {/* <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} /> */}
          
          {/* Doctor Routes */}
          {/* <Route path="/admin/doctors/list" element={<DoctorList />} /> */}
        <Route element={<ProtectedRoute allowedRoles={['doctor']} />}>  
          <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
          <Route path="/doctor/patients" element={<DoctorPatientList />} />
          <Route path="/doctor/patient-details/:id" element={<DoctorPatientDetails />} />
          <Route path="/doctor/patients/records" element={<DoctorMedicalRecords />} />
          <Route path="/doctor/patients/treatments" element={<DoctorTreatmentPlan />} />
          <Route path="/doctor/prescriptions" element={<DoctorPrescription />} />
          <Route path="/doctor/appointments/calendar" element={<CalendarView />} />
          <Route path="/doctor/appointments/list" element={<AppointmentList />} />
          <Route path="/doctor/appointments/schedule" element={<ScheduleManagement />} />
          <Route path="/doctor/appointments/queue" element={<PatientQueue />} />
          <Route path="/doctor/appointments/followups" element={<FollowUpList />} />
          <Route path="/doctor/prescriptions/create" element={<CreatePrescription />} />
          <Route path="/doctor/prescriptions/history" element={<PrescriptionHistory />} />
          <Route path="/doctor/prescriptions/medicines" element={<MedicineDatabase />} />
          <Route path="/common/digital-signature" element={<DigitalSignature />} />
          <Route path="/doctor/patients/history" element={<PatientHistory />} />
          <Route path="/doctor/records/diagnosis" element={<DiagnosisRecords />} />
          <Route path="/doctor/records/treatments" element={<TreatmentHistory />} />
          <Route path="/doctor/records/lab" element={<LabReports />} />
          <Route path="/doctor/profile" element={<DoctorProfile />} />
          <Route path="/doctor/settings/schedule" element={<ScheduleSettings />} />
          <Route path="/doctor/settings/notifications" element={<NotificationSettings />} />
        </Route>

        {/* Patient Protected Routes */}
        <Route element={<ProtectedRoute allowedRoles={['patient']} />}>
          <Route path="/patient" element={<PatientLayout />}>
            <Route index element={<Navigate to="dashboard" />} />
            <Route path="dashboard" element={<PatientDashboard />} />
            <Route path="book-appointment" element={<AppointmentBooking />} />
            <Route path="my-appointments" element={<MyAppointments />} />
            <Route path="view-prescriptions" element={<PrescriptionList />} />
            <Route path="prescriptions" element={<PrescriptionDetail />} />
            <Route path="lab-reports-list" element={<LabReportList />} />
            <Route path="lab-reports-detail" element={<LabReportDetail />} />
            <Route path="profile" element={<PatientProfile />} />
            <Route path="find-doctors" element={<FindDoctor />} />
            <Route path="upcoming-appointments" element={<UpcomingAppointments />} />
            <Route path="active-prescriptions" element={<ActivePrescriptions />} />
            <Route path="pending-reports" element={<PendingReports />} />
            <Route path="recent-payments" element={<RecentPayments />} />
            <Route path="payment-history" element={<PaymentHistory />} />
          </Route>
        </Route>

        {/* Pharmacy Protected Routes */}
        <Route element={<ProtectedRoute allowedRoles={['pharmacist']} />}>
          <Route path="/pharmacy/dashboard" element={<PharmacyDashboard />} />
          <Route path="/pharmacy/medicines" element={<Medicines />} />
          <Route path="/pharmacy/sales" element={<PharmacySales />} />
          <Route path="/pharmacy/inventory" element={<PharmacyInventory />} />
          <Route path="/pharmacy/reports" element={<PharmacyReports />} />
          <Route path="/pharmacy/profile" element={<PharmacyProfile />} />
          <Route path="/pharmacy/settings" element={<PharmacySettings />} />
          <Route path="/pharmacy/add-medicine" element={<AddMedicineForm />} />
          <Route path="/pharmacy/sales/new" element={<NewSaleForm />} />
          <Route path="/pharmacy/low-stock" element={<LowStockList />} />
        </Route>

        {/* Staff/Receptionist Protected Routes */}
        <Route element={<ProtectedRoute allowedRoles={['staff']} />}>
          <Route path="/receptionist" element={<ReceptionistLayout />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="register-patient" element={<PatientRegistration />} />
            <Route path="book-appointment" element={<BookAppointment />} />
            <Route path="check-in" element={<CheckInPatient />} />
            <Route path="queue" element={<QueueManagement />} />
            <Route path="emergency" element={<EmergencyRegistration />} />
            <Route path="search-patients" element={<SearchPatient />} />
            <Route path="patient-details" element={<PatientDetail/>} />
            <Route path="update-patient" element={<UpdatePatient />} />
            <Route path="patient-history" element={<ReceptionistPatientHistory />} />
            <Route path="print-cards" element={<PrintPatientCard />} />
            <Route path="today-appointments" element={<TodayAppointments />} />
            <Route path="schedule-appointment" element={<ScheduleAppointment />} />
            <Route path="reschedule-cancel" element={<RescheduleCancel />} />
            <Route path="send-reminders" element={<SendReminders />} />
            <Route path="doctor-schedules" element={<ReceptionistDoctorSchedules />} />
            <Route path="current-queue" element={<CurrentStatus />} />
            <Route path="add-to-queue" element={<AddToQueue />} />
            <Route path="update-queue" element={<UpdatePosition />} />
            <Route path="wait-times" element={<WaitTimes />} />
            <Route path="call-next" element={<CallPatient />} />
            <Route path="generate-bill" element={<GenerateBill />} />
            <Route path="process-payment" element={<ProcessPayment />} />
            <Route path="payment-history" element={<ReceptionistPaymentHistory />} />
            <Route path="refunds" element={<HandleRefund />} />
            <Route path="patient-count" element={<DailyPatientCount />} />
            <Route path="appointment-stats" element={<AppointmentStats />} />
            <Route path="revenue-reports" element={<RevenueReports />} />
            <Route path="queue-analytics" element={<QueueAnalytics />} />
            <Route path="doctor-reports" element={<DoctorStats />} />
            <Route path="sms-email-reminders" element={<SMSEmailReminders />} />
            <Route path="scan-upload" element={<ScanAndUpload />} />
            <Route path="generate-reports" element={<ReceptionistGenerateReports />} />
            <Route path="file-management" element={<ReceptionistFileManagement />} />
          </Route>
        </Route>

        {/* Separate Admin Login Route */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Admin Protected Routes */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/doctors/list" element={<DoctorList />} />
          <Route path="/admin/doctors/add" element={<AddDoctor />} />
          <Route path="/admin/doctors/edit/:id" element={<EditDoctor />} />
          <Route path="/admin/doctors/details/:id" element={<DoctorDetails />} />
          <Route path="/admin/doctors/specializations" element={<Specialization />} />
          <Route path="/admin/doctors/schedules" element={<DoctorSchedule />} />
          <Route path="/admin/patients/list" element={<PatientList />} />
          <Route path="/admin/patients/add" element={<AddPatient />} />
          <Route path="/admin/patients/edit/:id" element={<EditPatient />} />
          <Route path="/admin/patients/details/:id" element={<PatientDetails />} />
          <Route path="/admin/patients/appointments" element={<PatientAppointment />} />
          <Route path="/admin/patients/billing" element={<PatientBilling />} />
          <Route path="/admin/patients/lab-reports" element={<AdminLabReports />} />
          <Route path="/admin/patients/documents" element={<Documents />} />
          <Route path="/admin/patients/records" element={<MedicalRecords />} />
          <Route path="/admin/patients/history" element={<VisitHistory />} />
          <Route path="/admin/patients/prescriptions" element={<Prescriptions />} />
          <Route path="/admin/appointments/all" element={<AllAppointments />} />
          <Route path="/admin/appointments/pending" element={<PendingAppointments />} />
          <Route path="/admin/appointments/confirmed" element={<ConfirmedAppointments />} />
          <Route path="/admin/appointments/cancelled" element={<CancelledAppointments />} />
          <Route path="/admin/appointments/calendar" element={<AppointmentCalendar />} />
          <Route path="/admin/appointments/slots" element={<TimeSlots />} />
          <Route path="/admin/staff/receptionist" element={<ReceptionistManagement />} />
          <Route path="/admin/staff/pharmacist" element={<PharmacistManagement />} />
          <Route path="/admin/billing/create" element={<CreateInvoice />} />
          <Route path="/admin/billing/history" element={<PaymentHistory />} />
          <Route path="/admin/billing/due" element={<DuePayments />} />
          <Route path="/admin/billing/reports" element={<GenerateReports />} />
          <Route path="/admin/billing/print" element={<PrintInvoice />} />
          <Route path="/admin/pharmacy/inventory" element={<MedicineInventory />} />
          <Route path="/admin/pharmacy/stock" element={<StockManagement />} />
          <Route path="/admin/pharmacy/sales" element={<MedicineSales />} />
          <Route path="/admin/pharmacy/orders" element={<PurchaseOrders />} />
          <Route path="/admin/pharmacy/expiry" element={<ExpiryTracking />} />
          <Route path="/admin/pharmacy/alerts" element={<LowStockAlert />} />
          <Route path="/admin/communication/sms" element={<SMSNotifications />} />
          <Route path="/admin/communication/email" element={<EmailReminders />} />
          <Route path="/admin/communication/feedback" element={<PatientFeedback />} />
          <Route path="/admin/communication/messaging" element={<InternalMessaging />} />
          <Route path="/admin/settings/clinic" element={<ClinicDetails />} />
          <Route path="/admin/settings/users" element={<UserManagement />} />
          <Route path="/admin/settings/roles" element={<RolesPermissions />} />
          <Route path="/admin/settings/backup" element={<BackupRestore />} />
          <Route path="/admin/profile" element={<AdminProfile />} />
          <Route path="/admin/profile/profilesettings" element={<AdminProfileSettings />} />
          <Route path="/admin/settings/logs" element={<SystemLogs />} />
        </Route>

        {/* Common Protected Route */}
        <Route element={<ProtectedRoute allowedRoles={['doctor', 'admin']} />}>
          <Route path="/common/digital-signature" element={<DigitalSignature />} />
        </Route>

        {/* Error Routes */}
        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/404" />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;