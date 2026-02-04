# React Superadmin Portal - Development Plan

## Project Overview

Build a React-based superadmin panel to replace Laravel Nova. The admin portal will manage all aspects of the Providr platform including providers, customers, services, incidents, and system configuration.

### Deployment URLs
| Environment | URL | API Base |
|-------------|-----|----------|
| **Production** | `https://admin.providr.au` | `https://admin.providr.au/api` |
| **Local** | `http://127.0.0.1:8000` | `http://127.0.0.1:8000/api` |

### Project Location
```
providr-react/
├── provider-portal/     # Existing - Provider users
├── customer-portal/     # Existing - NDIS participants
└── admin-portal/        # NEW - Superadmin panel
```

---

## Tech Stack (Same as provider-portal)

- **Framework:** React 18 + TypeScript + Vite
- **UI Theme:** Metronic Tailwind (Demo1 Layout)
- **Components:** shadcn/ui + Radix UI
- **Icons:** KeenIcons + Lucide React
- **Forms:** Formik + Yup validation
- **Tables:** TanStack React Table v8 (DataGrid)
- **State:** Redux Toolkit (minimal) + React Query
- **HTTP:** Axios with interceptors
- **Styling:** Tailwind CSS 3.4
- **Charts:** ApexCharts / Recharts

---

## Phase 1: Project Setup & Authentication

### 1.1 Initialize Project
```bash
# Copy provider-portal as base
cp -r provider-portal admin-portal
cd admin-portal

# Update package.json
# - Change name to "providr-admin-portal"
# - Keep all dependencies

npm install
```

### 1.2 Environment Configuration
Create `.env` files:

```env
# .env.development
VITE_APP_NAME=providr-admin
VITE_APP_VERSION=1.0
VITE_APP_API_URL=http://127.0.0.1:8000/api
VITE_APP_AWS_URL=https://providrbucket.s3.ap-southeast-2.amazonaws.com

# .env.production
VITE_APP_NAME=providr-admin
VITE_APP_VERSION=1.0
VITE_APP_API_URL=https://admin.providr.au/api
VITE_APP_AWS_URL=https://providrbucket.s3.ap-southeast-2.amazonaws.com
```

### 1.3 Vite Configuration
```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  base: '/',  // Root path (like Nova)
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 3000
  }
});
```

### 1.4 Authentication System

**API Endpoints:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/admin/login` | Login with email/password |
| POST | `/api/admin/logout` | Logout (requires auth) |
| GET | `/api/admin/me` | Get current admin profile |

**Auth Model (`src/auth/_models.ts`):**
```typescript
export interface AdminModel {
  id: number;
  name: string;
  email: string;
  roles: string[];
  permissions: string[];
}

export interface AuthModel {
  token: string;
  admin: AdminModel;
}
```

**Login Request/Response:**
```typescript
// Request
{ email: string, password: string }

// Response
{
  token: "1|abc123...",
  admin: {
    id: 1,
    name: "Super Admin",
    email: "admin@admin.com",
    roles: ["super-admin"],
    permissions: ["view admins", "create admins", ...]
  }
}
```

**Permission Helper (`src/auth/_helpers.ts`):**
```typescript
export const hasPermission = (user: AdminModel, permission: string): boolean => {
  if (user.roles.includes('super-admin')) return true;
  return user.permissions.includes(permission);
};

