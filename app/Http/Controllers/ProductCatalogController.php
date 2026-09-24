<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProductCatalogController extends Controller
{
    /**
     * Display a paginated catalog of published products with search and category filters.
     */
    public function index(Request $request): Response
    {
        $products = Product::query()
            ->where('is_published', true)
            ->with('category')
            ->when($request->filled('search'), function (Builder $query) use ($request): void {
                $search = '%'.trim((string) $request->input('search')).'%';
                $query->where(function (Builder $subQuery) use ($search): void {
                    $subQuery->where('title', 'like', $search)
                        ->orWhere('author', 'like', $search)
                        ->orWhere('description', 'like', $search);
                });
            })
            ->when($request->filled('category'), function (Builder $query) use ($request): void {
                $query->whereHas('category', function (Builder $categoryQuery) use ($request): void {
                    $categoryQuery->where('slug', $request->input('category'))
                        ->where('is_active', true);
                });
            })
            ->when($request->input('sort') === 'price_asc', fn (Builder $q) => $q->orderBy('price', 'asc'))
            ->when($request->input('sort') === 'price_desc', fn (Builder $q) => $q->orderBy('price', 'desc'))
            ->when(! in_array($request->input('sort'), ['price_asc', 'price_desc'], true), fn (Builder $q) => $q->latest())
            ->paginate(12)
            ->withQueryString();

        $categories = Category::query()
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'slug']);

        return Inertia::render('Products/Index', [
            'products' => $products,
            'categories' => $categories,
            'filters' => [
                'search' => (string) $request->input('search', ''),
                'category' => (string) $request->input('category', ''),
                'sort' => (string) $request->input('sort', 'latest'),
            ],
        ]);
    }

    /**
     * Display detailed metadata and purchase action for an active product.
     */
    public function show(Product $product): Response
    {
        if (! $product->is_published) {
            abort(404, 'Produk tidak ditemukan atau belum dipublikasikan.');
        }

        $product->loadMissing('category');

        return Inertia::render('Products/Show', [
            'product' => $product,
        ]);
    }
}
