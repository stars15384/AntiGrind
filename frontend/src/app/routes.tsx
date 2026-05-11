import { Suspense, lazy } from "react";
import { createBrowserRouter } from "react-router";
import { HomePage } from "./components/HomePage";
import { LoginPage } from "./components/LoginPage";
import { RegisterPage } from "./components/RegisterPage";
import { SearchResultsPage } from "./components/SearchResultsPage";
import { LanguageSwitcher } from "./components/LanguageSwitcher";
import { ErrorBoundary } from "./components/ErrorBoundary";

const CompanyDetailPage = lazy(() =>
  import("./components/CompanyDetailPage").then((m) => ({ default: m.CompanyDetailPage }))
);
const ScanVerifyPage = lazy(() =>
  import("./components/ScanVerifyPage").then((m) => ({ default: m.ScanVerifyPage }))
);
const EmployeeCheckInPage = lazy(() =>
  import("./components/EmployeeCheckInPage").then((m) => ({ default: m.EmployeeCheckInPage }))
);
const CertificationApplicationPage = lazy(() =>
  import("./components/CertificationApplicationPage").then((m) => ({
    default: m.CertificationApplicationPage,
  }))
);
const CertificationResultPage = lazy(() =>
  import("./components/CertificationResultPage").then((m) => ({
    default: m.CertificationResultPage,
  }))
);
const CompanyDashboardPage = lazy(() =>
  import("./components/CompanyDashboardPage").then((m) => ({
    default: m.CompanyDashboardPage,
  }))
);
const RankingsPage = lazy(() =>
  import("./components/RankingsPage").then((m) => ({ default: m.RankingsPage }))
);
const AdminDashboard = lazy(() =>
  import("./components/AdminDashboard").then((m) => ({ default: m.AdminDashboard }))
);
const AdminLayout = lazy(() =>
  import("./components/AdminLayout").then((m) => ({ default: m.AdminLayout }))
);
const AdminUserManagement = lazy(() =>
  import("./components/AdminUserManagement").then((m) => ({
    default: m.AdminUserManagement,
  }))
);
const AdminCompanyManagement = lazy(() =>
  import("./components/AdminCompanyManagement").then((m) => ({
    default: m.AdminCompanyManagement,
  }))
);
const AnalyticsDashboard = lazy(() =>
  import("./components/AnalyticsDashboard").then((m) => ({
    default: m.AnalyticsDashboard,
  }))
);
const SystemSettings = lazy(() =>
  import("./components/SystemSettings").then((m) => ({
    default: m.SystemSettings,
  }))
);
const OperationLogs = lazy(() =>
  import("./components/OperationLogs").then((m) => ({
    default: m.OperationLogs,
  }))
);
const AdminCertificationReview = lazy(() =>
  import("./components/AdminCertificationReview").then((m) => ({
    default: m.AdminCertificationReview,
  }))
);

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[var(--background)]">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)]"></div>
        <p className="mt-4 text-[var(--muted-foreground)]">Loading...</p>
      </div>
    </div>
  );
}

function LazyPage({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    Component: HomePage,
  },
  {
    path: "/login",
    Component: LoginPage,
  },
  {
    path: "/register",
    Component: RegisterPage,
  },
  {
    path: "/company/:id",
    element: (
      <LazyPage>
        <CompanyDetailPage />
      </LazyPage>
    ),
  },
  {
    path: "/scan",
    element: (
      <LazyPage>
        <ScanVerifyPage />
      </LazyPage>
    ),
  },
  {
    path: "/checkin",
    element: (
      <LazyPage>
        <EmployeeCheckInPage />
      </LazyPage>
    ),
  },
  {
    path: "/apply",
    element: (
      <LazyPage>
        <CertificationApplicationPage />
      </LazyPage>
    ),
  },
  {
    path: "/certification/:id",
    element: (
      <LazyPage>
        <CertificationResultPage />
      </LazyPage>
    ),
  },
  {
    path: "/search",
    Component: SearchResultsPage,
  },
  {
    path: "/rankings",
    element: (
      <LazyPage>
        <RankingsPage />
      </LazyPage>
    ),
  },
  {
    path: "/dashboard",
    element: (
      <LazyPage>
        <CompanyDashboardPage />
      </LazyPage>
    ),
  },
  {
    path: "/admin",
    element: (
      <LazyPage>
        <AdminLayout />
      </LazyPage>
    ),
    children: [
      {
        index: true,
        element: (
          <LazyPage>
            <AdminDashboard />
          </LazyPage>
        ),
      },
      {
        path: "users",
        element: (
          <LazyPage>
            <AdminUserManagement />
          </LazyPage>
        ),
      },
      {
        path: "companies",
        element: (
          <LazyPage>
            <AdminCompanyManagement />
          </LazyPage>
        ),
      },
      {
        path: "certifications",
        element: (
          <LazyPage>
            <AdminCertificationReview />
          </LazyPage>
        ),
      },
      {
        path: "analytics",
        element: (
          <LazyPage>
            <AnalyticsDashboard />
          </LazyPage>
        ),
      },
      {
        path: "settings",
        element: (
          <LazyPage>
            <SystemSettings />
          </LazyPage>
        ),
      },
      {
        path: "logs",
        element: (
          <LazyPage>
            <OperationLogs />
          </LazyPage>
        ),
      },
    ],
  },
]);
