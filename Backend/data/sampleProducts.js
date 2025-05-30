// Sample products with seller information
export const getSampleProducts = (sellers) => [
  // Hot Coffee - Coffee Central
  {
    name: 'Americano',
    description: 'Rich espresso with hot water - our signature blend',
    category: 'hot',
    basePrice: 3.50,
    image: '/images/americano.jpg',
    sizes: [
      { name: 'small', priceModifier: -0.50 },
      { name: 'medium', priceModifier: 0 },
      { name: 'large', priceModifier: 0.50 }
    ],
    addOns: [
      { name: 'Extra Shot', price: 0.75 },
      { name: 'Vanilla Syrup', price: 0.50 },
      { name: 'Caramel Syrup', price: 0.50 }
    ],
    sellerId: sellers[0]._id,
    shopName: sellers[0].shopName,
    preparationTime: 3,
    featured: true
  },
  {
    name: 'Cappuccino',
    description: 'Espresso with steamed milk and foam - Italian style',
    category: 'hot',
    basePrice: 4.25,
    image: '/images/cappuccino.jpg',
    sizes: [
      { name: 'small', priceModifier: -0.50 },
      { name: 'medium', priceModifier: 0 },
      { name: 'large', priceModifier: 0.50 }
    ],
    addOns: [
      { name: 'Extra Shot', price: 0.75 },
      { name: 'Cinnamon', price: 0.25 },
      { name: 'Chocolate Powder', price: 0.25 }
    ],
    sellerId: sellers[0]._id,
    shopName: sellers[0].shopName,
    preparationTime: 4,
    featured: false
  },
  {
    name: 'Latte',
    description: 'Espresso with steamed milk - smooth and creamy',
    category: 'hot',
    basePrice: 4.75,
    image: '/images/latte.jpg',
    sizes: [
      { name: 'small', priceModifier: -0.50 },
      { name: 'medium', priceModifier: 0 },
      { name: 'large', priceModifier: 0.50 }
    ],
    addOns: [
      { name: 'Extra Shot', price: 0.75 },
      { name: 'Vanilla Syrup', price: 0.50 },
      { name: 'Hazelnut Syrup', price: 0.50 }
    ],
    sellerId: sellers[0]._id,
    shopName: sellers[0].shopName,
    preparationTime: 4,
    featured: true
  },

  // Iced Coffee - Bean Paradise
  {
    name: 'Iced Americano',
    description: 'Espresso with cold water over ice - refreshing and bold',
    category: 'iced',
    basePrice: 3.75,
    image: '/images/iced-americano.jpg',
    sizes: [
      { name: 'small', priceModifier: -0.50 },
      { name: 'medium', priceModifier: 0 },
      { name: 'large', priceModifier: 0.50 }
    ],
    addOns: [
      { name: 'Extra Shot', price: 0.75 },
      { name: 'Simple Syrup', price: 0.50 },
      { name: 'Vanilla Syrup', price: 0.50 }
    ],
    sellerId: sellers[1]._id,
    shopName: sellers[1].shopName,
    preparationTime: 3,
    featured: true
  },
  {
    name: 'Iced Latte',
    description: 'Espresso with cold milk over ice - paradise in a cup',
    category: 'iced',
    basePrice: 5.00,
    image: '/images/iced-latte.jpg',
    sizes: [
      { name: 'small', priceModifier: -0.50 },
      { name: 'medium', priceModifier: 0 },
      { name: 'large', priceModifier: 0.50 }
    ],
    addOns: [
      { name: 'Extra Shot', price: 0.75 },
      { name: 'Caramel Syrup', price: 0.50 },
      { name: 'Vanilla Syrup', price: 0.50 }
    ],
    sellerId: sellers[1]._id,
    shopName: sellers[1].shopName,
    preparationTime: 4,
    featured: false
  },
  {
    name: 'Cold Brew',
    description: 'Slow-steeped coffee served cold - smooth and strong',
    category: 'iced',
    basePrice: 4.50,
    image: '/images/cold-brew.jpg',
    sizes: [
      { name: 'medium', priceModifier: 0 },
      { name: 'large', priceModifier: 0.75 }
    ],
    addOns: [
      { name: 'Vanilla Syrup', price: 0.50 },
      { name: 'Caramel Syrup', price: 0.50 },
      { name: 'Oat Milk', price: 0.60 }
    ],
    sellerId: sellers[1]._id,
    shopName: sellers[1].shopName,
    preparationTime: 2,
    featured: true
  },

  // Frappes - Brew Masters
  {
    name: 'Caramel Frappe',
    description: 'Blended coffee with caramel and whipped cream - master crafted',
    category: 'frappe',
    basePrice: 5.75,
    image: '/images/caramel-frappe.jpg',
    sizes: [
      { name: 'medium', priceModifier: 0 },
      { name: 'large', priceModifier: 0.75 }
    ],
    addOns: [
      { name: 'Extra Shot', price: 0.75 },
      { name: 'Extra Whipped Cream', price: 0.50 },
      { name: 'Chocolate Drizzle', price: 0.50 }
    ],
    sellerId: sellers[2]._id,
    shopName: sellers[2].shopName,
    preparationTime: 5,
    featured: true
  },
  {
    name: 'Mocha Frappe',
    description: 'Blended coffee with chocolate and whipped cream - decadent delight',
    category: 'frappe',
    basePrice: 5.75,
    image: '/images/mocha-frappe.jpg',
    sizes: [
      { name: 'medium', priceModifier: 0 },
      { name: 'large', priceModifier: 0.75 }
    ],
    addOns: [
      { name: 'Extra Shot', price: 0.75 },
      { name: 'Extra Whipped Cream', price: 0.50 },
      { name: 'Caramel Drizzle', price: 0.50 }
    ],
    sellerId: sellers[2]._id,
    shopName: sellers[2].shopName,
    preparationTime: 5,
    featured: false
  },
  {
    name: 'Vanilla Bean Frappe',
    description: 'Creamy vanilla blended with coffee - smooth perfection',
    category: 'frappe',
    basePrice: 5.50,
    image: '/images/vanilla-frappe.jpg',
    sizes: [
      { name: 'medium', priceModifier: 0 },
      { name: 'large', priceModifier: 0.75 }
    ],
    addOns: [
      { name: 'Extra Shot', price: 0.75 },
      { name: 'Extra Whipped Cream', price: 0.50 },
      { name: 'Vanilla Drizzle', price: 0.50 }
    ],
    sellerId: sellers[2]._id,
    shopName: sellers[2].shopName,
    preparationTime: 5,
    featured: true
  },

  // Additional specialty items from different shops
  {
    name: 'Espresso Romano',
    description: 'Traditional espresso with lemon twist - authentic Italian',
    category: 'hot',
    basePrice: 2.75,
    image: '/images/espresso-romano.jpg',
    sizes: [
      { name: 'single', priceModifier: 0 },
      { name: 'double', priceModifier: 1.00 }
    ],
    addOns: [
      { name: 'Extra Lemon', price: 0.25 },
      { name: 'Sugar Cube', price: 0.10 }
    ],
    sellerId: sellers[0]._id,
    shopName: sellers[0].shopName,
    preparationTime: 2,
    featured: false
  },
  {
    name: 'Nitro Cold Brew',
    description: 'Cold brew infused with nitrogen - silky smooth texture',
    category: 'iced',
    basePrice: 5.25,
    image: '/images/nitro-cold-brew.jpg',
    sizes: [
      { name: 'medium', priceModifier: 0 },
      { name: 'large', priceModifier: 0.75 }
    ],
    addOns: [
      { name: 'Vanilla Sweet Cream', price: 0.75 },
      { name: 'Caramel Drizzle', price: 0.50 }
    ],
    sellerId: sellers[1]._id,
    shopName: sellers[1].shopName,
    preparationTime: 3,
    featured: true
  },
  {
    name: 'Cookies & Cream Frappe',
    description: 'Blended coffee with cookie pieces and cream - indulgent treat',
    category: 'frappe',
    basePrice: 6.25,
    image: '/images/cookies-cream-frappe.jpg',
    sizes: [
      { name: 'medium', priceModifier: 0 },
      { name: 'large', priceModifier: 0.75 }
    ],
    addOns: [
      { name: 'Extra Cookies', price: 0.75 },
      { name: 'Extra Whipped Cream', price: 0.50 },
      { name: 'Chocolate Chips', price: 0.60 }
    ],
    sellerId: sellers[2]._id,
    shopName: sellers[2].shopName,
    preparationTime: 6,
    featured: true
  }
];
