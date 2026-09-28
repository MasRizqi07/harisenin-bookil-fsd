<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Actions\Downloads\ExtendEntitlementAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ExtendEntitlementRequest;
use App\Models\OrderItem;
use Illuminate\Http\RedirectResponse;

class AdminEntitlementController extends Controller
{
    public function __invoke(ExtendEntitlementRequest $request, OrderItem $orderItem, ExtendEntitlementAction $action): RedirectResponse
    {
        $action->execute($request->user(), $orderItem, $request->integer('additional_downloads'), $request->integer('additional_days'), $request->string('reason')->toString());

        return back()->with('success', 'Hak unduh diperpanjang dan perubahan dicatat.');
    }
}
