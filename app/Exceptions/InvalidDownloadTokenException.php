<?php

declare(strict_types=1);

namespace App\Exceptions;

use Symfony\Component\HttpKernel\Exception\HttpException;

class InvalidDownloadTokenException extends HttpException
{
    public function __construct(string $message = 'Download token not found or invalid.')
    {
        parent::__construct(404, $message);
    }
}

