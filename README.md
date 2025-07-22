# ECommerceMobilApp 🛒

Modern ve kullanıcı dostu bir e-ticaret mobil uygulaması. React Native frontend'i ve ASP.NET Core Web API backend'i ile geliştirilmiş, kurumsal düzeyde bir e-ticaret çözümüdür.

## 📱 Mobil Uygulama Özellikleri

### 🔐 Kullanıcı Yönetimi
- Kullanıcı kaydı ve giriş sistemi
- Rol tabanlı erişim kontrolü (Admin, Satıcı, Müşteri)
- JWT token ile güvenli authentication
- Profil yönetimi ve güncelleme

### 🛍️ Ürün Yönetimi
- Dinamik ürün kataloğu
- Kategori bazlı ürün filtreleme
- Ürün arama ve sıralama
- Ürün detay sayfaları
- Stok takibi
- Renkli etiket sistemi (İndirimli, Popüler, Yeni, vb.)

### 🛒 Sepet ve Sipariş
- Sepet yönetimi
- Sipariş geçmişi
- Sipariş durumu takibi
- Gerçek zamanlı sipariş güncellemeleri

### 🏪 Satıcı Paneli
- Ürün ekleme ve düzenleme
- Kupon yönetimi
- Satış analizi (yakında)
- Mağaza ayarları (yakında)

### ⚙️ Admin Paneli
- Kategori yönetimi
- Ürün moderasyonu
- Kullanıcı yönetimi
- Sipariş takibi

### 🎟️ Kupon Sistemi
- Yüzde ve sabit tutar indirimleri
- Minimum tutar koşulları
- Kullanım sınırları
- Ürün bazlı kuponlar

### 💫 UI/UX Özellikleri
- Modern ve responsive tasarım
- Pull-to-refresh fonksiyonalitesi
- Cache sistemi ile hızlı performans
- Offline destek
- Smooth navigation transitions

## 🚀 Frontend Teknolojileri

- **React Native** - Mobil uygulama geliştirme
- **Expo Router** - Navigation ve routing
- **TypeScript** - Tip güvenliği
- **Expo** - Geliştirme ve deployment
- **AsyncStorage** - Yerel veri depolama
- **Context API** - State management
- **Ionicons** - UI ikonları

## 🏗️ Backend Mimarisi

### 🏛️ Clean Architecture (Onion Architecture)
```
ECommerceMobilAppAPI/
├── Core/
│   ├── DomainLayer/           # Domain Entities & Business Rules
│   │   ├── Entities/         # AppUser, AppRole, Product, Order, etc.
│   │   └── BaseEntity/       # Base sınıflar
│   └── ApplicationLayer/     # Business Logic & Application Services
│       ├── CQRS/            # Command Query Responsibility Segregation
│       │   ├── Commands/    # Write operations
│       │   └── Queries/     # Read operations
│       ├── Services/        # Business services
│       ├── DTOs/           # Data Transfer Objects
│       └── Security/       # JWT Token Generator
└── Infrastructure/
    └── PersistenceLayer/    # Data Access & EF Core
        ├── Context/        # AppDbContext
        ├── Repositories/   # Repository Pattern
        └── Migrations/     # EF Migrations
```

### 🔐 Identity & Authentication
- **ASP.NET Core Identity** - Kullanıcı yönetimi
- **JWT (JSON Web Token)** - Token-based authentication
- **Role-based Authorization** - Admin, Seller, Customer rolleri
- **Custom AppUser & AppRole** - Identity'yi extend eden özel kullanıcı modeli

```csharp
public class AppUser : IdentityUser<Guid>
{
    public string? Address { get; set; }
    public DateTime CreatedAt { get; set; }
    public string FullName { get; set; }
    public ICollection<Order> Orders { get; set; }
    public ICollection<Cart> Carts { get; set; }
}
```

