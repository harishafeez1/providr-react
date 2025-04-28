import { type TMenuConfig } from '@/components/menu';

export const MENU_SIDEBAR: TMenuConfig = [
  {
    heading: 'Dashboard'
  },
  {
    title: 'Company Profile',
    icon: 'user-square',
    path: '/',
    permission: ['admin', 'editor', 'intake', 'review']
  },
  {
    title: 'Premises',
    icon: 'geolocation',
    path: '/premises',
    permission: ['admin', 'editor']
  },
  {
    title: 'Specialisations',
    icon: 'shield-tick',
    path: '/specialisations',
    permission: ['admin', 'editor']
  },
  {
    title: 'Service Offerings',
    icon: 'ki-solid ki-tag',
    path: '/service-offerings',
    permission: ['admin', 'editor']
  },
  {
    title: 'Service Requests',
    icon: 'profile-circle',
    path: '/service-request/my-service-request',
    permission: ['admin', 'intake']
  },
  // {
  //   title: 'Direct Connect',
  //   icon: 'arrow-zigzag',
  //   path: '/direct-connect',
  //   permission: ['admin', 'intake']
  // },
  {
    title: 'Reviews',
    icon: 'heart-circle',
    path: '/reviews',
    permission: ['admin', 'review']
  },
  {
    title: 'Analytics',
    icon: 'graph-2',
    path: '/analytics',
    permission: ['admin', 'editor']
  },
  {
    title: 'Users',
    icon: 'people',
    path: '/users',
    permission: ['admin']
  },
  {
    title: 'Billing',
    icon: 'two-credit-cart',
    path: '/billing',
    permission: ['admin', 'billing']
  },
  {
    title: 'Invoices',
    icon: 'cheque',
    path: '/invoices',
    permission: ['admin', 'billing']
  },
  {
    title: 'Notification Settings',
    icon: 'notification',
    path: '/notifications',
    permission: ['admin', 'intake']
  },
  {
    title: 'Resources',
    icon: 'book',
    path: '/resources',
    disabled: true
  }
  // {
  //   title: 'See Provider Profile',
  //   icon: 'book',
  //   path: '/company-profile',
  //   isButton: true,
  //   permission: ['admin', 'editor', 'intake', 'review']
  // }
];

export const MENU_MEGA: TMenuConfig = [
  {
    title: 'Services',
    path: '/'
  },
  {
    title: 'Directory',
    path: '/'
  },
  {
    title: 'About Us',
    path: '/'
  },
  {
    title: 'Blog',
    path: '/'
  },
  {
    title: 'For Business',
    children: [
      {
        title: 'Getting 1',
        icon: 'coffee',
        path: 'https://keenthemes.com/metronic/tailwind/docs/getting-started/installation'
      },
      {
        title: 'Documentation',
        icon: 'questionnaire-tablet',
        path: 'https://keenthemes.com/metronic/tailwind/docs'
      }
    ]
  },
  {
    title: 'Help',
    children: [
      {
        title: 'Getting Started',
        icon: 'coffee',
        path: 'https://keenthemes.com/metronic/tailwind/docs/getting-started/installation'
      },
      {
        title: 'Documentation',
        icon: 'questionnaire-tablet',
        path: 'https://keenthemes.com/metronic/tailwind/docs'
      }
    ]
  }
];

export const MENU_ROOT: TMenuConfig = [
  {
    title: 'Public Profile',
    icon: 'profile-circle',
    rootPath: '/public-profile/',
    path: 'public-profile/profiles/default',
    childrenIndex: 2
  },
  {
    title: 'Account',
    icon: 'setting-2',
    rootPath: '/account/',
    path: '/',
    childrenIndex: 3
  },
  {
    title: 'Network',
    icon: 'users',
    rootPath: '/network/',
    path: 'network/get-started',
    childrenIndex: 4
  },
  {
    title: 'Authentication',
    icon: 'security-user',
    rootPath: '/authentication/',
    path: 'authentication/get-started',
    childrenIndex: 5
  }
];
