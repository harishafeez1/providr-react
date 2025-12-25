import { ReactElement } from 'react';
import { Navigate, Route, Routes } from 'react-router';
import { AuthPage, Impersonate, RequireLogout } from '@/auth';
import { RequireAuth } from '@/auth/RequireAuth';
import { Demo1Layout } from '@/layouts/demo1';
import { ErrorsRouting } from '@/errors';

import {
  AddServiceOfferingPage,
  EditServiceOfferingPage,
  ServiceOfferingsTablePage
} from '@/pages/service-offerings';
import { ServiceRequestsTablePage } from '@/pages/service-requests';
import { AccountSettingsPlainPage } from '@/pages/user';
// import { DirectConnectPage } from '@/pages/direct-connect/direct-connect/DirectConnectPage';
import { AnalyticsPage } from '@/pages/analytics';
import { SpecialisationsPage } from '@/pages/specialisations';
import { AccountPlansPage } from '@/pages/billing';
import { AddPremisesPage, EditPremisesPage, PremisesTablePage } from '@/pages/premises';
import {
  AddParticipantPage,
  EditParticipantPage,
  ParticipantsTablePage
} from '@/pages/participants';
import { ReviewsTablePage } from '@/pages/reviews';
import { UsersTablePage } from '@/pages/users';
import { InvoicesPage } from '@/pages/invoices';
import { NotificationsTablePage } from '@/pages/notifications';
import { AddCompanyProfilePage, ProfileCompanyPage } from '@/pages/company-profile';
import PermissionWrapper from '@/layouts/demo1/PermissionProvider';
import { CustomerServiceRequestsTablePage } from '@/pages/service-requests/manage-customer-service-requests';
import { RequestViewPage } from '@/pages/service-requests/request-view';
import { IncidentsPage, AddIncidentPage, EditIncidentPage } from '@/pages/incidents';
import { DashboardPage } from '@/pages/dashboard';