### ⚡ CQRS Pattern (Command Query Responsibility Segregation)
- **MediatR** kütüphanesi ile implement edilmiş
- **Commands** - Write operations (Create, Update, Delete)
- **Queries** - Read operations (Get, GetAll, GetById)
- **Handlers** - Her command/query için ayrı handler

```csharp
public class GetAllProductsQuery : IRequest<ServiceResponse<List<ProductDto>>>
{
    public class Handler : IRequestHandler<GetAllProductsQuery, ServiceResponse<List<ProductDto>>>
    {
        // Implementation...
    }
}
```

### 🔧 Backend Teknoloji Stack
- **ASP.NET Core 8.0** - Web API framework
- **Entity Framework Core** - ORM (SQL Server)
- **MediatR** - CQRS pattern implementation
- **AutoMapper** - Object-to-object mapping
- **Microsoft.AspNetCore.Identity** - Authentication & authorization
- **JWT Bearer Authentication** - Token-based security

## 📁 Proje Yapısı

### Frontend (React Native)
```
ECommerceMobilApp/
├── app/                          # Sayfa bileşenleri (Expo Router)
│   ├── (tabs)/                   # Tab navigation sayfaları
│   ├── admin/                    # Admin panel sayfaları
│   ├── auth/                     # Authentication sayfaları
│   ├── seller/                   # Satıcı panel sayfaları
│   ├── orders.tsx                # Sipariş sayfası
│   └── seller-panel.tsx          # Satıcı ana paneli
├── context/                      # React Context providers
├── services/                     # API servisleri
├── data/                         # Veri modelleri ve tipleri
├── utils/                        # Yardımcı fonksiyonlar
└── clearCache.js                 # Cache temizleme utility
```

### Backend (ASP.NET Core)
```
ECommerceMobilAppAPI/
├── ECommerceApi/                 # Web API presentation layer
├── Core/
│   ├── DomainLayer/             # Entities, business rules
│   └── ApplicationLayer/        # Business logic, CQRS, services
└── Infrastructure/
    └── PersistenceLayer/        # Data access, EF Core
```

## 🔐 Authentication & Authorization

### JWT Configuration
```json
{
  "Jwt": {
    "Key": "...",
    "Issuer": "ECommerceApi",
    "Audience": "ECommerceApiUsers",
    "ExpireMinutes": 60
  }
}
```

### Role-Based Access Control
- **Customer** - Alışveriş, sipariş oluşturma
- **Seller** - Ürün yönetimi, kupon oluşturma
- **Admin** - Sistem yönetimi, tüm yetkiler

## 🚀 API Endpoints

### Authentication
```
POST /api/Auth/register    # Kullanıcı kaydı
POST /api/Auth/login       # Kullanıcı girişi
```

### Products (CQRS)
```
GET    /api/Product                # Tüm ürünler
GET    /api/Product/{id}           # Ürün detayı
GET    /api/Product/byseller/{seller} # Satıcıya göre ürünler
POST   /api/Product               # Ürün oluştur [Admin,Seller]
PUT    /api/Product               # Ürün güncelle [Admin,Seller]
DELETE /api/Product/{id}          # Ürün sil [Admin,Seller]
```

## 📊 Database Schema

### Core Entities
- **AppUser** - Identity kullanıcı modeli
- **AppRole** - Identity rol modeli
- **Product** - Ürün bilgileri
- **Category** - Ürün kategorileri
- **Order/OrderItem** - Sipariş yönetimi
- **Cart/CartItem** - Sepet yönetimi
- **Coupon** - Kupon sistemi
- **Wishlist** - İstek listesi

## 📦 Kurulum

### 1. Backend Setup
```bash
cd ECommerceMobilAppAPI/ECommerceApi
dotnet restore
dotnet ef database update
dotnet run
```

### 2. Frontend Setup
```bash
cd ECommerceMobilApp
npm install
npx expo start
```

## 🎨 UI Bileşenleri

