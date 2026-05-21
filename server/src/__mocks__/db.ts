// Mock Prisma client — prevents real DB calls during tests
const prismaMock = {
  user: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  product: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
    findFirst: jest.fn(),
  },
  category: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
  },
  order: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  orderItem: {
    findMany: jest.fn(),
  },
  wishlistItem: {
    findUnique: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
    findMany: jest.fn(),
  },
  $transaction: jest.fn(),
}

export const prisma = prismaMock
