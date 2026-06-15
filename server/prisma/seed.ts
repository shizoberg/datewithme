import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const venues = [
    // İzmir - Alsancak
    { name: 'Manda Cafe', category: 'cafe', city: 'İzmir', district: 'Alsancak', rating: 4.4, priceLevel: 2 },
    { name: 'Urban Station Alsancak', category: 'cafe', city: 'İzmir', district: 'Alsancak', rating: 4.3, priceLevel: 2 },
    { name: 'Bohemian Bar', category: 'bar', city: 'İzmir', district: 'Alsancak', rating: 4.2, priceLevel: 2 },
    // İzmir - Konak
    { name: 'Kordon Sahili', category: 'park', city: 'İzmir', district: 'Konak', rating: 4.8, priceLevel: 1 },
    { name: 'Roof Lounge', category: 'rooftop', city: 'İzmir', district: 'Konak', rating: 4.5, priceLevel: 3 },
    // İzmir - Karşıyaka
    { name: 'Karşıyaka Sahili', category: 'park', city: 'İzmir', district: 'Karşıyaka', rating: 4.7, priceLevel: 1 },
    { name: 'Cafe Nero Karşıyaka', category: 'cafe', city: 'İzmir', district: 'Karşıyaka', rating: 4.1, priceLevel: 2 },
    // İstanbul - Kadıköy
    { name: 'Moda Sahili', category: 'park', city: 'İstanbul', district: 'Kadıköy', rating: 4.8, priceLevel: 1 },
    { name: 'Paper Cup', category: 'cafe', city: 'İstanbul', district: 'Kadıköy', rating: 4.6, priceLevel: 2 },
    { name: 'Arkaoda', category: 'bar', city: 'İstanbul', district: 'Kadıköy', rating: 4.5, priceLevel: 2 },
    { name: 'Cuma', category: 'restaurant', city: 'İstanbul', district: 'Kadıköy', rating: 4.4, priceLevel: 2 },
    // İstanbul - Beşiktaş
    { name: 'Kronotrop Coffee', category: 'cafe', city: 'İstanbul', district: 'Beşiktaş', rating: 4.7, priceLevel: 2 },
    { name: 'Abdi İpekçi Parkı', category: 'park', city: 'İstanbul', district: 'Beşiktaş', rating: 4.6, priceLevel: 1 },
    { name: 'Lucca', category: 'restaurant', city: 'İstanbul', district: 'Beşiktaş', rating: 4.5, priceLevel: 3 },
    // İstanbul - Beyoğlu
    { name: 'Mikla', category: 'rooftop', city: 'İstanbul', district: 'Beyoğlu', rating: 4.7, priceLevel: 3 },
    { name: 'Pano Şaraphane', category: 'bar', city: 'İstanbul', district: 'Beyoğlu', rating: 4.3, priceLevel: 2 },
    // Ankara - Çankaya
    { name: 'Tunalı Hilmi Caddesi', category: 'cultural', city: 'Ankara', district: 'Çankaya', rating: 4.4, priceLevel: 2 },
    { name: 'Kuğulu Park', category: 'park', city: 'Ankara', district: 'Çankaya', rating: 4.6, priceLevel: 1 },
  ]

  for (const v of venues) {
    const exists = await prisma.venue.findFirst({ where: { name: v.name, city: v.city } })
    if (!exists) {
      await prisma.venue.create({ data: v })
    }
  }

  console.log(`Seeded ${venues.length} venues`)
}

main().catch(console.error).finally(() => prisma.$disconnect())
