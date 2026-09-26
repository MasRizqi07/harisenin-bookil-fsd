<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin;

use App\Enums\FileType;
use App\Models\Product;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class UpdateProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() ?? false;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        /** @var Product $product */
        $product = $this->route('product');

        return [
            'category_id' => ['required', 'integer', 'exists:categories,id'],
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', Rule::unique('products', 'slug')->ignore($product->id)],
            'author' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'sample_excerpt' => ['nullable', 'string', 'max:10000'],
            'price' => ['required', 'numeric', 'min:0', 'multiple_of:1'],
            'file_type' => ['required', Rule::enum(FileType::class)],
            'is_published' => ['boolean'],
            'cover_image' => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp', 'max:3072'],
            'digital_file' => ['nullable', 'file', 'mimes:pdf,epub,zip', 'max:51200'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function ($validator): void {
            if ($validator->errors()->isNotEmpty()) {
                return;
            }

            /** @var Product $product */
            $product = $this->route('product');
            $file = $this->file('digital_file');

            if ($file && $product->orderItems()->exists()) {
                $validator->errors()->add('digital_file', 'Berkas produk yang telah dibeli tidak dapat diganti.');
            }

            if ($file && strtolower($file->getClientOriginalExtension()) !== $this->input('file_type')) {
                $validator->errors()->add('digital_file', 'Format berkas harus sesuai dengan format yang dipilih.');
            }

            if (! $file && $this->input('file_type') !== $product->file_type->value) {
                $validator->errors()->add('file_type', 'Unggah berkas baru untuk mengubah format produk.');
            }

            if (! $file && $this->boolean('is_published')
                && ! Storage::disk((string) config('filesystems.private_disk'))->exists($product->file_path)) {
                $validator->errors()->add('digital_file', 'Produk publik harus memiliki berkas privat yang tersedia.');
            }
        });
    }
}
