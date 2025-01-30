interface IUsersData {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  admin: number;
  job_role: string;
  phone: string;
  active: number;
  permission_billing: number;
  permission_editor: number;
  permission_intake: number;
  permission_review: number;
}
// enum ServiceType {
//   Gardening = 'Gardening',
//   DayCenter = 'Day Center',
//   Cleaning = 'Cleaning'
// }

// const UsersData: IUsersData[] = [
//   {
//     service: ServiceType.Gardening,
//     description: 'Lawn maintenance and gardening services for residential properties.',
//     deliveringMean: 'In-Person',
//     supportedAgeGroup: 18,
//     supportedLanguage: 'English, Spanish',
//     deliveringAddress: '123 Green St, Springfield',
//     ServiceAvailableAddress: 'Springfield, Boston',
//     status: true,
//     lastModified: '26 December 2024'
//   },
//   {
//     service: ServiceType.DayCenter,
//     description: 'A safe and engaging environment for elderly individuals during the day.',
//     deliveringMean: 'In-Person',
//     supportedAgeGroup: 65,
//     supportedLanguage: 'English',
//     deliveringAddress: '456 Day Center Ave, Los Angeles',
//     ServiceAvailableAddress: 'Los Angeles, San Diego',
//     status: true,
//     lastModified: '26 December 2024'
//   },
//   {
//     service: ServiceType.Cleaning,
//     description: 'Professional home and office cleaning services.',
//     deliveringMean: 'In-Person',
//     supportedAgeGroup: 18,
//     supportedLanguage: 'English',
//     deliveringAddress: '789 Clean Rd, Miami',
//     ServiceAvailableAddress: 'Miami, Orlando',
//     status: true,
//     lastModified: '26 December 2024'
//   },
//   {
//     service: ServiceType.Gardening,
//     description: 'Seasonal gardening services including planting and pruning.',
//     deliveringMean: 'In-Person',
//     supportedAgeGroup: 18,
//     supportedLanguage: 'English, French',
//     deliveringAddress: '123 Green St, Springfield',
//     ServiceAvailableAddress: 'New York, Boston',
//     status: false,
//     lastModified: '26 December 2024'
//   },
//   {
//     service: ServiceType.DayCenter,
//     description: 'Daycare services for seniors with recreational activities.',
//     deliveringMean: 'In-Person',
//     supportedAgeGroup: 60,
//     supportedLanguage: 'English, Hindi',
//     deliveringAddress: '101 Care Blvd, Houston',
//     ServiceAvailableAddress: 'Houston, Dallas',
//     status: true,
//     lastModified: '26 December 2024'
//   },
//   {
//     service: ServiceType.Cleaning,
//     description: 'Deep cleaning services for homes, including carpet and upholstery.',
//     deliveringMean: 'In-Person',
//     supportedAgeGroup: 21,
//     supportedLanguage: 'English, Spanish',
//     deliveringAddress: '789 Clean Rd, Miami',
//     ServiceAvailableAddress: 'Chicago, Miami',
//     status: false,
//     lastModified: '26 December 2024'
//   },
//   {
//     service: ServiceType.Gardening,
//     description: 'Customized gardening plans for urban households.',
//     deliveringMean: 'In-Person',
//     supportedAgeGroup: 25,
//     supportedLanguage: 'English, Portuguese',
//     deliveringAddress: '456 Garden Ave, San Francisco',
//     ServiceAvailableAddress: 'San Francisco, Oakland',
//     status: true,
//     lastModified: '26 December 2024'
//   },
//   {
//     service: ServiceType.DayCenter,
//     description: 'Full-day care services for seniors with meals provided.',
//     deliveringMean: 'In-Person',
//     supportedAgeGroup: 70,
//     supportedLanguage: 'English',
//     deliveringAddress: '303 Senior Lane, Austin',
//     ServiceAvailableAddress: 'Austin, San Antonio',
//     status: true,
//     lastModified: '26 December 2024'
//   },
//   {
//     service: ServiceType.Cleaning,
//     description: 'Eco-friendly cleaning services using biodegradable products.',
//     deliveringMean: 'In-Person',
//     supportedAgeGroup: 18,
//     supportedLanguage: 'English, French',
//     deliveringAddress: '456 Clean Blvd, Seattle',
//     ServiceAvailableAddress: 'Seattle, Portland',
//     status: true,
//     lastModified: '26 December 2024'
//   },
//   {
//     service: ServiceType.Gardening,
//     description: 'Gardening workshops and consultation services.',
//     deliveringMean: 'Online',
//     supportedAgeGroup: 30,
//     supportedLanguage: 'English, Spanish',
//     deliveringAddress: 'www.gardeningworkshops.com',
//     ServiceAvailableAddress: 'Global',
//     status: true,
//     lastModified: '26 December 2024'
//   }
// ];

// const UsersData: IUsersData[] = [
//   {
//     matchId: '12345',
//     participantName: 'John Doe',
//     status: true,
//     service: 'Service A',
//     location: 'New York',
//     actioned: 'Yes'
//   },
//   {
//     matchId: '67890',
//     participantName: 'Jane Smith',
//     status: false,
//     service: 'Service B',
//     location: 'Los Angeles',
//     actioned: 'No'
//   },
//   {
//     matchId: '11223',
//     participantName: 'Alice Johnson',
//     status: true,
//     service: 'Service C',
//     location: 'Chicago',
//     actioned: 'Yes'
//   },
//   {
//     matchId: '44556',
//     participantName: 'Bob Brown',
//     status: false,
//     service: 'Service D',
//     location: 'Houston',
//     actioned: 'No'
//   },
//   {
//     matchId: '77889',
//     participantName: 'Charlie Davis',
//     status: true,
//     service: 'Service E',
//     location: 'Phoenix',
//     actioned: 'Yes'
//   }
//   // Add more data objects as needed
// ];

export { type IUsersData };
