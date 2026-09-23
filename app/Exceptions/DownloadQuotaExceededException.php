<?php

declare(strict_types=1);

namespace App\Exceptions;

use Symfony\Component\HttpKernel\Exception\HttpException;

class DownloadQuotaExceededException extends HttpException
{
    public function __construct(string $message = 'Maximum download quota exceeded.')
    {
        parent::__construct(429, $message);
    }
}