export const hasAnyPermission = (user: AdminModel, permissions: string[]): boolean => {
  return permissions.some(p => hasPermission(user, p));
};
```

---

## Phase 2: Layout & Navigation

### 2.1 Sidebar Menu Structure

Based on Nova's menu, implement this navigation:

```typescript
// src/config/menu.config.tsx
export const menuConfig = [
  {
    title: 'Dashboard',
    icon: 'home',
    path: '/dashboard',
    permission: null // All admins
  },
  {
    title: 'User Management',
    icon: 'users',
    children: [
      {
        title: 'Admins',
        path: '/admins',
        permission: 'view admins'
      },
      {
        title: 'Roles',
        path: '/roles',
        permission: 'super-admin'
      },
      {
        title: 'Permissions',
        path: '/permissions',
        permission: 'super-admin'
      }
    ]
  },
  {
    title: 'Providers',
    icon: 'building',
    children: [
      {
        title: 'Provider Companies',
        path: '/provider-companies',
        permission: 'view provider companies'
      },
      {
        title: 'Provider Users',
        path: '/provider-users',
        permission: 'view provider users'
      },
      {
        title: 'CSV Import',
        path: '/provider-imports',
        permission: 'create provider companies'
      }
    ]
  },
  {
    title: 'Services',
    icon: 'briefcase',
    children: [
      {
        title: 'Services',
        path: '/services',
        permission: 'view services'
      },
      {
        title: 'Service Offerings',
        path: '/service-offerings',
        permission: 'view services'
      },
      {
        title: 'Service Requests',
        path: '/service-requests',
        permission: 'view service requests'
      }
    ]
  },
  {
    title: 'Customers',
    icon: 'user-circle',
    children: [
      {
        title: 'Customers',
        path: '/customers',
        permission: 'view customers'
      },
      {
        title: 'Customer Documents',
        path: '/customer-documents',
        permission: 'view customer documents'
      }
    ]
  },
  {
    title: 'Reviews',
    icon: 'star',
    path: '/reviews',
    permission: 'view reviews'
  },
  {
    title: 'Claim Requests',
    icon: 'clipboard',
    path: '/claim-requests',
    permission: 'super-admin'
  },
  {
    title: 'Incidents',
    icon: 'alert-triangle',
    children: [
      {
        title: 'Incident Types',
        path: '/incident-types',
        permission: 'view incident types'
      }
    ]
  },
  {
    title: 'Settings',
    icon: 'settings',
    path: '/settings',
    permission: 'view settings'
  },
  {
    title: 'Stripe Management',
    icon: 'credit-card',
    permission: 'super-admin',
    children: [
      {
        title: 'Stripe Configuration',
        path: '/stripe-config'
      },
      {
        title: 'Stripe Products',
        path: '/stripe-products'
      }
    ]
  },
  {
    title: 'System',
    icon: 'cpu',
    permission: 'super-admin',
    children: [
      {
        title: 'AI Models',
        path: '/ai-models'
      },
      {
        title: 'NDIS Prompts',
        path: '/ndis-prompts'
      },
      {
        title: 'BSP Prompts',
        path: '/bsp-prompts'
      }
    ]
  }
];
```

---

## Phase 3: API Service Layer

### 3.1 API Endpoints Reference

Create centralized endpoints file:

```typescript
// src/services/endpoints/index.ts
const API_URL = import.meta.env.VITE_APP_API_URL;

// Auth
export const ADMIN_LOGIN_URL = `${API_URL}/admin/login`;
export const ADMIN_LOGOUT_URL = `${API_URL}/admin/logout`;
export const ADMIN_ME_URL = `${API_URL}/admin/me`;

// Dashboard
export const DASHBOARD_URL = `${API_URL}/admin/dashboard`;
export const DASHBOARD_PREFERENCES_URL = `${API_URL}/admin/dashboard/preferences`;

// Admins
export const ADMINS_URL = `${API_URL}/admin/admins`;

// Provider Companies
export const PROVIDER_COMPANIES_URL = `${API_URL}/admin/provider-companies`;

// Provider Users
export const PROVIDER_USERS_URL = `${API_URL}/admin/users`;

// Customers
export const CUSTOMERS_URL = `${API_URL}/admin/customers`;

// Services
export const SERVICES_URL = `${API_URL}/admin/services`;

// Service Offerings
export const SERVICE_OFFERINGS_URL = `${API_URL}/admin/service-offerings`;

// Service Requests
export const SERVICE_REQUESTS_URL = `${API_URL}/admin/service-requests`;

// Reviews
export const REVIEWS_URL = `${API_URL}/admin/reviews`;

// Incident Types
export const INCIDENT_TYPES_URL = `${API_URL}/admin/incident-types`;

