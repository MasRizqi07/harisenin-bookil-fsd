<?php

declare(strict_types=1);

namespace App\Exceptions;

use Symfony\Component\HttpKernel\Exception\HttpException;

class ProductUnavailableException extends HttpException
{
    public function __construct(string $message = 'One or more selected products are unavailable.')
    {
        parent::__construct(422, $message);
    }
}
