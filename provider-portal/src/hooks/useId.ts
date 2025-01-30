import { v4 as uuidv4 } from 'uuid';

const useId = (type: 'string' | 'int' = 'string'): string | number => {
  const uuid = uuidv4();

  if (type === 'int') {
    // Convert the UUID string to an integer representation (hashing or reducing to a numeric value)
    return parseInt(uuid.replace(/-/g, '').slice(0, 15), 16);
  }

  // Default behavior: return as string
  return uuid;
};

export { useId };
