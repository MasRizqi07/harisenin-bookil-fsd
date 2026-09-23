<?php

declare(strict_types=1);

namespace App\Enums;

enum PaymentStatus: string
{
    case PENDING = 'pending';
    case CAPTURE = 'capture';
    case SETTLEMENT = 'settlement';
    case DENY = 'deny';
    case CANCEL = 'cancel';
    case EXPIRE = 'expire';
    case FAILURE = 'failure';
    case REFUND = 'refund';
    case CHARGEBACK = 'chargeback';
    case PARTIAL_REFUND = 'partial_refund';
    case PARTIAL_CHARGEBACK = 'partial_chargeback';
    case AUTHORIZE = 'authorize';
}
