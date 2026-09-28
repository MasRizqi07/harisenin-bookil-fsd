<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EntitlementExtension extends Model
{
    /** @var list<string> */
    protected $fillable = ['actor_id', 'order_item_id', 'additional_downloads', 'additional_days', 'reason'];

    /** @return array<string, string> */
    protected function casts(): array
    {
        return ['additional_downloads' => 'integer', 'additional_days' => 'integer'];
    }
}
