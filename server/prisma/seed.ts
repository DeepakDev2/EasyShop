import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const img = (seed: string) => `https://picsum.photos/seed/${seed}/600/600`

async function main() {
  console.log('🌱 Seeding EasyShop...')

  // Clear in dependency order
  await prisma.wishlistItem.deleteMany()
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.cartItem.deleteMany()
  await prisma.productSpec.deleteMany()
  await prisma.productImage.deleteMany()
  await prisma.product.deleteMany()
  await prisma.category.deleteMany()
  console.log('🗑️  Cleared existing data')

  // ─── Categories ────────────────────────────────────────────────────────────
  const categories = await prisma.category.createMany({
    data: [
      { name: 'Mobiles', slug: 'mobiles', iconUrl: '📱' },
      { name: 'Electronics', slug: 'electronics', iconUrl: '💻' },
      { name: 'Fashion', slug: 'fashion', iconUrl: '👗' },
      { name: 'Home & Furniture', slug: 'home-furniture', iconUrl: '🛋️' },
      { name: 'Appliances', slug: 'appliances', iconUrl: '🏠' },
      { name: 'Books', slug: 'books', iconUrl: '📚' },
    ],
  })
  console.log(`✅ Created ${categories.count} categories`)

  const cats = await prisma.category.findMany()
  const catMap = Object.fromEntries(cats.map(c => [c.slug, c.id]))

  // ─── Products ──────────────────────────────────────────────────────────────
  type ProductInput = {
    name: string; slug: string; description: string; price: number
    originalPrice: number; stock: number; rating: number; ratingCount: number
    brand: string; categorySlug: string
    images: string[]; specs: { key: string; value: string }[]
  }

  const products: ProductInput[] = [
    // Mobiles
    {
      name: 'Samsung Galaxy S24 128GB Phantom Black',
      slug: 'samsung-galaxy-s24-128gb',
      description: 'Experience the next generation of AI-powered smartphones with the Galaxy S24.',
      price: 74999, originalPrice: 89999, stock: 42, rating: 4.4, ratingCount: 12847, brand: 'Samsung',
      categorySlug: 'mobiles',
      images: [img('samsung-s24'), img('samsung-s24-2'), img('samsung-s24-3')],
      specs: [
        { key: 'Display', value: '6.2" Dynamic AMOLED 2X, 2340x1080' },
        { key: 'Processor', value: 'Snapdragon 8 Gen 3' },
        { key: 'RAM', value: '8 GB' }, { key: 'Storage', value: '128 GB' },
        { key: 'Camera', value: '50MP + 12MP + 10MP Triple Camera' },
        { key: 'Battery', value: '4000 mAh, 25W Fast Charging' },
      ],
    },
    {
      name: 'iPhone 15 256GB Blue',
      slug: 'iphone-15-256gb-blue',
      description: 'iPhone 15 features a new design with Dynamic Island and a 48MP camera.',
      price: 79999, originalPrice: 89999, stock: 28, rating: 4.6, ratingCount: 9234, brand: 'Apple',
      categorySlug: 'mobiles',
      images: [img('iphone-15'), img('iphone-15-2')],
      specs: [
        { key: 'Display', value: '6.1" Super Retina XDR OLED' },
        { key: 'Chip', value: 'Apple A16 Bionic' },
        { key: 'Storage', value: '256 GB' },
        { key: 'Camera', value: '48MP Main + 12MP Ultra Wide' },
        { key: 'Battery', value: 'Up to 20 hours video playback' },
      ],
    },
    {
      name: 'Redmi Note 13 Pro 256GB',
      slug: 'redmi-note-13-pro-256gb',
      description: 'Redmi Note 13 Pro with 200MP camera and 67W turbo charging.',
      price: 24999, originalPrice: 29999, stock: 120, rating: 4.2, ratingCount: 5621, brand: 'Xiaomi',
      categorySlug: 'mobiles',
      images: [img('redmi-note13'), img('redmi-note13-2')],
      specs: [
        { key: 'Display', value: '6.67" AMOLED 120Hz' },
        { key: 'Processor', value: 'MediaTek Dimensity 7200 Ultra' },
        { key: 'RAM', value: '8 GB' }, { key: 'Storage', value: '256 GB' },
        { key: 'Camera', value: '200MP + 8MP + 2MP' },
        { key: 'Battery', value: '5100 mAh, 67W Fast Charging' },
      ],
    },

    // Electronics
    {
      name: 'MacBook Air M2 8GB 256GB',
      slug: 'macbook-air-m2-8gb-256gb',
      description: 'Supercharged by M2 chip. Strikingly thin design, all-day battery life.',
      price: 99999, originalPrice: 114999, stock: 15, rating: 4.8, ratingCount: 3412, brand: 'Apple',
      categorySlug: 'electronics',
      images: [img('macbook-air'), img('macbook-air-2')],
      specs: [
        { key: 'Chip', value: 'Apple M2 8-core CPU, 8-core GPU' },
        { key: 'RAM', value: '8 GB Unified Memory' },
        { key: 'Storage', value: '256 GB SSD' },
        { key: 'Display', value: '13.6" Liquid Retina, 2560x1664' },
        { key: 'Battery', value: 'Up to 18 hours' },
        { key: 'Weight', value: '1.24 kg' },
      ],
    },
    {
      name: 'Sony WH-1000XM5 Wireless Headphones',
      slug: 'sony-wh-1000xm5-headphones',
      description: 'Industry-leading noise canceling with Auto NC Optimizer.',
      price: 26990, originalPrice: 34990, stock: 60, rating: 4.7, ratingCount: 7823, brand: 'Sony',
      categorySlug: 'electronics',
      images: [img('sony-headphones'), img('sony-headphones-2')],
      specs: [
        { key: 'Type', value: 'Over-ear, Wireless' },
        { key: 'Driver', value: '30mm' },
        { key: 'Battery', value: '30 hours playback' },
        { key: 'Noise Canceling', value: 'Yes, Industry Leading ANC' },
        { key: 'Connectivity', value: 'Bluetooth 5.2, 3.5mm Jack' },
      ],
    },
    {
      name: 'Samsung 55" 4K UHD Smart TV',
      slug: 'samsung-55-4k-uhd-smart-tv',
      description: 'Crystal UHD 4K TV with PurColor and Crystal Processor 4K.',
      price: 44999, originalPrice: 64999, stock: 22, rating: 4.3, ratingCount: 4102, brand: 'Samsung',
      categorySlug: 'electronics',
      images: [img('samsung-tv'), img('samsung-tv-2')],
      specs: [
        { key: 'Screen Size', value: '55 Inches' },
        { key: 'Resolution', value: '4K UHD (3840x2160)' },
        { key: 'Smart TV', value: 'Yes, Tizen OS' },
        { key: 'Refresh Rate', value: '60 Hz' },
        { key: 'HDR', value: 'HDR10+' },
      ],
    },

    // Fashion
    {
      name: "Levi's 511 Slim Fit Jeans Dark Blue",
      slug: 'levis-511-slim-fit-jeans-dark-blue',
      description: "Classic Levi's 511 slim fit jeans in dark blue wash.",
      price: 2999, originalPrice: 4999, stock: 200, rating: 4.3, ratingCount: 8901, brand: "Levi's",
      categorySlug: 'fashion',
      images: [img('levis-jeans'), img('levis-jeans-2')],
      specs: [
        { key: 'Fit', value: 'Slim Fit' }, { key: 'Material', value: '99% Cotton, 1% Elastane' },
        { key: 'Closure', value: 'Zip Fly with Button' }, { key: 'Wash', value: 'Dark Blue' },
      ],
    },
    {
      name: 'Nike Air Max 270 Running Shoes',
      slug: 'nike-air-max-270-running-shoes',
      description: 'The Nike Air Max 270 delivers unrivaled, all-day comfort.',
      price: 8495, originalPrice: 11995, stock: 85, rating: 4.5, ratingCount: 6234, brand: 'Nike',
      categorySlug: 'fashion',
      images: [img('nike-air-max'), img('nike-air-max-2')],
      specs: [
        { key: 'Type', value: 'Running / Casual' }, { key: 'Upper', value: 'Mesh and synthetic' },
        { key: 'Sole', value: 'Rubber' }, { key: 'Closure', value: 'Lace-up' },
      ],
    },

    // Home & Furniture
    {
      name: 'Wakefit Orthopaedic Memory Foam Mattress Queen 6"',
      slug: 'wakefit-orthopaedic-memory-foam-mattress-queen',
      description: 'Dual comfort mattress with memory foam layer for pressure relief.',
      price: 9999, originalPrice: 15999, stock: 30, rating: 4.5, ratingCount: 11234, brand: 'Wakefit',
      categorySlug: 'home-furniture',
      images: [img('wakefit-mattress'), img('wakefit-mattress-2')],
      specs: [
        { key: 'Size', value: 'Queen (60x78 inches)' }, { key: 'Thickness', value: '6 Inches' },
        { key: 'Material', value: 'Memory Foam + High Density Base' },
        { key: 'Warranty', value: '10 Years' },
      ],
    },
    {
      name: 'Solimo Engineered Wood Coffee Table',
      slug: 'solimo-engineered-wood-coffee-table',
      description: 'Modern coffee table with shelf storage. Easy to assemble.',
      price: 5999, originalPrice: 8999, stock: 45, rating: 4.1, ratingCount: 2341, brand: 'Solimo',
      categorySlug: 'home-furniture',
      images: [img('coffee-table'), img('coffee-table-2')],
      specs: [
        { key: 'Material', value: 'Engineered Wood' }, { key: 'Dimensions', value: '100x55x45 cm' },
        { key: 'Color', value: 'Walnut Brown' }, { key: 'Assembly', value: 'Required' },
      ],
    },

    // Appliances
    {
      name: 'LG 260L Double Door Refrigerator',
      slug: 'lg-260l-double-door-refrigerator',
      description: 'LG Smart Inverter Compressor refrigerator with Door Cooling+.',
      price: 22990, originalPrice: 32990, stock: 18, rating: 4.4, ratingCount: 3892, brand: 'LG',
      categorySlug: 'appliances',
      images: [img('lg-fridge'), img('lg-fridge-2')],
      specs: [
        { key: 'Capacity', value: '260 Litres' }, { key: 'Type', value: 'Double Door, Frost Free' },
        { key: 'Star Rating', value: '3 Star' }, { key: 'Compressor', value: 'Smart Inverter' },
        { key: 'Warranty', value: '1 Year on Product, 10 Years on Compressor' },
      ],
    },
    {
      name: 'Philips Air Fryer HD9252 1400W',
      slug: 'philips-air-fryer-hd9252-1400w',
      description: 'Rapid Air Technology for healthy frying with up to 90% less fat.',
      price: 6999, originalPrice: 10999, stock: 55, rating: 4.4, ratingCount: 5678, brand: 'Philips',
      categorySlug: 'appliances',
      images: [img('philips-airfryer'), img('philips-airfryer-2')],
      specs: [
        { key: 'Capacity', value: '4.1 Litres' }, { key: 'Power', value: '1400 Watts' },
        { key: 'Temperature', value: '80°C to 200°C' }, { key: 'Timer', value: 'Up to 60 min' },
      ],
    },

    // Books
    {
      name: 'Atomic Habits by James Clear',
      slug: 'atomic-habits-james-clear',
      description: 'An Easy & Proven Way to Build Good Habits & Break Bad Ones.',
      price: 299, originalPrice: 499, stock: 500, rating: 4.8, ratingCount: 45231, brand: 'Penguin Books',
      categorySlug: 'books',
      images: [img('atomic-habits'), img('atomic-habits-2')],
      specs: [
        { key: 'Author', value: 'James Clear' }, { key: 'Publisher', value: 'Penguin Random House' },
        { key: 'Pages', value: '320' }, { key: 'Language', value: 'English' },
        { key: 'ISBN', value: '978-1847941831' },
      ],
    },
    {
      name: 'The Psychology of Money by Morgan Housel',
      slug: 'psychology-of-money-morgan-housel',
      description: 'Timeless lessons on wealth, greed, and happiness.',
      price: 349, originalPrice: 499, stock: 350, rating: 4.7, ratingCount: 28910, brand: 'Jaico Books',
      categorySlug: 'books',
      images: [img('psychology-money'), img('psychology-money-2')],
      specs: [
        { key: 'Author', value: 'Morgan Housel' }, { key: 'Publisher', value: 'Harriman House' },
        { key: 'Pages', value: '256' }, { key: 'Language', value: 'English' },
      ],
    },
  ]

  let productCount = 0
  for (const p of products) {
    await prisma.product.create({
      data: {
        name: p.name, slug: p.slug, description: p.description,
        price: p.price, originalPrice: p.originalPrice,
        stock: p.stock, rating: p.rating, ratingCount: p.ratingCount,
        brand: p.brand, categoryId: catMap[p.categorySlug],
        images: {
          create: p.images.map((url, i) => ({ url, isPrimary: i === 0, displayOrder: i })),
        },
        specs: {
          create: p.specs.map((s, i) => ({ specKey: s.key, specValue: s.value, displayOrder: i })),
        },
      },
    })
    productCount++
  }

  console.log(`✅ Created ${productCount} products`)
  console.log('🎉 Seed complete!')
  await prisma.$disconnect()
}

main().catch(e => { console.error('❌ Seed failed:', e); process.exit(1) })
