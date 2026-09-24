export interface User {
    id: number;
    name: string;
    email: string;
    role: 'customer' | 'admin';
    email_verified_at?: string;
}

export interface Category {
    id: number;
    name: string;
    slug: string;
    description?: string;
    is_active?: boolean;
}

export interface Product {
    id: number;
    category_id: number;
    title: string;
    slug: string;
    author: string;
    description?: string;
    price: string;
    cover_image_path?: string;
    file_type: 'pdf' | 'epub' | 'zip';
    file_size: number;
    is_published: boolean;
    category?: Category;
    created_at?: string;
}

export interface DownloadToken {
    id: number;
    order_item_id: number;
    token: string;
    expires_at: string;
    download_count: number;
    max_downloads: number;
}

export interface OrderItem {
    id: number;
    order_id: number;
    product_id: number;
    price: string;
    product?: Product;
    download_token?: DownloadToken;
    order?: Order;
}

export interface Payment {
    id: number;
    order_id: number;
    external_transaction_id: string;
    payment_type: string;
    gross_amount: string;
    transaction_status: string;
    paid_at?: string;
}

export interface Order {
    id: number;
    order_number: string;
    user_id: number;
    total_amount: string;
    status: 'pending' | 'paid' | 'failed' | 'expired';
    payment_method?: string;
    notes?: string;
    created_at: string;
    updated_at: string;
    user?: User;
    items?: OrderItem[];
    payments?: Payment[];
}

export interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

export interface PaginatedData<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    links: PaginationLink[];
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User;
    };
    flash?: {
        success?: string;
        error?: string;
    };
};

declare global {
    interface Window {
        snap?: {
            pay: (
                token: string,
                options: {
                    onSuccess?: (result: any) => void;
                    onPending?: (result: any) => void;
                    onError?: (result: any) => void;
                    onClose?: () => void;
                }
            ) => void;
        };
    }
}
