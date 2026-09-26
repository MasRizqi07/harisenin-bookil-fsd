<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin;

use App\Enums\FileType;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class StoreProductRequest extends FormRequest
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
        return [
            'category_id' => ['required', 'integer', 'exists:categories,id'],
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'unique:products,slug'],
            'author' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'sample_excerpt' => ['nullable', 'string', 'max:10000'],
            'price' => ['required', 'numeric', 'min:0', 'multiple_of:1'],
            'file_type' => ['required', Rule::enum(FileType::class)],
            'is_published' => ['boolean'],
            'cover_image' => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp', 'max:3072'],
            'digital_file' => ['required', 'file', 'mimes:pdf,epub,zip', 'max:51200'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function ($validator): void {
            $file = $this->file('digital_file');
            if ($file && strtolower($file->getClientOriginalExtension()) !== $this->input('file_type')) {
                $validator->errors()->add('digital_file', 'Format berkas harus sesuai dengan format yang dipilih.');
            }
        });
    }
}
