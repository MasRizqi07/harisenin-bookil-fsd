<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin;

use App\Models\Order;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Validator;

class ExtendEntitlementRequest extends FormRequest
{
    public function authorize(): bool
    {
        return Gate::allows('viewAnyAsAdmin', Order::class);
    }

    /** @return array<string, list<string>> */
    public function rules(): array
    {
        return [
            'additional_downloads' => ['required', 'integer', 'between:0,100'],
            'additional_days' => ['required', 'integer', 'between:0,365'],
            'reason' => ['required', 'string', 'min:5', 'max:1000'],
        ];
    }

    /** @return list<\Closure> */
    public function after(): array
    {
        return [function (Validator $validator): void {
            if ($this->integer('additional_downloads') + $this->integer('additional_days') <= 0) {
                $validator->errors()->add('additional_downloads', 'Add downloads, days, or both.');
            }
        }];
    }
}
