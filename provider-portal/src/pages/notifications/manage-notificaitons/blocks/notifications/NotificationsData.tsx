interface INotificationsData {
  notification: {
    title: string;
    description: string;
  };
  status: boolean;
  isEmail: boolean;
  isdisabled: boolean;
  isSms: boolean;
  lastUpdated: string;
}

const NotificationsData: INotificationsData[] = [
  {
    notification: {
      title: 'Service Request Notification',
      description:
        'You can tell us which services you want to receive request for by updating your service settings.'
    },
    status: true,
    isEmail: true,
    isSms: false,
    isdisabled: false,
    lastUpdated: '2023-10-01T12:00:00Z'
  },
  {
    notification: {
      title: 'Weekly Service Request Digest',
      description:
        'A weekly summary of all the service requests that have matched with your offerings.'
    },
    status: false,
    isEmail: true,
    isSms: false,
    isdisabled: true,
    lastUpdated: '2023-09-25T08:00:00Z'
  }
];

export { NotificationsData, type INotificationsData };
