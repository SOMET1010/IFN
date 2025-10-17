import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import { OrderProvider } from "./contexts/OrderContext";
import { ReviewProvider } from "./contexts/ReviewContext";
import { UserPreferencesProvider } from "./contexts/UserPreferencesContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import OfflineIndicator from "./components/common/OfflineIndicator";
import { scheduleLocalBackups } from "./services/system/backupService";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { Login } from "./pages/Login";
import Welcome from "./pages/Welcome";
import LandingPage from "./pages/LandingPage";
import WelcomeAlt from "./pages/WelcomeAlt";
import { Dashboard } from "./pages/Dashboard";
import ProducerDashboard from "./pages/producer/ProducerDashboard";
import ProducerOffers from "./pages/producer/ProducerOffers";
import ProducerHarvests from "./pages/producer/ProducerHarvests";
import ProducerSales from "./pages/producer/ProducerSales";
import ProducerRevenue from "./pages/producer/ProducerRevenue";
import PriceManagementPage from "./pages/producer/PriceManagementPage";
import ProductionManagementPage from "./pages/producer/ProductionManagementPage";
import VocalInterfacePage from "./pages/producer/VocalInterfacePage";
import OrderManagementPage from "./pages/producer/OrderManagementPage";
import MerchantDashboard from "./pages/merchant/MerchantDashboard";
import MerchantSales from "./pages/merchant/MerchantSales";
import MerchantInventory from "./pages/merchant/MerchantInventory";
import MerchantOrders from "./pages/merchant/MerchantOrders";
import MerchantPayments from "./pages/merchant/MerchantPayments";
import MerchantReceiving from "./pages/merchant/MerchantReceiving";
import MerchantSocial from "./pages/merchant/MerchantSocial";
import MerchantSourcing from "./pages/merchant/MerchantSourcing";
import MerchantCredits from "./pages/merchant/MerchantCredits";
import MerchantSalesWorkflow from "./pages/merchant/MerchantSalesWorkflow";
import MerchantNeeds from "./pages/merchant/MerchantNeeds";
import MerchantProfile from "./pages/merchant/MerchantProfile";
import MerchantSettings from "./pages/merchant/MerchantSettings";
import CooperativeDashboard from "./pages/cooperative/CooperativeDashboard";
import CooperativeDashboardNew from "./pages/CooperativeDashboard";
import CooperativeOrders from "./pages/cooperative/CooperativeOrders";
import CooperativeDistribution from "./pages/cooperative/CooperativeDistribution";
import CooperativeMembers from "./pages/cooperative/CooperativeMembers";
import CooperativePayments from "./pages/cooperative/CooperativePayments";
import CooperativeNegotiation from "./pages/cooperative/CooperativeNegotiation";
import CooperativeWarehouses from "./pages/cooperative/CooperativeWarehouses";
import CooperativeReceiving from "./pages/cooperative/CooperativeReceiving";
import CooperativePlanning from "./pages/cooperative/CooperativePlanning";
import CooperativeHarvests from "./pages/cooperative/CooperativeHarvests";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminSecurity from "./pages/admin/AdminSecurity";
import AdminReports from "./pages/admin/AdminReports";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminAuditLogs from "./pages/admin/AdminAuditLogs";
import AdminSystemMonitoring from "./pages/admin/AdminSystemMonitoring";
import AdminNotifications from "./pages/admin/AdminNotifications";
import AdminMarketplace from "./pages/admin/AdminMarketplace";
import AdminFinancial from "./pages/admin/AdminFinancial";
import AdminBackup from "./pages/admin/AdminBackup";
import AdminAPIKeys from "./pages/admin/AdminAPIKeys";
import AdminPermissions from "./pages/admin/AdminPermissions";
import AdminHealth from "./pages/admin/AdminHealth";
import AdminPerformance from "./pages/admin/AdminPerformance";
import AdminAlerts from "./pages/admin/AdminAlerts";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminDisputes from "./pages/admin/AdminDisputes";
import AdminDisputeDetail from "./pages/admin/AdminDisputeDetail";
import SubmitDispute from "./pages/disputes/SubmitDispute";
import MediationArbitrage from "./pages/disputes/MediationArbitrage";
import DisputePolicies from "./pages/disputes/DisputePolicies";
import Marketplace from "./pages/marketplace/Marketplace";
import AdminReviews from "./pages/admin/AdminReviews";
import ReviewsPage from "./pages/reviews/ReviewsPage";
import MyReviewsPage from "./pages/reviews/MyReviewsPage";
import ProductReviewsPage from "./pages/reviews/ProductReviewsPage";
import { UserPreferencesPage } from "./pages/user/UserPreferencesPage";
import { RecommendationsPage } from "./pages/user/RecommendationsPage";
import { ProductComparisonPage } from "./pages/user/ProductComparisonPage";
import { NotificationsPage } from "./pages/user/NotificationsPage";
import NotFound from "./pages/NotFound";
import SignupRole from "./pages/auth/SignupRole";
import SignupDetails from "./pages/auth/SignupDetails";
import SignupVerify from "./pages/auth/SignupVerify";
import SignupSuccess from "./pages/auth/SignupSuccess";
import ForgotPassword from "./pages/auth/ForgotPassword";
import MobileMoneyLogin from "./pages/auth/MobileMoneyLogin";
import TrainingPage from "./pages/training/TrainingPage";
import ModulePage from "./pages/training/ModulePage";
import VideoPlayerPage from "./pages/training/VideoPlayerPage";

