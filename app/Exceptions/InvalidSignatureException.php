<?php

declare(strict_types=1);

namespace App\Exceptions;

use Symfony\Component\HttpKernel\Exception\HttpException;

class InvalidSignatureException extends HttpException
{
    public function __construct(string $message = 'Invalid webhook signature key.')
    {
        parent::__construct(401, $message);
    }
}

