<?php

declare(strict_types=1);

namespace App\Exceptions;

use Symfony\Component\HttpKernel\Exception\HttpException;

class OrderNotPaidException extends HttpException
{
    public function __construct(string $message = 'Order is not paid or settled.')
    {
        parent::__construct(403, $message);
    }
}