const queryClient = new QueryClient();

// Schedule automated local backups (encrypted where applicable)
scheduleLocalBackups(30);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CartProvider>
        <OrderProvider>
          <ReviewProvider>
            <UserPreferencesProvider>
              <NotificationProvider>
                <OfflineIndicator />
                <TooltipProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter future={{
                  v7_startTransition: true,
                  v7_relativeSplatPath: true
                }}>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/welcome" element={<Welcome />} />
                  <Route path="/welcome-alt" element={<WelcomeAlt />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/login/mobile-money" element={<MobileMoneyLogin />} />

                  {/* Signup Routes */}
                  <Route path="/signup/role" element={<SignupRole />} />
                  <Route path="/signup/details" element={<SignupDetails />} />
                  <Route path="/signup/verify" element={<SignupVerify />} />
                  <Route path="/signup/success" element={<SignupSuccess />} />

                  {/* Dashboard Route */}
                  <Route path="/dashboard" element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } />

                  {/* Producer Routes */}
                  <Route path="/producer/dashboard" element={
                    <ProtectedRoute requiredRoles={['producer']}>
                      <ProducerDashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/producer/offers" element={
                    <ProtectedRoute requiredRoles={['producer']}>
                      <ProducerOffers />
                    </ProtectedRoute>
                  } />
                  <Route path="/producer/harvests" element={
                    <ProtectedRoute requiredRoles={['producer']}>
                      <ProducerHarvests />
                    </ProtectedRoute>
                  } />
                  <Route path="/producer/sales" element={
                    <ProtectedRoute requiredRoles={['producer']}>
                      <ProducerSales />
                    </ProtectedRoute>
                  } />
                  <Route path="/producer/revenue" element={
                    <ProtectedRoute requiredRoles={['producer']}>
                      <ProducerRevenue />
                    </ProtectedRoute>
                  } />
                  <Route path="/producer/price-management" element={
                    <ProtectedRoute requiredRoles={['producer']}>
                      <PriceManagementPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/producer/production-management" element={
                    <ProtectedRoute requiredRoles={['producer']}>
                      <ProductionManagementPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/producer/vocal-interface" element={
                    <ProtectedRoute requiredRoles={['producer']}>
                      <VocalInterfacePage />
                    </ProtectedRoute>
                  } />
                  <Route path="/producer/order-management" element={
                    <ProtectedRoute requiredRoles={['producer']}>
                      <OrderManagementPage />
                    </ProtectedRoute>
                  } />

                  {/* Merchant Routes */}
                  <Route path="/merchant/dashboard" element={
                    <ProtectedRoute requiredRoles={['merchant']}>
                      <MerchantDashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/merchant/sales" element={
                    <ProtectedRoute requiredRoles={['merchant']}>
                      <MerchantSales />
                    </ProtectedRoute>
                  } />
                  <Route path="/merchant/inventory" element={
                    <ProtectedRoute requiredRoles={['merchant']}>
                      <MerchantInventory />
                    </ProtectedRoute>
                  } />
                  <Route path="/merchant/orders" element={
                    <ProtectedRoute requiredRoles={['merchant']}>
                      <MerchantOrders />
                    </ProtectedRoute>
                  } />
                  <Route path="/merchant/payments" element={
                    <ProtectedRoute requiredRoles={['merchant']}>
                      <MerchantPayments />
                    </ProtectedRoute>
                  } />
                  <Route path="/merchant/receiving" element={
                    <ProtectedRoute requiredRoles={['merchant']}>
                      <MerchantReceiving />
                    </ProtectedRoute>
                  } />
                  <Route path="/merchant/social" element={
                    <ProtectedRoute requiredRoles={['merchant']}>
                      <MerchantSocial />
                    </ProtectedRoute>
                  } />
                  <Route path="/merchant/sourcing" element={
                    <ProtectedRoute requiredRoles={['merchant']}>
                      <MerchantSourcing />
                    </ProtectedRoute>
                  } />
                  <Route path="/merchant/credits" element={
                    <ProtectedRoute requiredRoles={['merchant']}>
                      <MerchantCredits />
                    </ProtectedRoute>
                  } />
                  <Route path="/merchant/sales-workflow" element={
                    <ProtectedRoute requiredRoles={['merchant']}>
                      <MerchantSalesWorkflow />
                    </ProtectedRoute>
                  } />
                  <Route path="/merchant/needs" element={
                    <ProtectedRoute requiredRoles={['merchant']}>
                      <MerchantNeeds />
                    </ProtectedRoute>
                  } />
                  <Route path="/merchant/profile" element={
                    <ProtectedRoute requiredRoles={['merchant']}>
                      <MerchantProfile />
                    </ProtectedRoute>
                  } />
                  <Route path="/merchant/settings" element={
                    <ProtectedRoute requiredRoles={['merchant']}>
                      <MerchantSettings />
                    </ProtectedRoute>
                  } />

                  {/* Cooperative Routes */}
                  <Route path="/cooperative/dashboard" element={
                    <ProtectedRoute requiredRoles={['cooperative']}>
                      <CooperativeDashboardNew />
                    </ProtectedRoute>
                  } />
                  <Route path="/cooperative/members" element={
                    <ProtectedRoute requiredRoles={['cooperative']}>
                      <CooperativeMembers />
                    </ProtectedRoute>
                  } />
                  <Route path="/cooperative/orders" element={
                    <ProtectedRoute requiredRoles={['cooperative']}>
                      <CooperativeOrders />
                    </ProtectedRoute>
                  } />
                  <Route path="/cooperative/distribution" element={
                    <ProtectedRoute requiredRoles={['cooperative']}>
                      <CooperativeDistribution />
                    </ProtectedRoute>
                  } />
                  <Route path="/cooperative/payments" element={
                    <ProtectedRoute requiredRoles={['cooperative']}>
                      <CooperativePayments />
                    </ProtectedRoute>
                  } />
                  <Route path="/cooperative/negotiation" element={
                    <ProtectedRoute requiredRoles={['cooperative']}>
                      <CooperativeNegotiation />
                    </ProtectedRoute>
                  } />
                  <Route path="/cooperative/warehouses" element={
                    <ProtectedRoute requiredRoles={['cooperative']}>
                      <CooperativeWarehouses />
                    </ProtectedRoute>
                  } />
                  <Route path="/cooperative/receiving" element={
                    <ProtectedRoute requiredRoles={['cooperative']}>
                      <CooperativeReceiving />
                    </ProtectedRoute>
                  } />
                  <Route path="/cooperative/planning" element={
                    <ProtectedRoute requiredRoles={['cooperative']}>
                      <CooperativePlanning />
                    </ProtectedRoute>
                  } />
                  <Route path="/cooperative/harvests" element={
                    <ProtectedRoute requiredRoles={['cooperative']}>
                      <CooperativeHarvests />
                    </ProtectedRoute>
                  } />

                  {/* Admin Routes */}
                  <Route path="/admin/dashboard" element={
                    <ProtectedRoute requiredRoles={['admin']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/admin/users" element={
                    <ProtectedRoute requiredRoles={['admin']}>
                      <AdminUsers />
                    </ProtectedRoute>
                  } />
                  <Route path="/admin/security" element={
                    <ProtectedRoute requiredRoles={['admin']}>
                      <AdminSecurity />
                    </ProtectedRoute>
                  } />
                  <Route path="/admin/reports" element={
                    <ProtectedRoute requiredRoles={['admin']}>
                      <AdminReports />
                    </ProtectedRoute>
                  } />
                  <Route path="/admin/reviews" element={
                    <ProtectedRoute requiredRoles={['admin']}>
                      <AdminReviews />
                    </ProtectedRoute>
                  } />
                  <Route path="/admin/settings" element={
                    <ProtectedRoute requiredRoles={['admin']}>
                      <AdminSettings />
                    </ProtectedRoute>
                  } />
                  <Route path="/admin/audit-logs" element={
                    <ProtectedRoute requiredRoles={['admin']}>
                      <AdminAuditLogs />
                    </ProtectedRoute>
                  } />
                  <Route path="/admin/system-monitoring" element={
                    <ProtectedRoute requiredRoles={['admin']}>
                      <AdminSystemMonitoring />
                    </ProtectedRoute>
                  } />
                  <Route path="/admin/notifications" element={
                    <ProtectedRoute requiredRoles={['admin']}>
                      <AdminNotifications />
                    </ProtectedRoute>
                  } />
                  <Route path="/admin/marketplace" element={
                    <ProtectedRoute requiredRoles={['admin']}>
                      <AdminMarketplace />
                    </ProtectedRoute>
                  } />
                  <Route path="/admin/disputes" element={
                    <ProtectedRoute requiredRoles={['admin']}>
                      <AdminDisputes />
                    </ProtectedRoute>
                  } />
                  <Route path="/admin/disputes/:id" element={
                    <ProtectedRoute requiredRoles={['admin']}>
                      <AdminDisputeDetail />
                    </ProtectedRoute>
                  } />
                  <Route path="/admin/analytics" element={
                    <ProtectedRoute requiredRoles={['admin']}>
                      <AdminAnalytics />
                    </ProtectedRoute>
                  } />
                  <Route path="/admin/financial" element={
                    <ProtectedRoute requiredRoles={['admin']}>
                      <AdminFinancial />
                    </ProtectedRoute>
                  } />
                  <Route path="/admin/backup" element={
                    <ProtectedRoute requiredRoles={['admin']}>
                      <AdminBackup />
                    </ProtectedRoute>
                  } />
                  <Route path="/admin/api-keys" element={
                    <ProtectedRoute requiredRoles={['admin']}>
                      <AdminAPIKeys />
                    </ProtectedRoute>
                  } />
                  <Route path="/admin/permissions" element={
                    <ProtectedRoute requiredRoles={['admin']}>
                      <AdminPermissions />
                    </ProtectedRoute>
                  } />
                  <Route path="/admin/health" element={
                    <ProtectedRoute requiredRoles={['admin']}>
                      <AdminHealth />
                    </ProtectedRoute>
                  } />
                  <Route path="/admin/performance" element={
                    <ProtectedRoute requiredRoles={['admin']}>
                      <AdminPerformance />
                    </ProtectedRoute>
                  } />
                  <Route path="/admin/alerts" element={
                    <ProtectedRoute requiredRoles={['admin']}>
                      <AdminAlerts />
                    </ProtectedRoute>
                  } />

                  {/* User Routes */}
                  <Route path="/user/preferences" element={
                    <ProtectedRoute>
                      <UserPreferencesPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/user/recommendations" element={
                    <ProtectedRoute>
                      <RecommendationsPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/user/compare" element={
                    <ProtectedRoute>
                      <ProductComparisonPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/user/notifications" element={
                    <ProtectedRoute>
                      <NotificationsPage />
                    </ProtectedRoute>
                  } />

                  {/* Marketplace Route - Public */}
                  <Route path="/marketplace" element={<Marketplace />} />

                  {/* Reviews */}
                  <Route path="/reviews" element={
                    <ProtectedRoute>
                      <ReviewsPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/my-reviews" element={
                    <ProtectedRoute>
                      <MyReviewsPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/product/:id/reviews" element={
                    <ProtectedRoute>
                      <ProductReviewsPage />
                    </ProtectedRoute>
                  } />

                  {/* Disputes */}
                  <Route path="/disputes/new" element={
                    <ProtectedRoute>
                      <SubmitDispute />
                    </ProtectedRoute>
                  } />
                  <Route path="/disputes/mediation" element={
                    <ProtectedRoute>
                      <MediationArbitrage />
                    </ProtectedRoute>
                  } />
                  <Route path="/policies/disputes" element={<DisputePolicies />} />

                  {/* Training Routes */}
                  <Route path="/training" element={<TrainingPage />} />
                  <Route path="/training/module/:moduleId" element={<ModulePage />} />
                  <Route path="/training/video/:videoId" element={<VideoPlayerPage />} />

                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
              </TooltipProvider>
            </NotificationProvider>
          </UserPreferencesProvider>
          </ReviewProvider>
        </OrderProvider>
      </CartProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
