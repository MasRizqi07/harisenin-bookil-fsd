<?php

declare(strict_types=1);

namespace App\Exceptions;

use Symfony\Component\HttpKernel\Exception\HttpException;

class UnauthorizedDownloadException extends HttpException
{
    public function __construct(string $message = 'You do not own this purchased product.')
    {
        parent::__construct(403, $message);
    }
}