const AppRoutingSetup = (): ReactElement => {
  return (
    <Routes>
      <Route element={<RequireAuth />}>
        <Route element={<Demo1Layout />}>
          <Route
            path="/dashboard"
            element={
              <PermissionWrapper requiredPermissions={['admin', 'editor', 'intake', 'review']}>
                <DashboardPage />
              </PermissionWrapper>
            }
          />
          <Route
            path="/"
            element={
              <PermissionWrapper requiredPermissions={['admin', 'editor', 'intake', 'review']}>
                <AddCompanyProfilePage />
              </PermissionWrapper>
            }
          />
          <Route
            path="/incidents"
            element={
              <PermissionWrapper requiredPermissions={['admin', 'editor', 'intake', 'review']}>
                <IncidentsPage />
              </PermissionWrapper>
            }
          />
          <Route
            path="/incidents/add-incident"
            element={
              <PermissionWrapper requiredPermissions={['admin', 'editor', 'intake', 'review']}>
                <AddIncidentPage />
              </PermissionWrapper>
            }
          />
          <Route
            path="/incidents/:id/edit"
            element={
              <PermissionWrapper requiredPermissions={['admin', 'editor', 'intake', 'review']}>
                <EditIncidentPage />
              </PermissionWrapper>
            }
          />
          <Route
            path="/service-offerings"
            element={
              <PermissionWrapper requiredPermissions={['admin', 'editor']}>
                <ServiceOfferingsTablePage />
              </PermissionWrapper>
            }
          />
          <Route
            path="/service-offering/add-service"
            element={
              <PermissionWrapper requiredPermissions={['admin', 'editor']}>
                <AddServiceOfferingPage />
              </PermissionWrapper>
            }
          />
          <Route
            path="/service-offering/edit-service/:id"
            element={
              <PermissionWrapper requiredPermissions={['admin', 'editor']}>
                <EditServiceOfferingPage />
              </PermissionWrapper>
            }
          />

          <Route
            path="/service-request/my-service-request"
            element={
              <PermissionWrapper requiredPermissions={['admin', 'intake']}>
                <ServiceRequestsTablePage />
              </PermissionWrapper>
            }
          />
          <Route
            path="/service-request/customer-service-request"
            element={
              <PermissionWrapper requiredPermissions={['admin', 'intake']}>
                <CustomerServiceRequestsTablePage />
              </PermissionWrapper>
            }
          />
          <Route
            path="/service-request/request/:id"
            element={
              <PermissionWrapper requiredPermissions={['admin', 'intake']}>
                <RequestViewPage />
              </PermissionWrapper>
            }
          />
          {/* <Route path="/direct-connect" element={
          <PermissionWrapper requiredPermissions={['admin', 'intake']}>
          <DirectConnectPage />
          </PermissionWrapper>
          } /> */}
          <Route
            path="/analytics"
            element={
              <PermissionWrapper requiredPermissions={['admin', 'editor']}>
                <AnalyticsPage />
              </PermissionWrapper>
            }
          />
          <Route
            path="/specialisations"
            element={
              <PermissionWrapper requiredPermissions={['admin', 'editor']}>
                <SpecialisationsPage />
              </PermissionWrapper>
            }
          />
          {/* <Route
            path="/billing"
            element={
              <PermissionWrapper requiredPermissions={['admin', 'billing']}>
                <AccountPlansPage />
              </PermissionWrapper>
            }
          /> */}

          <Route
            path="/premises"
            element={
              <PermissionWrapper requiredPermissions={['admin', 'editor']}>
                <PremisesTablePage />
              </PermissionWrapper>
            }
          />
          <Route
            path="/premises/add-premises"
            element={
              <PermissionWrapper requiredPermissions={['admin', 'editor']}>
                <AddPremisesPage />
              </PermissionWrapper>
            }
          />
          <Route
            path="/premises/edit-premises/:id"
            element={
              <PermissionWrapper requiredPermissions={['admin', 'editor']}>
                <EditPremisesPage />
              </PermissionWrapper>
            }
          />

          <Route
            path="/participants"
            element={
              <PermissionWrapper requiredPermissions={['admin', 'editor']}>
                <ParticipantsTablePage />
              </PermissionWrapper>
            }
          />
          <Route
            path="/participants/add-participant"
            element={
              <PermissionWrapper requiredPermissions={['admin', 'editor']}>
                <AddParticipantPage />
              </PermissionWrapper>
            }
          />
          <Route
            path="/participants/edit-participant/:id"
            element={
              <PermissionWrapper requiredPermissions={['admin', 'editor']}>
                <EditParticipantPage />
              </PermissionWrapper>
            }
          />

          <Route
            path="/reviews"
            element={
              <PermissionWrapper requiredPermissions={['admin', 'review']}>
                <ReviewsTablePage />
              </PermissionWrapper>
            }
          />
          <Route
            path="/users"
            element={
              <PermissionWrapper requiredPermissions={['admin']}>
                <UsersTablePage />
              </PermissionWrapper>
            }
          />
          <Route
            path="/notifications"
            element={
              <PermissionWrapper requiredPermissions={['admin', 'intake']}>
                <NotificationsTablePage />
              </PermissionWrapper>
            }
          />

          <Route
            path="/user/profile"
            element={
              <PermissionWrapper
                requiredPermissions={['admin', 'editor', 'intake', 'review', 'billing']}
              >
                <AccountSettingsPlainPage />
              </PermissionWrapper>
            }
          />
        </Route>

        {/* Invoices page should be accessible even without subscription for trial-ended users */}
        <Route element={<Demo1Layout />}>
          <Route
            path="/invoices"
            element={
              <PermissionWrapper requiredPermissions={['admin', 'billing']}>
                <InvoicesPage />
              </PermissionWrapper>
            }
          />
        </Route>
      </Route>
      <Route
        path="/company-profile"
        element={
          <PermissionWrapper
            requiredPermissions={['admin', 'editor', 'intake', 'review', 'billing']}
          >
            <ProfileCompanyPage />
          </PermissionWrapper>
        }
      />

      <Route path="error/*" element={<ErrorsRouting />} />
      <Route element={<RequireLogout />}>
        <Route path="auth/*" element={<AuthPage />} />
      </Route>
      <Route path="/impersonate" element={<Impersonate />} />
      <Route path="*" element={<Navigate to="/error/404" />} />
    </Routes>
  );
};

export { AppRoutingSetup };
