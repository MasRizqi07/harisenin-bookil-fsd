<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreProductRequest;
use App\Http\Requests\Admin\UpdateProductRequest;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use RuntimeException;
use Throwable;

class AdminProductController extends Controller
{
    /**
     * Display a list of products for management.
     */
    public function index(Request $request): Response
    {
        $products = Product::query()
            ->with('category')
            ->withCount('orderItems')
            ->when($request->filled('search'), function (Builder $query) use ($request): void {
                $search = '%'.trim((string) $request->input('search')).'%';
                $query->where(function (Builder $sub) use ($search): void {
                    $sub->where('title', 'like', $search)
                        ->orWhere('author', 'like', $search);
                });
            })
            ->when($request->filled('category_id'), function (Builder $query) use ($request): void {
                $query->where('category_id', $request->input('category_id'));
            })
            ->latest()
            ->paginate(15)
            ->withQueryString();

        $categories = Category::query()->orderBy('name')->get(['id', 'name']);

        return Inertia::render('Admin/Products/Index', [
            'products' => $products,
            'categories' => $categories,
            'filters' => [
                'search' => (string) $request->input('search', ''),
                'category_id' => (string) $request->input('category_id', ''),
            ],
        ]);
    }

    /**
     * Show form for creating a new digital product.
     */
    public function create(): Response
    {
        $categories = Category::query()->where('is_active', true)->orderBy('name')->get(['id', 'name']);

        return Inertia::render('Admin/Products/Form', [
            'product' => null,
            'categories' => $categories,
        ]);
    }

    /**
     * Store a newly created product in storage.
     */
    public function store(StoreProductRequest $request): RedirectResponse
    {
        $data = $request->validated();

        if (empty($data['slug'])) {
            $data['slug'] = Str::slug($data['title']).'-'.Str::random(5);
        }

        $privateDisk = (string) config('filesystems.private_disk');
        $newCover = null;
        $newFile = null;

        try {
            if ($request->hasFile('cover_image')) {
                $newCover = $request->file('cover_image')->store('covers', 'public');
                if (! $newCover) {
                    throw new RuntimeException('Cover upload failed.');
                }
                $data['cover_image_path'] = $newCover;
            }

            $newFile = $request->file('digital_file')->store('private/ebooks', $privateDisk);
            if (! $newFile) {
                throw new RuntimeException('Private asset upload failed.');
            }
            $data['file_path'] = $newFile;
            $data['file_size'] = $request->file('digital_file')->getSize();
            unset($data['cover_image'], $data['digital_file']);

            Product::query()->create($data);
        } catch (Throwable $exception) {
            if ($newCover) {
                Storage::disk('public')->delete($newCover);
            }
            if ($newFile) {
                Storage::disk($privateDisk)->delete($newFile);
            }

            throw $exception;
        }

        return redirect()->route('admin.products.index')
            ->with('success', 'E-Book berhasil ditambahkan ke katalog.');
    }

    /**
     * Show form for editing an existing product.
     */
    public function edit(Product $product): Response
    {
        $product->loadMissing('category');
        $categories = Category::query()->orderBy('name')->get(['id', 'name']);

        return Inertia::render('Admin/Products/Form', [
            'product' => $product,
            'categories' => $categories,
        ]);
    }

    /**
     * Update an existing product.
     */
    public function update(UpdateProductRequest $request, Product $product): RedirectResponse
    {
        $data = $request->validated();

        if (empty($data['slug'])) {
            $data['slug'] = Str::slug($data['title']);
        }

        $privateDisk = (string) config('filesystems.private_disk');
        $oldCover = $product->cover_image_path;
        $oldFile = $product->file_path;
        $newCover = null;
        $newFile = null;

        try {
            if ($request->hasFile('cover_image')) {
                $newCover = $request->file('cover_image')->store('covers', 'public');
                if (! $newCover) {
                    throw new RuntimeException('Cover upload failed.');
                }
                $data['cover_image_path'] = $newCover;
            }

            if ($request->hasFile('digital_file')) {
                $newFile = $request->file('digital_file')->store('private/ebooks', $privateDisk);
                if (! $newFile) {
                    throw new RuntimeException('Private asset upload failed.');
                }
                $data['file_path'] = $newFile;
                $data['file_size'] = $request->file('digital_file')->getSize();
            }

            unset($data['cover_image'], $data['digital_file']);
            $product->update($data);
        } catch (Throwable $exception) {
            if ($newCover) {
                Storage::disk('public')->delete($newCover);
            }
            if ($newFile) {
                Storage::disk($privateDisk)->delete($newFile);
            }

            throw $exception;
        }

        if ($newCover && $oldCover) {
            Storage::disk('public')->delete($oldCover);
        }
        if ($newFile && $oldFile) {
            Storage::disk($privateDisk)->delete($oldFile);
        }

        return redirect()->route('admin.products.index')
            ->with('success', 'Data e-book berhasil diperbarui.');
    }

    /**
     * Toggle published state.
     */
    public function togglePublish(Product $product): RedirectResponse
    {
        if (! $product->is_published
            && ! Storage::disk((string) config('filesystems.private_disk'))->exists($product->file_path)) {
            return back()->with('error', 'Produk tidak dapat dipublikasikan karena berkas privat belum tersedia.');
        }

        $product->update([
            'is_published' => ! $product->is_published,
        ]);

        $statusText = $product->is_published ? 'dipublikasikan' : 'disimpan sebagai draf';

        return back()->with('success', "E-Book berhasil {$statusText}.");
    }

    /**
     * Remove the specified product from storage.
     */
    public function destroy(Product $product): RedirectResponse
    {
        // Prevent deleting product if already purchased in an order
        if ($product->orderItems()->exists()) {
            return back()->with('error', 'Produk tidak dapat dihapus karena sudah memiliki riwayat transaksi pelanggan.');
        }

        if ($product->cover_image_path) {
            Storage::disk('public')->delete($product->cover_image_path);
        }

        $product->delete();

        return redirect()->route('admin.products.index')
            ->with('success', 'E-Book berhasil dihapus dari sistem.');
    }
}
