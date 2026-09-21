const db = require('./config/db');

async function seedTenProducts() {
  console.log('Ensuring Kitchen & Dining category...');
  await db.query(`
    INSERT INTO categories (name, slug)
    VALUES ('Kitchen & Dining', 'kitchen-dining')
    ON CONFLICT (slug) DO NOTHING
  `);

  const [categories] = await db.query('SELECT id, slug FROM categories');
  const catMap = {};
  categories.forEach(c => { catMap[c.slug] = c.id; });

  const products = [
    {
      name: 'Stoneware Matte Teapot',
      slug: 'stoneware-matte-teapot',
      description: 'Handcrafted Japanese-inspired stoneware teapot with a textured matte ceramic finish and heat-resistant brass handle.',
      price: 58.00,
      discount_price: null,
      category_id: catMap['kitchen-dining'] || 1,
      stock: 22,
      rating: 4.85,
      review_count: 34,
      is_featured: false,
      is_on_sale: false,
      image_url: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800&q=80'
    },
    {
      name: 'Woven Rattan Storage Basket',
      slug: 'woven-rattan-storage-basket',
      description: 'Artisanal hand-woven natural rattan basket with fitted handles. Ideal for blankets, magazines, or everyday essentials.',
      price: 42.00,
      discount_price: 34.99,
      category_id: catMap['organization'] || 2,
      stock: 18,
      rating: 4.70,
      review_count: 21,
      is_featured: false,
      is_on_sale: true,
      image_url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&q=80'
    },
    {
      name: 'Walnut Wood Coffee Scoop',
      slug: 'walnut-wood-coffee-scoop',
      description: 'Carved from sustainably harvested North American walnut wood. Ergonomic handle and precise single-cup measurement.',
      price: 18.00,
      discount_price: null,
      category_id: catMap['kitchen-dining'] || 1,
      stock: 45,
      rating: 4.90,
      review_count: 52,
      is_featured: false,
      is_on_sale: false,
      image_url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&q=80'
    },
    {
      name: 'Pure Beeswax Pillar Candle',
      slug: 'pure-beeswax-pillar-candle',
      description: '100% natural, unscented beeswax candle with an unbleached organic cotton wick. Burns cleanly with a gentle honey aroma.',
      price: 28.00,
      discount_price: 22.50,
      category_id: catMap['wellness'] || 3,
      stock: 30,
      rating: 4.80,
      review_count: 19,
      is_featured: false,
      is_on_sale: true,
      image_url: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=800&q=80'
    },
    {
      name: 'Brushed Brass Table Lamp',
      slug: 'brushed-brass-table-lamp',
      description: 'Minimalist mid-century modern accent lamp in brushed satin brass with a frosted spherical glass shade.',
      price: 120.00,
      discount_price: 99.00,
      category_id: catMap['home-decor'] || 1,
      stock: 12,
      rating: 4.95,
      review_count: 28,
      is_featured: true,
      is_on_sale: true,
      image_url: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80'
    },
    {
      name: 'Handmade Ceramic Pour-Over Dripper',
      slug: 'handmade-ceramic-pour-over-dripper',
      description: 'Ribbed interior slow-drip coffee brewer made of high-fired speckled stoneware. Fits standard cone coffee filters.',
      price: 32.00,
      discount_price: null,
      category_id: catMap['kitchen-dining'] || 1,
      stock: 25,
      rating: 4.75,
      review_count: 40,
      is_featured: false,
      is_on_sale: false,
      image_url: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=800&q=80'
    },
    {
      name: 'Organic Cotton Bath Towel Set',
      slug: 'organic-cotton-bath-towel-set',
      description: 'Set of two ultra-soft plush bath towels made from 700 GSM GOTS-certified organic Turkish cotton in oatmeal beige.',
      price: 65.00,
      discount_price: 52.00,
      category_id: catMap['wellness'] || 3,
      stock: 16,
      rating: 4.85,
      review_count: 33,
      is_featured: false,
      is_on_sale: true,
      image_url: 'https://images.unsplash.com/photo-1616627547584-bf28cee262db?w=800&q=80'
    },
    {
      name: 'Solid Oak Floating Wall Shelf',
      slug: 'solid-oak-floating-wall-shelf',
      description: 'Seamless concealed-mount floating shelf crafted from white European oak with an organic matte wax finish.',
      price: 72.00,
      discount_price: null,
      category_id: catMap['home-decor'] || 1,
      stock: 20,
      rating: 4.90,
      review_count: 15,
      is_featured: false,
      is_on_sale: false,
      image_url: 'https://images.unsplash.com/photo-1532323544230-7191fd51bc1b?w=800&q=80'
    },
    {
      name: 'Travertine Stone Trinket Dish',
      slug: 'travertine-stone-trinket-dish',
      description: 'Natural honed Italian travertine catchall tray for rings, keys, and bedside accessories with unique natural veining.',
      price: 38.00,
      discount_price: null,
      category_id: catMap['organization'] || 2,
      stock: 28,
      rating: 4.70,
      review_count: 22,
      is_featured: false,
      is_on_sale: false,
      image_url: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=800&q=80'
    },
    {
      name: 'Botanical Linen Cushion Cover',
      slug: 'botanical-linen-cushion-cover',
      description: '100% pre-washed French flax linen throw pillow cover with subtle earth-tone piping and a hidden zipper closure.',
      price: 34.00,
      discount_price: 28.00,
      category_id: catMap['home-decor'] || 1,
      stock: 35,
      rating: 4.65,
      review_count: 17,
      is_featured: false,
      is_on_sale: true,
      image_url: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&q=80'
    }
  ];

  for (const p of products) {
    // Check if product exists
    const [existing] = await db.query('SELECT id FROM products WHERE slug = ?', [p.slug]);
    let productId;
    if (existing && existing.length > 0) {
      productId = existing[0].id;
      await db.query(`
        UPDATE products SET
          name = ?,
          description = ?,
          price = ?,
          discount_price = ?,
          category_id = ?,
          stock = ?,
          rating = ?,
          review_count = ?,
          is_featured = ?,
          is_on_sale = ?
        WHERE id = ?
      `, [
        p.name, p.description, p.price, p.discount_price, p.category_id,
        p.stock, p.rating, p.review_count, p.is_featured, p.is_on_sale, productId
      ]);
    } else {
      const [insertRes] = await db.query(`
        INSERT INTO products (name, slug, description, price, discount_price, category_id, stock, rating, review_count, is_featured, is_on_sale)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        p.name, p.slug, p.description, p.price, p.discount_price, p.category_id,
        p.stock, p.rating, p.review_count, p.is_featured, p.is_on_sale
      ]);
      productId = insertRes[0]?.id || insertRes.insertId;
    }

    if (productId) {
      await db.query('DELETE FROM product_images WHERE product_id = ?', [productId]);
      await db.query('INSERT INTO product_images (product_id, image_url, is_primary) VALUES (?, ?, TRUE)', [productId, p.image_url]);
      console.log(`Added/Updated: ${p.name} (ID: ${productId})`);
    }
  }

  const [countRes] = await db.query('SELECT COUNT(*) as total FROM products');
  console.log(`Finished! Total products now in database: ${countRes[0].total}`);
}

seedTenProducts()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Error seeding products:', err);
    process.exit(1);
  });
