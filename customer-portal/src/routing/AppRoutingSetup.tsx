import { ReactElement } from 'react';
import { Navigate, Route, Routes } from 'react-router';

import { RequestViewPage, ServiceRequestsTablePage } from '@/pages/service-requests';

import { AuthPage } from '@/auth';
import { RequireAuth } from '@/auth/RequireAuth';
import { ErrorsRouting } from '@/errors';

import { Demo2Layout } from '@/layouts/demo2';
import { DocumentsTablePage } from '@/pages/documents';
import { AccountSettingsPlainPage } from '@/pages/settings';
import { ReviewsTablePage } from '@/pages/reviews';
import { DirectoryPage } from '@/pages/directory';
import { PublicLayout } from '@/layouts/public-layout';
import { ServicesPage } from '@/pages/Services';
import { ProfileCompanyPage } from '@/pages/company-profile';

const AppRoutingSetup = (): ReactElement => {
  return (
    <Routes>
      <Route element={<Demo2Layout />}>
        <Route element={<RequireAuth />}>
          <Route path="/" element={<ServiceRequestsTablePage />} />
          <Route path="/service-request" element={<ServiceRequestsTablePage />} />
          <Route path="/service-request/request/:id" element={<RequestViewPage />} />
          <Route path="/documents" element={<DocumentsTablePage />} />
          <Route path="/provider-profile/:id" element={<ProfileCompanyPage />} />
          <Route path="/settings" element={<AccountSettingsPlainPage />} />
          <Route path="/reviews" element={<ReviewsTablePage />} />
        </Route>
      </Route>
      <Route path="error/*" element={<ErrorsRouting />} />
      <Route path="*" element={<AuthPage />} />
      <Route path="*" element={<Navigate to="/error/404" />} />
      <Route element={<PublicLayout />}>
        <Route path="/directory" element={<DirectoryPage />} />
        <Route path="/services" element={<ServicesPage />} />
      </Route>
    </Routes>
  );
};

export { AppRoutingSetup };
