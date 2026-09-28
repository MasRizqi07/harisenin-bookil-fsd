<!DOCTYPE html>
<html lang="en">
<body>
    <h1>Bookil order receipt</h1>
    <p>Payment received for order {{ $order->order_number }}.</p>
    <ul>
        @foreach ($order->items as $item)
            <li>{{ $item->product->title }} — IDR {{ $item->price }}</li>
        @endforeach
    </ul>
    <p>Total: IDR {{ $order->total_amount }}</p>
    <p>Download access lasts 30 days from payment, with at most 5 downloads per purchased item. A refund or chargeback revokes download access.</p>
    <p><a href="{{ route('orders.show', $order->order_number) }}">Sign in to view your order and remaining download allowance</a></p>
</body>
</html>
