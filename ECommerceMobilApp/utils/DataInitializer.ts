import { ProductAPI, CategoryAPI } from '../services/ApiService';
import { Product } from '../data/products';

// Önce kategoriler oluşturacağız
const sampleCategories = [
  { name: 'Elektronik' },
  { name: 'Giyim' },
  { name: 'Spor' },
  { name: 'Mutfak' },
  { name: 'Oyuncak' }
];

// Kategoriler oluşturulduktan sonra kategori mapping'i tutacağız
let categoryMapping: { [key: string]: string } = {};

// Örnek ürün verileri - categoryId'ler dinamik olarak ayarlanacak
const sampleProducts = [
  {
    name: 'iPhone 14 Pro',
    categoryName: 'Elektronik', // Artık kategori adı kullanıyoruz
    image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-14-pro-finish-select-202209-6-1inch-deeppurple?wid=2560&hei=1440&fmt=jpeg&qlt=90&.v=1663703841896',
    price: 35000,
    originalPrice: 38000,
    seller: 'Apple Store',
    stock: 50,
    rating: 4.8,
    tags: ['Yeni', 'Popüler', 'Kaliteli']
  },
  {
    name: 'Samsung Galaxy S23',
    categoryName: 'Elektronik',
    image: 'https://images.samsung.com/tr/smartphones/galaxy-s23/images/galaxy-s23-highlights-color-phantom-black-back-mo.jpg',
    price: 28000,
    originalPrice: 32000,
    seller: 'Samsung Store',
    stock: 30,
    rating: 4.6,
    tags: ['İndirim', 'Hızlı Teslimat', 'Popüler']
  },
  {
    name: 'MacBook Air M2',
    categoryName: 'Elektronik',
    image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/macbook-air-midnight-select-20220606?wid=904&hei=840&fmt=jpeg&qlt=90&.v=1653084303665',
    price: 28000,
    originalPrice: 31000,
    seller: 'Apple Store',
    stock: 25,
    rating: 4.9,
    tags: ['Yeni', 'Özel Fiyat', 'Kaliteli']
  },
  {
    name: 'Nike Air Max 270',
    categoryName: 'Spor',
    image: 'https://static.nike.com/a/images/c_limit,w_592,f_auto/t_product_v1/54a510de-a406-41b2-8d62-7f8c587c9a7e/air-max-270-shoes-lpjbVk.png',
    price: 850,
    originalPrice: 1100,
    seller: 'Nike Store',
    stock: 100,
    rating: 4.5,
    tags: ['İndirim', 'Spor', 'Hızlı Teslimat']
  },
  {
    name: 'Adidas Ultraboost 22',
    categoryName: 'Spor',
    image: 'https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/fbaf991a78bc4896a3e9ad7800abcec6_9366/Ultraboost_22_Shoes_Black_GZ0127_01_standard.jpg',
    price: 1200,
    originalPrice: 1500,
    seller: 'Adidas Store',
    stock: 75,
    rating: 4.7,
    tags: ['Yeni', 'Kaliteli', 'Spor']
  },
  {
    name: 'Zara Kış Montu',
    categoryName: 'Giyim',
    image: 'https://static.zara.net/photos///2023/I/0/1/p/6719/304/800/2/w/850/6719304800_1_1_1.jpg',
    price: 450,
    originalPrice: 600,
    seller: 'Zara Store',
    stock: 60,
    rating: 4.2,
    tags: ['İndirim', 'Kış', 'Moda']
  },
  {
    name: 'H&M Basic Tişört',
    categoryName: 'Giyim',
    image: 'https://lp2.hm.com/hmgoepprod?set=source[/9a/0c/9a0c6b6b8d6c6a9d8f7e8b9c2d3e4f5a6b7c8d9e.jpg],origin[dam],category[men_tshirtstanks_shortsleeve],type[DESCRIPTIVESTILLLIFE],res[m],hmver[2]&call=url[file:/product/main]',
    price: 85,
    originalPrice: 120,
    seller: 'H&M Store',
    stock: 200,
    rating: 4.0,
    tags: ['Sınırlı Sayıda', 'Günlük', 'Ucuz']
  },
  {
    name: 'Philips Kahve Makinesi',
    categoryName: 'Mutfak',
    image: 'https://www.philips.com.tr/c-dam/b2c/master/experience/ho/coffee-machines/senseo-viva-cafe/senseo-viva-cafe-hd6563-60-800x800.jpg',
    price: 750,
    originalPrice: 950,
    seller: 'Philips Store',
    stock: 40,
    rating: 4.4,
    tags: ['Ev Aletleri', 'Kahve', 'Kaliteli']
  },
  {
    name: 'LEGO Creator Set',
    categoryName: 'Oyuncak',
    image: 'https://www.lego.com/cdn/cs/set/assets/blt4095e4c9c42b2e8e/10280_alt1.jpg',
    price: 320,
    originalPrice: 400,
    seller: 'LEGO Store',
    stock: 35,
    rating: 4.8,
    tags: ['Oyuncak', 'Çocuk', 'Yaratıcı']
  },
  {
    name: 'Casio Dijital Saat',
    categoryName: 'Elektronik',
    image: 'https://www.casio.com/content/dam/casio/product-info/locales/intl/en/timepiece/product/watch/A/A1/A168/A168WA-1W/assets/A168WA-1W_Seq1.png.transform/main-visual-sp/image.png',
    price: 180,
    originalPrice: 250,
    seller: 'Casio Store',
    stock: 80,
    rating: 4.3,
    tags: ['Klasik', 'Uygun Fiyat', 'Dayanıklı']
  }
];

