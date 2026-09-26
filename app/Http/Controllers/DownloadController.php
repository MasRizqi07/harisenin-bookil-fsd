<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\Downloads\GenerateSecureDownloadAction;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class DownloadController extends Controller
{
    /**
     * Authorize download token, increment quota, and redirect to private presigned file URL.
     */
    public function download(
        Request $request,
        int $orderItem,
        GenerateSecureDownloadAction $generateDownload,
    ): RedirectResponse {
        /** @var User $user */
        $user = $request->user();

        $presignedUrl = $generateDownload->execute(
            $user, $orderItem, $request->ip(), hash('sha256', (string) $request->query('signature'))
        );

        return redirect()->away($presignedUrl);
    }
}
