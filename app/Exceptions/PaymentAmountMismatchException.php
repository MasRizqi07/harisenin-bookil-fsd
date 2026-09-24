<?php

declare(strict_types=1);

namespace App\Exceptions;

use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

class PaymentAmountMismatchException extends UnprocessableEntityHttpException
{
    public function __construct(string $message = 'The payment amount does not match the order total.')
    {
        parent::__construct($message);
    }
}
