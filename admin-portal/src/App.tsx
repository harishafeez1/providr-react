import { Refine } from '@refinedev/core';
import routerProvider from '@refinedev/react-router-v6';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { authProvider } from './providers/auth-provider';
import { dataProvider } from './providers/data-provider';
import { Layout } from './components/layout/Layout';
import { LoginPage } from './pages/login';
import { DashboardPage } from './pages/dashboard';
import { ProviderCompanyList } from './pages/provider-companies/list';
import { ProviderCompanyShow } from './pages/provider-companies/show';
import { ProviderCompanyCreate } from './pages/provider-companies/create';
import { ProviderCompanyEdit } from './pages/provider-companies/edit';
import { UserList } from './pages/users/list';
import { CustomerList } from './pages/customers/list';
import { ServiceList } from './pages/services/list';
import { ServiceEdit } from './pages/services/edit';
import { ServiceOfferingList } from './pages/service-offerings/list';
import { ServiceRequestList } from './pages/service-requests/list';
import { ReviewList } from './pages/reviews/list';
import { IncidentTypeList } from './pages/incident-types/list';
import { AdminList } from './pages/admins/list';
import { SettingsPage } from './pages/settings';
import { ProjectTrackerPage } from './pages/project-tracker';
import { PermissionList } from './pages/permissions/list';
import { ProviderCompanyImportList } from './pages/provider-company-imports/list';
import { ClaimRequestList } from './pages/claim-requests/list';
import { CustomerDocumentList } from './pages/customer-documents/list';
import { StripeConfigurationList } from './pages/stripe-configurations/list';
import { StripeConfigurationCreate } from './pages/stripe-configurations/create';
import { StripeProductList } from './pages/stripe-products/list';
import { StripeProductCreate } from './pages/stripe-products/create';
import { AIModelList } from './pages/ai-models/list';
import { AIModelCreate } from './pages/ai-models/create';
import { PromptManagementList } from './pages/prompt-management/list';
import { NdisPromptList } from './pages/ndis-prompts/list';
import { NdisPromptEdit } from './pages/ndis-prompts/edit';
import { NdisPromptShow } from './pages/ndis-prompts/show';
import { PermissionCreate } from './pages/permissions/create';
import { RoleList } from './pages/roles/list';
import { RoleCreate } from './pages/roles/create';
import { ResourceShow } from './pages/resource-show';
import { ResourceEdit } from './pages/resource-edit';
import { ResourceCreate } from './pages/resource-create';
import { Authenticated } from './components/Authenticated';

