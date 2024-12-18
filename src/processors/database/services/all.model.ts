export interface User {
  id?: number;
  name: string;
  age: number;
  createdAt: Date; // This will typically be a Date object if you are using Prisma's DateTime field

  address?: Record<string, any>;
  additionalInfo?: Record<string, any>;
}
