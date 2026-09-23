<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\Payments\ProcessPaymentWebhookAction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PaymentWebhookController extends Controller
{
    /**
     * Handle incoming payment notification webhook from Midtrans.
     */
    public function handle(
        Request $request,
        ProcessPaymentWebhookAction $processWebhook,
    ): JsonResponse {
        $processWebhook->execute($request->all());

        return response()->json([
            'status' => 'ok',
            'message' => 'Notification processed successfully.',
        ]);
    }
}