class DataInitializer {
  private static initialized = false;

  // Önce kategorileri oluştur
  private static async createCategories(): Promise<void> {
    console.log('📂 Creating categories...');
    
    try {
      // Mevcut kategorileri kontrol et
      console.log('🔍 Checking existing categories...');
      const existingCategories = await CategoryAPI.getAll();
      console.log('📥 CategoryAPI.getAll() response:', existingCategories);
      
      if (existingCategories.success && existingCategories.value && existingCategories.value.length > 0) {
        console.log('✅ Categories already exist, building mapping...');
        console.log('📝 Existing categories:', existingCategories.value);
        
        // Mevcut kategoriler varsa mapping'i oluştur
        for (const category of existingCategories.value) {
          categoryMapping[category.name] = category.id;
        }
        console.log('🗺️ Category mapping:', categoryMapping);
        
        // Eksik kategorileri kontrol et ve ekle
        for (const sampleCategory of sampleCategories) {
          if (!categoryMapping[sampleCategory.name]) {
            console.log(`➕ Creating missing category: ${sampleCategory.name}`);
            const response = await CategoryAPI.create(sampleCategory);
            console.log(`📤 CategoryAPI.create() response for ${sampleCategory.name}:`, response);
            if (response.success && response.value) {
              categoryMapping[sampleCategory.name] = response.value;
              console.log(`✅ Category created: ${sampleCategory.name} -> ${response.value}`);
            } else {
              console.error(`❌ Failed to create category: ${sampleCategory.name}`, response.errorMessage);
            }
          }
        }
      } else {
        // Hiç kategori yoksa hepsini oluştur
        console.log('📝 No categories exist, creating all...');
        
        for (const sampleCategory of sampleCategories) {
          try {
            console.log(`➕ Creating category: ${sampleCategory.name}`);
            const response = await CategoryAPI.create(sampleCategory);
            console.log(`📤 CategoryAPI.create() response for ${sampleCategory.name}:`, response);
            if (response.success && response.value) {
              categoryMapping[sampleCategory.name] = response.value;
              console.log(`✅ Category created: ${sampleCategory.name} -> ${response.value}`);
            } else {
              console.error(`❌ Failed to create category: ${sampleCategory.name}`, response.errorMessage);
            }
          } catch (error) {
            console.error(`❌ Error creating category: ${sampleCategory.name}`, error);
          }
        }
      }
      
      console.log('🗺️ Final category mapping:', categoryMapping);
    } catch (error) {
      console.error('❌ Error in createCategories:', error);
      throw error;
    }
  }

