interface IPremisesData {
  id: string | number;
  name: string;
  active: string;
  address_line_1: string;
  address_line_2: string;
  suburb: string;
  state: string;
  post_code: string;
  phone: string;
  email: string;
}
// enum ServiceType {
//   Gardening = 'Gardening',
//   DayCenter = 'Day Center',
//   Cleaning = 'Cleaning'
// }

// const PremisesData: IPremisesData[] = [
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

export { type IPremisesData };