export default function App() {
  return (
    <BrowserRouter basename="/admin-portal">
      <Refine
        routerProvider={routerProvider}
        authProvider={authProvider}
        dataProvider={dataProvider}
        resources={[
          { name: 'provider-companies', list: '/provider-companies', show: '/provider-companies/show/:id', create: '/provider-companies/create', edit: '/provider-companies/edit/:id' },
          { name: 'users', list: '/users', show: '/users/show/:id', edit: '/users/edit/:id' },
          { name: 'customers', list: '/customers', show: '/customers/show/:id', edit: '/customers/edit/:id' },
          { name: 'services', list: '/services', show: '/services/show/:id', create: '/services/create', edit: '/services/edit/:id' },
          { name: 'service-offerings', list: '/service-offerings', show: '/service-offerings/show/:id', edit: '/service-offerings/edit/:id' },
          { name: 'service-requests', list: '/service-requests', show: '/service-requests/show/:id', edit: '/service-requests/edit/:id' },
          { name: 'reviews', list: '/reviews', show: '/reviews/show/:id' },
          { name: 'incident-types', list: '/incident-types', show: '/incident-types/show/:id', create: '/incident-types/create', edit: '/incident-types/edit/:id' },
          { name: 'admins', list: '/admins', show: '/admins/show/:id', create: '/admins/create', edit: '/admins/edit/:id' },
          { name: 'settings', list: '/settings' },
          { name: 'permissions', list: '/permissions', show: '/permissions/show/:id', create: '/permissions/create' },
          { name: 'roles', list: '/roles', show: '/roles/show/:id', create: '/roles/create', edit: '/roles/edit/:id' },
          { name: 'provider-company-imports', list: '/provider-company-imports', show: '/provider-company-imports/show/:id' },
          { name: 'claim-requests', list: '/claim-requests', show: '/claim-requests/show/:id', edit: '/claim-requests/edit/:id' },
          { name: 'customer-documents', list: '/customer-documents', show: '/customer-documents/show/:id', edit: '/customer-documents/edit/:id' },
          { name: 'stripe-configurations', list: '/stripe-configurations', show: '/stripe-configurations/show/:id', create: '/stripe-configurations/create', edit: '/stripe-configurations/edit/:id' },
          { name: 'stripe-products', list: '/stripe-products', show: '/stripe-products/show/:id', create: '/stripe-products/create', edit: '/stripe-products/edit/:id' },
          { name: 'ai-models', list: '/ai-models', show: '/ai-models/show/:id', create: '/ai-models/create', edit: '/ai-models/edit/:id' },
          { name: 'prompt-management', list: '/prompt-management', show: '/prompt-management/show/:id', edit: '/prompt-management/edit/:id' },
          { name: 'ndis-prompts', list: '/ndis-prompts', show: '/ndis-prompts/show/:id', edit: '/ndis-prompts/edit/:id' },
        ]}
      >
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<Authenticated><Layout /></Authenticated>}>
            <Route index element={<DashboardPage />} />
            {/* Provider Companies - custom show/create/edit */}
            <Route path="provider-companies" element={<ProviderCompanyList />} />
            <Route path="provider-companies/show/:id" element={<ProviderCompanyShow />} />
            <Route path="provider-companies/create" element={<ProviderCompanyCreate />} />
            <Route path="provider-companies/edit/:id" element={<ProviderCompanyEdit />} />
            {/* Users */}
            <Route path="users" element={<UserList />} />
            <Route path="users/show/:id" element={<ResourceShow resource="users" title="Users" basePath="/users" />} />
            <Route path="users/edit/:id" element={<ResourceEdit resource="users" title="Users" basePath="/users" />} />
            {/* Customers */}
            <Route path="customers" element={<CustomerList />} />
            <Route path="customers/show/:id" element={<ResourceShow resource="customers" title="Customers" basePath="/customers" />} />
            <Route path="customers/edit/:id" element={<ResourceEdit resource="customers" title="Customers" basePath="/customers" />} />
            {/* Services */}
            <Route path="services" element={<ServiceList />} />
            <Route path="services/create" element={<ResourceCreate resource="services" title="Services" basePath="/services" fields={[
              { key: 'name', label: 'Name', required: true },
              { key: 'description', label: 'Description', type: 'textarea' },
              { key: 'active', label: 'Active', type: 'checkbox' },
            ]} />} />
            <Route path="services/show/:id" element={<ResourceShow resource="services" title="Services" basePath="/services" />} />
            <Route path="services/edit/:id" element={<ServiceEdit />} />
            {/* Service Offerings */}
            <Route path="service-offerings" element={<ServiceOfferingList />} />
            <Route path="service-offerings/show/:id" element={<ResourceShow resource="service-offerings" title="Service Offerings" basePath="/service-offerings" />} />
            <Route path="service-offerings/edit/:id" element={<ResourceEdit resource="service-offerings" title="Service Offerings" basePath="/service-offerings" />} />
            {/* Service Requests */}
            <Route path="service-requests" element={<ServiceRequestList />} />
            <Route path="service-requests/show/:id" element={<ResourceShow resource="service-requests" title="Service Requests" basePath="/service-requests" />} />
            <Route path="service-requests/edit/:id" element={<ResourceEdit resource="service-requests" title="Service Requests" basePath="/service-requests" />} />
            {/* Reviews */}
            <Route path="reviews" element={<ReviewList />} />
            <Route path="reviews/show/:id" element={<ResourceShow resource="reviews" title="Reviews" basePath="/reviews" canEdit={false} />} />
            {/* Incident Types */}
            <Route path="incident-types" element={<IncidentTypeList />} />
            <Route path="incident-types/create" element={<ResourceCreate resource="incident-types" title="Incident Types" basePath="/incident-types" fields={[
              { key: 'name', label: 'Name', required: true },
              { key: 'description', label: 'Description', type: 'textarea' },
            ]} />} />
            <Route path="incident-types/show/:id" element={<ResourceShow resource="incident-types" title="Incident Types" basePath="/incident-types" />} />
            <Route path="incident-types/edit/:id" element={<ResourceEdit resource="incident-types" title="Incident Types" basePath="/incident-types" />} />
            {/* Admin Users */}
            <Route path="admins" element={<AdminList />} />
            <Route path="admins/create" element={<ResourceCreate resource="admins" title="Admin Users" basePath="/admins" fields={[
              { key: 'name', label: 'Name', required: true },
              { key: 'email', label: 'Email', type: 'email', required: true },
              { key: 'password', label: 'Password', required: true },
            ]} />} />
            <Route path="admins/show/:id" element={<ResourceShow resource="admins" title="Admin Users" basePath="/admins" />} />
            <Route path="admins/edit/:id" element={<ResourceEdit resource="admins" title="Admin Users" basePath="/admins" />} />
            {/* Permissions */}
            <Route path="permissions" element={<PermissionList />} />
            <Route path="permissions/create" element={<PermissionCreate />} />
            <Route path="permissions/show/:id" element={<ResourceShow resource="permissions" title="Permissions" basePath="/permissions" canEdit={false} />} />
            {/* Roles */}
            <Route path="roles" element={<RoleList />} />
            <Route path="roles/create" element={<RoleCreate />} />
            <Route path="roles/show/:id" element={<ResourceShow resource="roles" title="Roles" basePath="/roles" />} />
            <Route path="roles/edit/:id" element={<ResourceEdit resource="roles" title="Roles" basePath="/roles" />} />
            {/* Provider Company Imports */}
            <Route path="provider-company-imports" element={<ProviderCompanyImportList />} />
            <Route path="provider-company-imports/show/:id" element={<ResourceShow resource="provider-company-imports" title="Company Imports" basePath="/provider-company-imports" canEdit={false} />} />
            {/* Claim Requests */}
            <Route path="claim-requests" element={<ClaimRequestList />} />
            <Route path="claim-requests/show/:id" element={<ResourceShow resource="claim-requests" title="Claim Requests" basePath="/claim-requests" />} />
            <Route path="claim-requests/edit/:id" element={<ResourceEdit resource="claim-requests" title="Claim Requests" basePath="/claim-requests" />} />
            {/* Customer Documents */}
            <Route path="customer-documents" element={<CustomerDocumentList />} />
            <Route path="customer-documents/show/:id" element={<ResourceShow resource="customer-documents" title="Customer Documents" basePath="/customer-documents" />} />
            <Route path="customer-documents/edit/:id" element={<ResourceEdit resource="customer-documents" title="Customer Documents" basePath="/customer-documents" />} />
            {/* Stripe */}
            <Route path="stripe-configurations" element={<StripeConfigurationList />} />
            <Route path="stripe-configurations/create" element={<StripeConfigurationCreate />} />
            <Route path="stripe-configurations/show/:id" element={<ResourceShow resource="stripe-configurations" title="Stripe Configurations" basePath="/stripe-configurations" />} />
            <Route path="stripe-configurations/edit/:id" element={<ResourceEdit resource="stripe-configurations" title="Stripe Configurations" basePath="/stripe-configurations" />} />
            <Route path="stripe-products" element={<StripeProductList />} />
            <Route path="stripe-products/create" element={<StripeProductCreate />} />
            <Route path="stripe-products/show/:id" element={<ResourceShow resource="stripe-products" title="Stripe Products" basePath="/stripe-products" />} />
            <Route path="stripe-products/edit/:id" element={<ResourceEdit resource="stripe-products" title="Stripe Products" basePath="/stripe-products" />} />
            {/* System Management */}
            <Route path="ai-models" element={<AIModelList />} />
            <Route path="ai-models/create" element={<AIModelCreate />} />
            <Route path="ai-models/show/:id" element={<ResourceShow resource="ai-models" title="AI Models" basePath="/ai-models" />} />
            <Route path="ai-models/edit/:id" element={<ResourceEdit resource="ai-models" title="AI Models" basePath="/ai-models" />} />
            <Route path="prompt-management" element={<PromptManagementList />} />
            <Route path="prompt-management/show/:id" element={<ResourceShow resource="prompt-management" title="BSP Analysis Prompts" basePath="/prompt-management" />} />
            <Route path="prompt-management/edit/:id" element={<ResourceEdit resource="prompt-management" title="BSP Analysis Prompts" basePath="/prompt-management" />} />
            <Route path="ndis-prompts" element={<NdisPromptList />} />
            <Route path="ndis-prompts/show/:id" element={<NdisPromptShow />} />
            <Route path="ndis-prompts/edit/:id" element={<NdisPromptEdit />} />
            {/* Settings & Tools */}
            <Route path="settings" element={<SettingsPage />} />
            <Route path="project-tracker" element={<ProjectTrackerPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Refine>
    </BrowserRouter>
  );
}
