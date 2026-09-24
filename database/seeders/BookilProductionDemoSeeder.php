<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Enums\FileType;
use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Enums\UserRole;
use App\Models\Category;
use App\Models\DownloadToken;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\Product;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class BookilProductionDemoSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Seed Seed Users
        $admin = User::query()->firstOrCreate(
            ['email' => 'admin@bookil.com'],
            [
                'name' => 'Administrator Bookil',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );
        $admin->role = UserRole::ADMIN;
        $admin->save();

        $customer = User::query()->firstOrCreate(
            ['email' => 'customer@bookil.com'],
            [
                'name' => 'Rizqi Pratama',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );
        $customer->role = UserRole::CUSTOMER;
        $customer->save();

        // 2. Seed Categories
        $categoriesData = [
            'programming-tech' => [
                'name' => 'Pemrograman & IT',
                'description' => 'E-book arsitektur software, framework modern, sistem backend, dan devops teruji.',
            ],
            'business-startup' => [
                'name' => 'Bisnis & Startup',
                'description' => 'Strategi validasi ide, manajemen finansial, pertumbuhan startup, dan scale-up bisnis.',
            ],
            'self-development' => [
                'name' => 'Pengembangan Diri',
                'description' => 'Panduan produktivitas, psikologi kebiasaan, mindfulness, dan manajemen waktu efektif.',
            ],
            'design-creative' => [
                'name' => 'Desain & Kreativitas',
                'description' => 'Prinsip UI/UX modern, typography, design system, dan panduan visual produk digital.',
            ],
            'fiction-literature' => [
                'name' => 'Fiksi Populer & Sastra',
                'description' => 'Koleksi karya sastra klasik, novel epik Indonesia, dan cerita inspiratif pilihan.',
            ],
        ];

        $categoryModels = [];
        foreach ($categoriesData as $slug => $info) {
            $categoryModels[$slug] = Category::query()->firstOrCreate(
                ['slug' => $slug],
                [
                    'name' => $info['name'],
                    'description' => $info['description'],
                    'is_active' => true,
                ]
            );
        }

        // 3. Seed 12 High-Quality Digital Books
        $booksData = [
            [
                'category_slug' => 'programming-tech',
                'title' => 'Mastering Laravel 13 Architecture',
                'slug' => 'mastering-laravel-13-architecture',
                'author' => 'Taylor Otwell & Tim Architect',
                'price' => '189000.00',
                'cover_image_path' => 'covers/mastering-laravel-13.svg',
                'file_type' => FileType::PDF,
                'file_size' => 14680064, // ~14MB
                'description' => 'Panduan komprehensif membangun sistem enterprise dengan Laravel 13, Inertia.js v2, Pest PHP, dan clean domain action pattern. Dilengkapi arsitektur konkurensi tinggi, optimasi database, dan strategi deployment zero-downtime.',
                'is_published' => true,
            ],
            [
                'category_slug' => 'programming-tech',
                'title' => 'High-Performance Clean PHP 8.5',
                'slug' => 'high-performance-clean-php-8-5',
                'author' => 'Brent Roose',
                'price' => '149000.00',
                'cover_image_path' => 'covers/clean-php-8-5.svg',
                'file_type' => FileType::PDF,
                'file_size' => 8388608,
                'description' => 'Eksplorasi mendalam fitur-fitur mutakhir PHP 8.5+: static typing ketat, asinkronus, JIT compiler tuning, dan penerapan domain-driven design dalam microservices berskala besar.',
                'is_published' => true,
            ],
            [
                'category_slug' => 'programming-tech',
                'title' => 'Building Modern Web with React 19 & Inertia v2',
                'slug' => 'building-modern-web-react-19-inertia-v2',
                'author' => 'Dan Abramov & Friends',
                'price' => '169000.00',
                'cover_image_path' => 'covers/react-19-inertia.svg',
                'file_type' => FileType::EPUB,
                'file_size' => 5242880,
                'description' => 'Kuasai ekosistem React 19 tanpa kerumitan client-side router tradisional. Pelajari Inertia.js v2 form management, hydration instan, dan integrasi TypeScript tanpa cela.',
                'is_published' => true,
            ],
            [
                'category_slug' => 'business-startup',
                'title' => 'Zero to One: Membangun Startup Masa Depan',
                'slug' => 'zero-to-one-membangun-startup',
                'author' => 'Peter Thiel',
                'price' => '95000.00',
                'cover_image_path' => 'covers/zero-to-one.svg',
                'file_type' => FileType::PDF,
                'file_size' => 6291456,
                'description' => 'Buku legendaris tentang filosofi menciptakan inovasi baru yang bersifat vertikal (0 ke 1) alih-alih menyalin keberhasilan yang sudah ada secara horizontal (1 ke n).',
                'is_published' => true,
            ],
            [
                'category_slug' => 'business-startup',
                'title' => 'The Lean Startup: Validasi Cepat Produk Digital',
                'slug' => 'the-lean-startup-validasi-produk',
                'author' => 'Eric Ries',
                'price' => '89000.00',
                'cover_image_path' => 'covers/the-lean-startup.svg',
                'file_type' => FileType::EPUB,
                'file_size' => 4194304,
                'description' => 'Metodologi Build-Measure-Learn untuk memangkas pemborosan sumber daya dan mempercepat pencapaian product-market fit di era persaingan digital yang sangat cepat.',
                'is_published' => true,
            ],
            [
                'category_slug' => 'self-development',
                'title' => 'Atomic Habits: Perubahan Kecil Berdampak Dahsyat',
                'slug' => 'atomic-habits-perubahan-kecil-berdampak-dahsyat',
                'author' => 'James Clear',
                'price' => '98000.00',
                'cover_image_path' => 'covers/atomic-habits.svg',
                'file_type' => FileType::PDF,
                'file_size' => 7340032,
                'description' => 'Kerangka kerja praktis berbasis ilmu psikologi untuk membangun kebiasaan baik dan mengikis kebiasaan buruk dengan perbaikan 1% setiap hari yang berlipat ganda seiring waktu.',
                'is_published' => true,
            ],
            [
                'category_slug' => 'self-development',
                'title' => 'Deep Work: Sukses di Dunia Penuh Gangguan',
                'slug' => 'deep-work-sukses-di-dunia-penuh-gangguan',
                'author' => 'Cal Newport',
                'price' => '92000.00',
                'cover_image_path' => 'covers/deep-work.svg',
                'file_type' => FileType::EPUB,
                'file_size' => 3670016,
                'description' => 'Keterampilan fokus intens tanpa distraksi adalah kekuatan super di abad ke-21. Temukan aturan-aturan praktis untuk melatih otak menghasilkan karya bernilai tinggi.',
                'is_published' => true,
            ],
            [
                'category_slug' => 'self-development',
                'title' => 'The Psychology of Money: Rahasia Abadi Kemakmuran',
                'slug' => 'psychology-of-money-rahasia-abadi-kemakmuran',
                'author' => 'Morgan Housel',
                'price' => '88000.00',
                'cover_image_path' => 'covers/psychology-of-money.svg',
                'file_type' => FileType::PDF,
                'file_size' => 5767168,
                'description' => '19 cerita pendek memukau yang mengungkap bagaimana emosi, ego, dan persepsi pribadi kita seringkali lebih menentukan kesuksesan finansial daripada rumus matematika.',
                'is_published' => true,
            ],
            [
                'category_slug' => 'design-creative',
                'title' => 'Refactoring UI: Trik Desain untuk Developer',
                'slug' => 'refactoring-ui-trik-desain-untuk-developer',
                'author' => 'Adam Wathan & Steve Schoger',
                'price' => '210000.00',
                'cover_image_path' => 'covers/refactoring-ui.svg',
                'file_type' => FileType::PDF,
                'file_size' => 19922944,
                'description' => 'Panduan visual taktis yang mengajarkan developer cara merancang antarmuka indah dan elegan tanpa membutuhkan gelar seni grafis formal.',
                'is_published' => true,
            ],
            [
                'category_slug' => 'design-creative',
                'title' => 'Don\'t Make Me Think: Desain UX Intuitif',
                'slug' => 'dont-make-me-think-desain-ux-intuitif',
                'author' => 'Steve Krug',
                'price' => '115000.00',
                'cover_image_path' => 'covers/dont-make-me-think.svg',
                'file_type' => FileType::PDF,
                'file_size' => 11534336,
                'description' => 'Buku wajib para desainer produk digital mengenai prinsip usability yang membuat pengguna dapat menavigasi aplikasi dengan mudah tanpa kebingungan.',
                'is_published' => true,
            ],
            [
                'category_slug' => 'fiction-literature',
                'title' => 'Laskar Pelangi: Menembus Keterbatasan Mimpi',
                'slug' => 'laskar-pelangi-menembus-keterbatasan-mimpi',
                'author' => 'Andrea Hirata',
                'price' => '65000.00',
                'cover_image_path' => 'covers/laskar-pelangi.svg',
                'file_type' => FileType::EPUB,
                'file_size' => 4718592,
                'description' => 'Kisah epik 10 anak di Pulau Belitung yang berjuang menuntut ilmu dengan segala keterbatasan, mengajarkan arti ketabahan, persahabatan, dan kekuatan mimpi.',
                'is_published' => true,
            ],
            [
                'category_slug' => 'fiction-literature',
                'title' => 'Bumi Manusia: Epik Perjuangan dan Martabat',
                'slug' => 'bumi-manusia-epik-perjuangan-martabat',
                'author' => 'Pramoedya Ananta Toer',
                'price' => '79000.00',
                'cover_image_path' => 'covers/bumi-manusia.svg',
                'file_type' => FileType::EPUB,
                'file_size' => 5898240,
                'description' => 'Mahakarya sastra Indonesia yang mengisahkan pergulatan Minke di era pergantian abad ke-20 dalam mencari identitas, keadilan, dan cinta sejati di tanah Hindia Belanda.',
                'is_published' => true,
            ],
        ];

        $createdProducts = [];
        foreach ($booksData as $b) {
            $cat = $categoryModels[$b['category_slug']];
            $createdProducts[$b['slug']] = Product::query()->updateOrCreate(
                ['slug' => $b['slug']],
                [
                    'category_id' => $cat->id,
                    'title' => $b['title'],
                    'author' => $b['author'],
                    'price' => $b['price'],
                    'cover_image_path' => $b['cover_image_path'],
                    'file_type' => $b['file_type'],
                    'file_size' => $b['file_size'],
                    'file_path' => "private/ebooks/{$b['slug']}.pdf",
                    'description' => $b['description'],
                    'is_published' => $b['is_published'],
                ]
            );
        }

        // 4. Seed 2 Realistic Paid Orders for Demo Customer so their Library is immediately populated!
        $laravelBook = $createdProducts['mastering-laravel-13-architecture'];
        $atomicBook = $createdProducts['atomic-habits-perubahan-kecil-berdampak-dahsyat'];

        // Order 1: Paid Laravel Book
        $order1 = Order::query()->firstOrCreate(
            ['order_number' => 'BK-DEMO-2026-001'],
            [
                'user_id' => $customer->id,
                'total_amount' => $laravelBook->price,
                'status' => OrderStatus::PAID,
                'payment_method' => 'bca_va',
                'notes' => 'Pesanan demo pertama customer',
            ]
        );

        $orderItem1 = OrderItem::query()->firstOrCreate(
            [
                'order_id' => $order1->id,
                'product_id' => $laravelBook->id,
            ],
            [
                'price' => $laravelBook->price,
            ]
        );

        DownloadToken::query()->firstOrCreate(
            ['order_item_id' => $orderItem1->id],
            [
                'token' => hash('sha256', 'demo-token-laravel-secret-12345'),
                'download_count' => 1,
                'max_downloads' => 5,
                'expires_at' => CarbonImmutable::now()->addDays(28),
            ]
        );

        Payment::query()->firstOrCreate(
            ['external_transaction_id' => 'tx-demo-bca-001'],
            [
                'order_id' => $order1->id,
                'payment_type' => 'bca_va',
                'gross_amount' => $order1->total_amount,
                'transaction_status' => PaymentStatus::SETTLEMENT,
                'raw_response' => ['status_message' => 'Success', 'payment_type' => 'bca_va'],
                'paid_at' => CarbonImmutable::now()->subDays(2),
            ]
        );

        // Order 2: Paid Atomic Habits
        $order2 = Order::query()->firstOrCreate(
            ['order_number' => 'BK-DEMO-2026-002'],
            [
                'user_id' => $customer->id,
                'total_amount' => $atomicBook->price,
                'status' => OrderStatus::PAID,
                'payment_method' => 'gopay',
                'notes' => 'Pesanan demo kedua customer',
            ]
        );

        $orderItem2 = OrderItem::query()->firstOrCreate(
            [
                'order_id' => $order2->id,
                'product_id' => $atomicBook->id,
            ],
            [
                'price' => $atomicBook->price,
            ]
        );

        DownloadToken::query()->firstOrCreate(
            ['order_item_id' => $orderItem2->id],
            [
                'token' => hash('sha256', 'demo-token-atomic-habits-secret-67890'),
                'download_count' => 0,
                'max_downloads' => 5,
                'expires_at' => CarbonImmutable::now()->addDays(30),
            ]
        );

        Payment::query()->firstOrCreate(
            ['external_transaction_id' => 'tx-demo-gopay-002'],
            [
                'order_id' => $order2->id,
                'payment_type' => 'gopay',
                'gross_amount' => $order2->total_amount,
                'transaction_status' => PaymentStatus::SETTLEMENT,
                'raw_response' => ['status_message' => 'Success', 'payment_type' => 'gopay'],
                'paid_at' => CarbonImmutable::now()->subDays(1),
            ]
        );
    }
}
