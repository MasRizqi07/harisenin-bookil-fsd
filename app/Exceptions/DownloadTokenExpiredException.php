<?php

declare(strict_types=1);

namespace App\Exceptions;

use Symfony\Component\HttpKernel\Exception\HttpException;

class DownloadTokenExpiredException extends HttpException
{
    public function __construct(string $message = 'Download token has expired.')
    {
        parent::__construct(410, $message);
    }
}

