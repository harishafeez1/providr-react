import { ReactElement } from 'react';
import { Navigate, Route, Routes } from 'react-router';

import { ServiceRequestsTablePage } from '@/pages/service-requests';

import { AuthPage } from '@/auth';
import { RequireAuth } from '@/auth/RequireAuth';
import { ErrorsRouting } from '@/errors';

import { Demo2Layout } from '@/layouts/demo2';
import { DocumentsTablePage } from '@/pages/documents';
import { AccountSettingsPlainPage } from '@/pages/settings';
import { ReviewsTablePage } from '@/pages/reviews';

const AppRoutingSetup = (): ReactElement => {
  return (
    <Routes>
      <Route element={<RequireAuth />}>
        <Route element={<Demo2Layout />}>
          <Route path="/service-request" element={<ServiceRequestsTablePage />} />
          <Route path="/documents" element={<DocumentsTablePage />} />
          <Route path="/settings" element={<AccountSettingsPlainPage />} />
          <Route path="/reviews" element={<ReviewsTablePage />} />
        </Route>
      </Route>
      <Route path="error/*" element={<ErrorsRouting />} />
      <Route path="*" element={<AuthPage />} />
      <Route path="*" element={<Navigate to="/error/404" />} />
    </Routes>
  );
};

export { AppRoutingSetup };