  // Sonra ürünleri oluştur
  private static async createProducts(): Promise<void> {
    console.log('📦 Creating products...');
    
    try {
      // Mevcut ürünleri kontrol et
      console.log('🔍 Checking existing products...');
      const existingProducts = await ProductAPI.getAll();
      console.log('📥 ProductAPI.getAll() response:', existingProducts);
      
      // Geçici olarak kontrol devre dışı - her zaman yeni ürün ekle
      // if (existingProducts.success && existingProducts.value && existingProducts.value.length > 0) {
      //   console.log('Products already exist in database, skipping product creation');
      //   return;
      // }
      
      if (existingProducts.success && existingProducts.value && existingProducts.value.length > 0) {
        console.log('⚠️ Products already exist, but continuing to add sample products...');
      } else {
        console.log('📝 No products exist, creating all...');
      }

      // Örnek ürünleri ekle
      console.log('🔄 Adding sample products...');
      console.log('🗺️ Category mapping before product creation:', categoryMapping);
      console.log('📝 Sample categories needed:', sampleCategories.map(c => c.name));
      
      for (const product of sampleProducts) {
        try {
          // categoryName'i categoryId'ye çevir
          const categoryId = categoryMapping[product.categoryName];
          
          console.log(`🔍 Looking for category: "${product.categoryName}" -> Found ID: "${categoryId}"`);
          
          if (!categoryId) {
            console.error(`❌ Category not found for product: ${product.name}, category: ${product.categoryName}`);
            console.log('🗺️ Available categories:', Object.keys(categoryMapping));
            console.log('🔍 Exact mapping:', categoryMapping);
            continue;
          }

          // Product data'sını hazırla - API'nin beklediği format
          const productData = {
            product: {
              name: product.name,
              categoryId: categoryId,
              image: product.image,
              price: product.price,
              originalPrice: product.originalPrice,
              seller: product.seller,
              stock: product.stock,
              rating: product.rating,
              tags: product.tags
            }
          };

          console.log(`➕ Creating product: ${product.name} in category: ${product.categoryName} (${categoryId})`);
          console.log(`📦 Product data being sent:`, JSON.stringify(productData, null, 2));
          const response = await ProductAPI.create(productData);
          console.log(`📤 ProductAPI.create() response for ${product.name}:`, response);
          
          if (response.success) {
            console.log(`✅ Product created: ${product.name} (Category: ${product.categoryName})`);
          } else {
            console.error(`❌ Failed to create product: ${product.name}`, response.errorMessage);
          }
        } catch (error) {
          console.error(`❌ Error creating product: ${product.name}`, error);
        }
      }
    } catch (error) {
      console.error('❌ Error in createProducts:', error);
      throw error;
    }
  }

  static async initialize(): Promise<void> {
    console.log('🚀 DataInitializer.initialize() called');
    
    if (this.initialized) {
      console.log('✅ Data initializer already run');
      return;
    }

    try {
      console.log('📊 Initializing sample data...');
      
      // 1. Önce kategorileri oluştur
      console.log('⏳ Step 1: Creating categories...');
      await this.createCategories();
      console.log('✅ Categories creation completed');
      
      // 2. Sonra ürünleri oluştur (zorla yeniden oluştur)
      console.log('⏳ Step 2: Creating products...');
      await this.createProducts();
      console.log('✅ Products creation completed');

      this.initialized = true;
      console.log('🎉 Data initialization completed successfully!');
    } catch (error) {
      console.error('❌ Data initialization failed:', error);
      throw error; // Hata durumunda UserContext'e bildirim için
    }
  }

  // Veritabanını temizle ve yeniden başlat
  static async forceReset(): Promise<void> {
    console.log('🔄 Force resetting DataInitializer...');
    this.initialized = false;
    categoryMapping = {};
    
    try {
      // Kategorileri ve ürünleri yeniden oluştur
      await this.createCategories();
      await this.createProducts();
      
      this.initialized = true;
      console.log('✅ Force reset completed!');
    } catch (error) {
      console.error('❌ Force reset failed:', error);
      throw error;
    }
  }

  static async reset(): Promise<void> {
    this.initialized = false;
    categoryMapping = {};
    console.log('Data initializer reset');
  }
}

export default DataInitializer;
