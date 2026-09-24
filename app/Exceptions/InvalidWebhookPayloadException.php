<?php

declare(strict_types=1);

namespace App\Exceptions;

use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

class InvalidWebhookPayloadException extends UnprocessableEntityHttpException
{
    public function __construct(string $message = 'The payment notification payload is invalid.')
    {
        parent::__construct($message);
    }
}