// Settings
export const SETTINGS_URL = `${API_URL}/admin/settings`;
```

### 3.2 API Service Pattern

```typescript
// src/services/api/provider-companies.ts
import axios from 'axios';
import { PROVIDER_COMPANIES_URL } from '../endpoints';

export interface ProviderCompany {
  id: number;
  name: string;
  abn: string;
  company_email: string;
  company_phone: string;
  company_website: string;
  organisation_type: string;
  registered_for_ndis: boolean;
  registered_for_ndis_early_childhood: boolean;
  is_claimed: boolean;
  imported_from_csv: boolean;
  users_count?: number;
  service_offerings_count?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export const fetchProviderCompanies = async (params?: {
  page?: number;
  per_page?: number;
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}): Promise<PaginatedResponse<ProviderCompany>> => {
  const response = await axios.get(PROVIDER_COMPANIES_URL, { params });
  return response.data;
};

export const fetchProviderCompany = async (id: number): Promise<ProviderCompany> => {
  const response = await axios.get(`${PROVIDER_COMPANIES_URL}/${id}`);
  return response.data;
};

export const createProviderCompany = async (data: Partial<ProviderCompany>): Promise<ProviderCompany> => {
  const response = await axios.post(PROVIDER_COMPANIES_URL, data);
  return response.data;
};

export const updateProviderCompany = async (id: number, data: Partial<ProviderCompany>): Promise<ProviderCompany> => {
  const response = await axios.put(`${PROVIDER_COMPANIES_URL}/${id}`, data);
  return response.data;
};

export const deleteProviderCompany = async (id: number): Promise<void> => {
  await axios.delete(`${PROVIDER_COMPANIES_URL}/${id}`);
};
```

---

## Phase 4: Core Pages Implementation

### 4.1 Dashboard Page

**API Endpoint:** `GET /api/admin/dashboard`

**Response Structure:**
```typescript
interface DashboardData {
  summary: {
    provider_companies: { total: number; last_7_days: number; last_30_days: number };
    users: { total: number; last_7_days: number; last_30_days: number };
    participants: { total: number; last_7_days: number; last_30_days: number };
    incidents: { total: number; last_7_days: number; last_30_days: number };
    services: { total: number };
    reviews: { total: number; last_7_days: number; last_30_days: number };
  };
  incidents_by_severity: Array<{ severity: string; count: number }>;
  incidents_by_type: Array<{ type: string; count: number }>;
  incidents_by_status: Array<{ status: string; count: number }>;
  incident_trend: Array<{ date: string; count: number }>;
  ndis_compliance: {
    reportable: number;
    police_notified: number;
    restrictive_practices: number;
    follow_up_required: number;
    open_incidents: number;
    closed_incidents: number;
  };
  action_items: {
    draft_incidents: number;
    incidents_needing_followup: number;
    total_reviews: number;
  };
  recent_activity: Array<{
    type: 'incident' | 'review' | 'company';
    message: string;
    detail: string;
    date: string;
  }>;
}
```

**Dashboard Components:**
1. **Summary Cards** - 6 cards showing totals with 7/30 day trends
2. **Incidents by Severity Chart** - Pie/Donut chart
3. **Incidents by Type Chart** - Bar chart
4. **Incidents by Status Chart** - Pie chart
5. **30-Day Incident Trend** - Line chart
6. **NDIS Compliance Stats** - Stats cards
7. **Action Items** - Alert cards
8. **Recent Activity Feed** - Timeline list

### 4.2 CRUD Pages Pattern

Each resource needs these pages:

```
src/pages/{resource}/
├── index.ts                    # Exports
├── {Resource}Page.tsx          # Main list page
├── {Resource}TablePage.tsx     # Table wrapper
├── Add{Resource}Page.tsx       # Create form page
├── Edit{Resource}Page.tsx      # Edit form page
└── blocks/
    ├── {Resource}Table.tsx     # DataGrid component
    ├── {Resource}Form.tsx      # Formik form
    └── {Resource}Toolbar.tsx   # Table toolbar
```

---

## Phase 5: Resource Implementations

### 5.1 Admins Management

**Permissions Required:** `view admins`, `create admins`, `edit admins`, `delete admins`

**API Endpoints:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/admins` | List all admins |
| GET | `/api/admin/admins/{id}` | Get single admin |
| POST | `/api/admin/admins` | Create admin |
| PUT | `/api/admin/admins/{id}` | Update admin |
| DELETE | `/api/admin/admins/{id}` | Delete admin |

**Fields:**
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| name | text | Yes | Max 255 chars |
| email | email | Yes | Unique |
| password | password | Create only | Min 8 chars |
| roles | multiselect | No | Assign roles |

**Special Actions:**
- Assign Roles & Permissions modal

---

### 5.2 Provider Companies Management

**Permissions Required:** `view provider companies`, `create provider companies`, `edit provider companies`, `delete provider companies`

**API Endpoints:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/provider-companies` | List with pagination |
| GET | `/api/admin/provider-companies/{id}` | Get single |
| POST | `/api/admin/provider-companies` | Create |
| PUT | `/api/admin/provider-companies/{id}` | Update |
| DELETE | `/api/admin/provider-companies/{id}` | Delete |

**Fields:**
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| name | text | Yes | Max 255 |
| abn | text | No | 11 digits |
| company_logo | image | No | S3 upload |
| organisation_type | select | No | sole_trader, company |
| registered_for_ndis | boolean | No | |
| registered_for_ndis_early_childhood | boolean | No | |
| company_email | email | No | |
| company_phone | text | No | |
| company_website | url | No | |
| facebook_url | url | No | |
| linkedin_url | url | No | |
| instagram_url | url | No | |
| twitter_url | url | No | |
| is_claimed | boolean | No | Read-only indicator |
| imported_from_csv | boolean | No | Read-only |

**Table Columns:**
- ID, Name, Organisation Type, NDIS Registered, Users Count, Service Offerings Count, Is Claimed, Actions

**Special Actions:**
- Mark as Claimed (for CSV-imported unclaimed companies)

---

### 5.3 Provider Users Management

**Permissions Required:** `view provider users`, `create provider users`, `edit provider users`, `delete provider users`

**API Endpoints:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/users` | List with pagination |
| GET | `/api/admin/users/{id}` | Get single |
| POST | `/api/admin/users` | Create |
| PUT | `/api/admin/users/{id}` | Update |
| DELETE | `/api/admin/users/{id}` | Delete |

**Fields:**
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| first_name | text | Yes | |
| last_name | text | Yes | |
| email | email | Yes | Unique |
| password | password | Create only | |
| provider_company_id | select | Yes | BelongsTo |
| active | boolean | No | Default true |
| admin | boolean | No | Company admin role |
| permission_editor | boolean | No | |
| permission_review | boolean | No | |
| permission_billing | boolean | No | |
| permission_intake | boolean | No | |

**Table Columns:**
- ID, Name, Email, Provider Company, Active, Permissions (badges), Actions

**Special Actions:**
- Send Welcome Email
- Impersonate User (link to provider portal)

---

### 5.4 Customers Management

**Permissions Required:** `view customers`, `create customers`, `edit customers`, `delete customers`

**Fields:**
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| first_name | text | Yes | |
| last_name | text | Yes | |
| email | email | Yes | Unique |
| password | password | Create only | |
| phone | text | No | |
| date_of_birth | date | No | |
| ndis_number | text | No | |
| ndis_plan_type | text | No | |
| ndis_date | date | No | |
| active | boolean | No | |

**Related Data:**
- Reviews (HasMany) - show in detail view

---

### 5.5 Services Management

**Permissions Required:** `view services`, `create services`, `edit services`, `delete services`

**Fields:**
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| name | text | Yes | |
| service_image | image | No | S3 upload |
| active | boolean | No | Default true |

---

### 5.6 Service Offerings Management

**Fields:**
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| provider_company_id | select | Yes | BelongsTo |
| service_id | select | Yes | BelongsTo |
| active | boolean | No | |
| description | textarea | No | |
| service_delivered_options | multiselect | No | JSON array |
| age_group_options | multiselect | No | JSON array |
| language_options | multiselect | No | JSON array |
| service_available_options | multiselect | No | JSON array (regions) |

**Multiselect Options:**

*Service Delivered:*
- Group
- You come to us
- Telehealth
- Online service
- We come to you

*Age Groups:*
- Early Childhood 0-7
- Children 8-16
- Young people 17-21
- Adults 22-59
- Mature Age 60+

*Languages:*
- English, Arabic, Bengali, Burmese, Cantonese, Croatian, Dutch, Farsi, Filipino, French, German, Greek, Gujarati, Hindi, Indonesian, Italian, Japanese, Khmer, Korean, Macedonian, Malayalam, Maltese, Mandarin, Nepali, Persian, Polish, Portuguese, Punjabi, Russian, Samoan, Serbian, Sinhalese, Spanish, Swahili, Tagalog, Tamil, Telugu, Thai, Turkish, Ukrainian, Urdu, Vietnamese, + more

---

### 5.7 Service Requests Management

**Permissions Required:** `view service requests`, `create service requests`, `edit service requests`, `delete service requests`

**Fields:**
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| customer_id | select | Yes | BelongsTo |
| service_id | select | Yes | BelongsTo |
| service_offering_id | select | No | BelongsTo |
| provider_company_id | select | No | BelongsTo |
| status | boolean | No | |
| description | textarea | No | |
| address | text | No | |
| city | text | No | |
| state | text | No | |
| country | text | No | |
| zip_code | text | No | |
| first_name | text | No | |
| last_name | text | No | |
| gender | text | No | |
| phone | text | No | |
| email | email | No | |
| service_delivered_options | multiselect | No | JSON |
| age_group_options | multiselect | No | JSON |

---

### 5.8 Reviews Management

**Permissions Required:** `view reviews`, `create reviews`, `edit reviews`, `delete reviews`

**Fields:**
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| provider_company_id | select | Yes | BelongsTo |
| service_offering_id | select | Yes | BelongsTo |
| customer_id | select | Yes | BelongsTo |
| rating | number | Yes | 1-5 |
| content | textarea | No | |
| reply | textarea | No | Provider's reply |

---

### 5.9 Incident Types Management

**Permissions Required:** `view incident types`, `create incident types`, `edit incident types`, `delete incident types`

**Fields:**
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| name | text | Yes | Max 255 |
| active | boolean | No | Default true |

---

### 5.10 Settings Management

**Permissions Required:** `view settings`

**API Pattern:**
```
GET  /api/admin/settings/{category}
POST /api/admin/settings/{category}
```

**Categories:**
- `branding` - Logo, colors, app name
- `homepage` - Default services, discover services
- `general` - Other settings

---

### 5.11 Claim Requests (Super-Admin Only)

**Fields (Read-Only):**
| Field | Type | Notes |
|-------|------|-------|
| id | number | |
| provider_company | relation | BelongsTo |
| company_name | text | |
| email | text | |
| company_website | text | |
| status | badge | approved/rejected |
| rejection_reason | text | |
| created_at | datetime | |

**Actions:**
- Approve Claim Request - Creates user account, sends emails

---

### 5.12 Stripe Configuration (Super-Admin Only)

**Fields:**
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| environment | select | Yes | test/production |
| publishable_key | text | Yes | pk_* |
| secret_key | text | Yes | sk_* (hidden) |
| webhook_secret | text | No | Auto-generated |
| billing_portal_configuration_id | text | No | |
| active | boolean | No | |
| trial_enabled | boolean | No | |
| trial_period_days | number | No | 1-365 |
| require_payment_method_during_trial | boolean | No | |
| trial_description | textarea | No | |

**Actions:**
- Create Billing Portal Configuration
- Add Webhook Secret
- Create Stripe Webhook

---

### 5.13 Stripe Products (Super-Admin Only)

**Fields:**
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| stripe_configuration_id | select | Yes | BelongsTo |
| stripe_product_id | text | No | Auto-generated |
| stripe_price_id | text | No | Auto-generated |
| name | text | Yes | |
| description | textarea | No | |
| amount | currency | Yes | In AUD, converts to cents |
| currency | text | Yes | Default: aud |
| interval | select | Yes | day/week/month/year |
| interval_count | number | Yes | Default: 1 |
| active | boolean | No | Only one active at a time |
| metadata | key-value | No | JSON |

---

### 5.14 AI Models (Super-Admin Only)

**Fields:**
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| model_name | text | Yes | e.g., llama-3.1-70b-versatile |
| api_key | text | Yes | |
| active | boolean | No | Only one active |

---

### 5.15 NDIS Prompt Definitions (Super-Admin Only)

**Read & Update Only** - Cannot create or delete

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| section_number | number | 1-8 |
| section_name | text | |
| main_prompt | textarea | Main AI prompt |
| field_prompts | JSON | Field-specific prompts |
| temperature | number | 0.0-2.0 |

**Sections:**
1. Incident Classification
2. Basic Information Extraction
3. NDIS Incident Details
4. Medical/Injury Information
5. Reporting Requirements
6. BSP Analysis
7. Follow-up Actions
8. Additional Information

---

### 5.16 BSP Prompt Sections (Super-Admin Only)

**Read & Update Only** - Cannot create or delete

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| section_number | number | 1-10 |
| section_name | text | |
| main_prompt | textarea | |
| field_prompts | JSON | |

**Sections:**
1. BSP Gaps Detected
2. Draft BSP Update
3. Trigger Alignment
4. Strategy Assessment
5. Identified Gaps Summary
6. BSP Internal Inconsistencies
7. Potentially Outdated Strategies
8. Skill Building Opportunities
9. Risk Insights
10. NDIS Compliance Assessment

---

## Phase 6: Roles & Permissions System

### 6.1 Permission Matrix

| Resource | View | Create | Edit | Delete |
|----------|------|--------|------|--------|
| Admins | view admins | create admins | edit admins | delete admins |
| Provider Companies | view provider companies | create provider companies | edit provider companies | delete provider companies |
| Provider Users | view provider users | create provider users | edit provider users | delete provider users |
| Services | view services | create services | edit services | delete services |
| Service Requests | view service requests | create service requests | edit service requests | delete service requests |
| Customers | view customers | create customers | edit customers | delete customers |
| Reviews | view reviews | create reviews | edit reviews | delete reviews |
| Customer Documents | view customer documents | create customer documents | edit customer documents | delete customer documents |
| Incident Types | view incident types | create incident types | edit incident types | delete incident types |
| Settings | view settings | - | - | - |

### 6.2 Super-Admin Only Features
- Roles Management
- Permissions Management
- Claim Requests
- Stripe Configuration & Products
- AI Models
- NDIS Prompt Definitions
- BSP Prompt Sections

### 6.3 PermissionGuard Component

```typescript
// src/components/PermissionGuard.tsx
interface PermissionGuardProps {
  permission: string | string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const PermissionGuard: React.FC<PermissionGuardProps> = ({
  permission,
  children,
  fallback = null
}) => {
  const { currentUser } = useAuthContext();

  const permissions = Array.isArray(permission) ? permission : [permission];
  const hasAccess = hasAnyPermission(currentUser, permissions);

  return hasAccess ? <>{children}</> : <>{fallback}</>;
};
```

---

## Phase 7: File Structure

```
src/
├── auth/
│   ├── pages/
│   │   └── Login.tsx
│   ├── providers/
│   │   └── AdminAuthProvider.tsx
│   ├── RequireAuth.tsx
│   ├── _models.ts
│   └── _helpers.ts
├── components/
│   ├── ui/                          # shadcn components
│   ├── data-grid/                   # DataGrid component
│   ├── PermissionGuard.tsx
│   └── ...
├── config/
│   ├── menu.config.tsx
│   └── settings.config.ts
├── layouts/
│   └── AdminLayout/
├── pages/
│   ├── dashboard/
│   │   ├── DashboardPage.tsx
│   │   └── blocks/
│   │       ├── SummaryCards.tsx
│   │       ├── IncidentCharts.tsx
│   │       ├── ComplianceStats.tsx
│   │       └── RecentActivity.tsx
│   ├── admins/
│   │   ├── AdminsPage.tsx
│   │   ├── AddAdminPage.tsx
│   │   ├── EditAdminPage.tsx
│   │   └── blocks/
│   │       ├── AdminsTable.tsx
│   │       └── AdminForm.tsx
│   ├── provider-companies/
│   │   ├── ProviderCompaniesPage.tsx
│   │   ├── AddProviderCompanyPage.tsx
│   │   ├── EditProviderCompanyPage.tsx
│   │   └── blocks/
│   │       ├── ProviderCompaniesTable.tsx
│   │       └── ProviderCompanyForm.tsx
│   ├── provider-users/
│   ├── customers/
│   ├── services/
│   ├── service-offerings/
│   ├── service-requests/
│   ├── reviews/
│   ├── incident-types/
│   ├── claim-requests/
│   ├── settings/
│   ├── stripe-config/
│   ├── stripe-products/
│   ├── ai-models/
│   ├── ndis-prompts/
│   ├── bsp-prompts/
│   └── roles-permissions/
├── services/
│   ├── api/
│   │   ├── admins.ts
│   │   ├── provider-companies.ts
│   │   ├── provider-users.ts
│   │   ├── customers.ts
│   │   ├── services.ts
│   │   ├── service-offerings.ts
│   │   ├── service-requests.ts
│   │   ├── reviews.ts
│   │   ├── incident-types.ts
│   │   ├── settings.ts
│   │   └── dashboard.ts
│   └── endpoints/
│       └── index.ts
├── routing/
│   └── AppRoutingSetup.tsx
└── types/
    └── index.ts
```

---

## Phase 8: Routes Configuration

```typescript
// src/routing/AppRoutingSetup.tsx
const AppRoutingSetup = () => {
  return (
    <Routes>
      {/* Protected Routes */}
      <Route element={<RequireAuth />}>
        <Route element={<AdminLayout />}>
          {/* Dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={<DashboardPage />} />

          {/* Admins */}
          <Route path="/admins" element={
            <PermissionGuard permission="view admins">
              <AdminsPage />
            </PermissionGuard>
          } />
          <Route path="/admins/add" element={
            <PermissionGuard permission="create admins">
              <AddAdminPage />
            </PermissionGuard>
          } />
          <Route path="/admins/:id/edit" element={
            <PermissionGuard permission="edit admins">
              <EditAdminPage />
            </PermissionGuard>
          } />

          {/* Provider Companies */}
          <Route path="/provider-companies" element={
            <PermissionGuard permission="view provider companies">
              <ProviderCompaniesPage />
            </PermissionGuard>
          } />
          <Route path="/provider-companies/add" element={
            <PermissionGuard permission="create provider companies">
              <AddProviderCompanyPage />
            </PermissionGuard>
          } />
          <Route path="/provider-companies/:id/edit" element={
            <PermissionGuard permission="edit provider companies">
              <EditProviderCompanyPage />
            </PermissionGuard>
          } />

          {/* ... other routes follow same pattern ... */}

          {/* Super-Admin Only Routes */}
          <Route path="/roles" element={
            <PermissionGuard permission="super-admin">
              <RolesPage />
            </PermissionGuard>
          } />
          <Route path="/permissions" element={
            <PermissionGuard permission="super-admin">
              <PermissionsPage />
            </PermissionGuard>
          } />
          <Route path="/claim-requests" element={
            <PermissionGuard permission="super-admin">
              <ClaimRequestsPage />
            </PermissionGuard>
          } />
          <Route path="/stripe-config" element={
            <PermissionGuard permission="super-admin">
              <StripeConfigPage />
            </PermissionGuard>
          } />
          <Route path="/stripe-products" element={
            <PermissionGuard permission="super-admin">
              <StripeProductsPage />
            </PermissionGuard>
          } />
          <Route path="/ai-models" element={
            <PermissionGuard permission="super-admin">
              <AIModelsPage />
            </PermissionGuard>
          } />
          <Route path="/ndis-prompts" element={
            <PermissionGuard permission="super-admin">
              <NDISPromptsPage />
            </PermissionGuard>
          } />
          <Route path="/bsp-prompts" element={
            <PermissionGuard permission="super-admin">
              <BSPPromptsPage />
            </PermissionGuard>
          } />
        </Route>
      </Route>

      {/* Auth Routes */}
      <Route path="/login" element={<LoginPage />} />

      {/* Error Routes */}
      <Route path="/error/404" element={<Error404 />} />
      <Route path="/error/403" element={<Error403 />} />
      <Route path="*" element={<Navigate to="/error/404" />} />
    </Routes>
  );
};
```

---

## Phase 9: Build & Deployment

### 9.1 Build Configuration

```json
// package.json scripts
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint src --fix"
  }
}
```

### 9.2 Build Command
```bash
npm run build
```

Output will be in `dist/` folder.

### 9.3 Deployment to Laravel

Copy build output to Laravel public folder:
```bash
# From admin-portal directory
cp -r dist/* ../providr/public/
```

Or configure Laravel to serve the SPA:
```php
// routes/web.php
Route::get('/{any}', function () {
    return file_get_contents(public_path('index.html'));
})->where('any', '^(?!api|nova).*$');
```

### 9.4 Nginx Configuration (Production)
```nginx
server {
    listen 80;
    server_name admin.providr.au;
    root /var/www/providr/public;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        try_files $uri $uri/ /index.php?$query_string;
    }
}
```

---

## Phase 10: Testing Checklist

### Authentication
- [ ] Login with valid credentials
- [ ] Login with invalid credentials shows error
- [ ] Logout clears session
- [ ] Token persists on page refresh
- [ ] Expired token redirects to login

### Dashboard
- [ ] Summary cards show correct data
- [ ] Charts render properly
- [ ] Recent activity updates
- [ ] Dashboard preferences save/load

### Each CRUD Resource
- [ ] List view with pagination
- [ ] Search functionality
- [ ] Sort by columns
- [ ] Create new record
- [ ] Edit existing record
- [ ] Delete with confirmation
- [ ] Form validation errors display
- [ ] Success/error notifications

### Permissions
- [ ] Menu items show/hide based on permissions
- [ ] Routes blocked for unauthorized users
- [ ] Super-admin has full access
- [ ] Regular admin has limited access

### File Uploads
- [ ] Image upload to S3 works
- [ ] Image preview displays
- [ ] File size validation

---

## Development Priority Order

1. **Week 1-2:** Project setup, Auth, Layout, Dashboard
2. **Week 3-4:** Provider Companies, Provider Users, Customers
3. **Week 5-6:** Services, Service Offerings, Service Requests
4. **Week 7:** Reviews, Incident Types, Settings
5. **Week 8:** Claim Requests, Roles & Permissions
6. **Week 9:** Stripe Configuration & Products
7. **Week 10:** AI Models, NDIS Prompts, BSP Prompts
8. **Week 11-12:** Testing, Bug fixes, Polish

---

## Notes for Developer

1. **Copy patterns from provider-portal** - The codebase has established patterns for forms, tables, and API calls. Reuse them.

2. **Use the existing DataGrid component** - It already supports server-side pagination, sorting, and filtering.

3. **Follow Metronic conventions** - Use the same CSS classes and component structure.

4. **API is ready** - All endpoints at `/api/admin/*` are implemented and tested.

5. **Test locally first** - Use `http://127.0.0.1:8000` with `php artisan serve`

6. **Admin credentials for testing:**
   - Email: `admin@admin.com`
   - Password: `12345678`

---

## Questions?

Contact the backend team if you need:
- Additional API endpoints
- Changes to response formats
- New permissions added
- Clarification on business logic