### Ürün Etiketleri
Uygulamada çeşitli ürün etiketleri kullanılır:
- 🏷️ İndirimli
- 🔥 Çok Satılan
- ✨ Yeni
- ⚡ Sınırlı
- 👑 Premium
- ⭐ Popüler
- 🎮 Gaming
- 🏋️ Spor

### Renkli Tag Sistemi
Her etiket için özel renk kodları ve ikonlar tanımlanmıştır.

## 🔄 Cache Yönetimi

Frontend'te performans için cache sistemi kullanır:
- Kategori cache
- Ürün cache
- Sepet cache
- Otomatik cache temizleme

Cache'i temizlemek için `clearCache.js` dosyasını kullanabilirsiniz.

## 🔒 Security Features

- **Password Hashing** - Identity ile güvenli şifre saklama
- **JWT Token Validation** - Her API isteğinde token doğrulama
- **Role-based Authorization** - Controller seviyesinde yetki kontrolü
- **CORS Policy** - Cross-origin istekleri için güvenlik
- **Input Validation** - DTO'lar ile giriş validasyonu

## 📱 Ekran Görüntüleri & Özellikler

### Ana Özellikler
- 🏠 Ana sayfa - Öne çıkan ürünler
- 🔍 Arama ve filtreleme
- 👤 Kullanıcı profili
- 🛒 Sepet yönetimi
- 📋 Sipariş geçmişi

### Roller ve Yetkiler
- **Müşteri**: Alışveriş, sipariş takibi
- **Satıcı**: Ürün yönetimi, kupon oluşturma
- **Admin**: Sistem yönetimi, moderasyon

## 🔄 Development Workflow

### Backend Development
1. Domain entity oluştur
2. CQRS commands/queries yaz
3. DTOs ve mapping'leri tanımla
4. Controller endpoints ekle
5. Authorization attributes ekle

### Frontend Development
1. API service methods yaz
2. TypeScript interfaces tanımla
3. Context/state management
4. UI components geliştir
5. Navigation setup

## 🏗️ Clean Architecture Benefits

- **Separation of Concerns** - Her layer'ın kendine özel sorumluluğu
- **Testability** - Mock'lanabilir servisler
- **Maintainability** - Kolay bakım ve geliştirme
- **Scalability** - Büyümeye uygun yapı
- **SOLID Principles** - OOP best practices

## 📊 Yaklaşan Özellikler

### Backend
- **SignalR** - Real-time notifications
- **Redis Cache** - Performance optimization
- **API Versioning** - Backward compatibility
- **Swagger Documentation** - API documentation
- **Unit Tests** - xUnit test framework

### Frontend
- 📈 Satış analizi dashboard'u
- 🏪 Gelişmiş mağaza ayarları
- 📱 Push notification sistemi
- 💳 Ödeme entegrasyonu
- ⭐ Ürün değerlendirme sistemi

## 🛠️ Geliştirme

### Veri Başlatma
İlk kurulumda örnek veriler için `DataInitializer.ts` kullanılır.

### Test Kullanıcıları
Uygulamayı test etmek için farklı rollerde kullanıcılar oluşturabilirsiniz.

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/AmazingFeature`)
3. Commit edin (`git commit -m 'Add some AmazingFeature'`)
4. Push edin (`git push origin feature/AmazingFeature`)
5. Pull Request oluşturun

## 📄 Lisans

Bu proje açık kaynak kodludur. Daha fazla bilgi için [LICENSE](LICENSE) dosyasına bakın.

## 👨‍💻 Geliştirici

**aeren23** - [GitHub Profili](https://github.com/aeren23)

## 📞 İletişim

Proje hakkında sorularınız için:
- GitHub Issues kullanabilirsiniz
- Email: [İletişim bilgilerinizi ekleyin]

---

⭐ Bu projeyi beğendiyseniz yıldız vermeyi unutmayın!

**Not:** Bu README, Clean Architecture, CQRS, ASP.NET Core Identity ve JWT implementation'ları ile modern React Native frontend'inin bir araya geldiği kurumsal düzeyde bir e-ticaret projesi için hazırlanmıştır.
