# Customer content requiring owner confirmation

This inventory is a release review queue, not legal approval. The owner selected download access for 30 days from payment with at most 5 downloads per purchased item. Existing legal and business promises below require owner confirmation before publishing them to customers. Technical tests do not establish compliance, support capacity, tax treatment, copyright ownership, or provider availability.

Paths below are relative to `resources/js/`. Line numbers identify the reviewed source after Phase D.

| File:line | Hardcoded claim or business term | Review status |
| --- | --- | --- |
| Pages/Legal/Terms.tsx:20 | Official compliance document | owner must confirm |
| Pages/Legal/Terms.tsx:24 | Bank Indonesia regulatory standard and live Midtrans operation | owner must confirm |
| Pages/Legal/Terms.tsx:34 | Official licence, account responsibilities and intellectual property protection | owner must confirm |
| Pages/Legal/Terms.tsx:55 | February 2026 revision date | owner must confirm |
| Pages/Legal/Terms.tsx:60 | Legal version v2.4-Enterprise | owner must confirm |
| Pages/Legal/Terms.tsx:67 | Active operational compliance indicator | owner must confirm |
| Pages/Legal/Terms.tsx:143 | Premium technical books and source-code ZIP contents | owner must confirm |
| Pages/Legal/Terms.tsx:146 | Registration, browsing or purchase constitutes acceptance | owner must confirm |
| Pages/Legal/Terms.tsx:155 | Licensed payment processor and non-storage of card/CVV/bank credentials | owner must confirm; inspect actual provider payloads and logging on staging |
| Pages/Legal/Terms.tsx:158 | Expiry follows the gateway's verified status | owner must confirm; corrected the unsupported fixed 24-hour promise |
| Pages/Legal/Terms.tsx:168 | 30-day access and 5 downloads | owner must confirm; selected D1 policy, implemented listener defaults |
| Pages/Legal/Terms.tsx:171 | Personal device use, Zero-DRM and redistribution prohibitions | owner must confirm; inspect licences and supplied assets |
| Pages/Legal/Terms.tsx:180 | Initial quota 5 and storage URL lifetime 15 minutes | owner must confirm; code-backed limits |
| Pages/Legal/Terms.tsx:183 | Free quota reset following device replacement or file loss | owner must confirm; the admin extension tool does not promise free approval |
| Pages/Legal/Terms.tsx:192 | As-is provision and liability disclaimer | owner must confirm |
| Pages/Legal/Terms.tsx:195 | Indonesian governing law and dispute process | owner must confirm |
| Pages/Legal/Privacy.tsx:19 | Compliance with UU PDP No. 27/2022 | owner must confirm with legal review |
| Pages/Legal/Privacy.tsx:23 | Privacy/data protection standard | owner must confirm |
| Pages/Legal/Privacy.tsx:33 | Comprehensive identity and transaction protection description | owner must confirm |
| Pages/Legal/Privacy.tsx:98 | Identity, orders, payment notifications, IP and download outcomes collected | owner must confirm; corrected the earlier incomplete data inventory |
| Pages/Legal/Privacy.tsx:101 | No selling, renting, advertising sharing or tracking | owner must confirm; review Cloudflare, fonts, gateway and mail provider processing |
| Pages/Legal/Privacy.tsx:110 | PCI-DSS Level 1 wording and absence of card/PIN processing or storage | owner must confirm; no certification is inferred from application code |
| Pages/Legal/Privacy.tsx:119 | Essential session cookies and CSRF token only | owner must confirm; inspect actual cookies and third-party requests |
| Pages/Legal/Privacy.tsx:128 | Account update and deletion rights at any time | owner must confirm; financial/audit retention and foreign keys require a defined deletion process |
| Pages/Legal/RefundPolicy.tsx:20 | Digital refund standard | owner must confirm |
| Pages/Legal/RefundPolicy.tsx:24 | Consumer protection and Zero-DRM wording | owner must confirm |
| Pages/Legal/RefundPolicy.tsx:33 | Cancellation, double-billing and digital asset guarantees | owner must confirm |
| Pages/Legal/RefundPolicy.tsx:95 | 30-day/5-download access; refund/chargeback revokes access | owner must confirm; selected entitlement and existing reversal behavior |
| Pages/Legal/RefundPolicy.tsx:100 | Final sale with no unilateral cancellation | owner must confirm |
| Pages/Legal/RefundPolicy.tsx:109 | Satisfaction guarantee and full refund approval | owner must confirm |
| Pages/Legal/RefundPolicy.tsx:113 | Double billing qualifies for refund | owner must confirm |
| Pages/Legal/RefundPolicy.tsx:116 | Corrupt file replacement within 2x24 hours | owner must confirm |
| Pages/Legal/RefundPolicy.tsx:119 | Wrong title or substantially different content qualifies | owner must confirm |
| Pages/Legal/RefundPolicy.tsx:129 | support@bookil.com and 7-calendar-day claim window | owner must confirm; verify mailbox ownership and monitoring before launch |
| Pages/Legal/RefundPolicy.tsx:132 | Order-number format BK-[ULID] | owner must confirm; corrected against CreateOrderAction |
| Pages/Legal/RefundPolicy.tsx:133 | Checkout account email required for a claim | owner must confirm |
| Pages/Legal/RefundPolicy.tsx:134 | Screenshots or bank evidence required for a claim | owner must confirm |
| Pages/Legal/RefundPolicy.tsx:143 | Finance team approves refund claims | owner must confirm |
| Pages/Legal/RefundPolicy.tsx:146 | QRIS/e-wallet refund time 1–3 business days | owner must confirm with provider |
| Pages/Legal/RefundPolicy.tsx:147 | VA/bank refund time 1–2 business days to original account | owner must confirm with provider |
| Pages/Support/Faq.tsx:22 | Midtrans payment methods and deadlines | owner must confirm gateway activation |
| Pages/Support/Faq.tsx:28 | QRIS GoPay/OVO/Dana/BCA QR and bank VA options | owner must confirm available methods |
| Pages/Support/Faq.tsx:33 | QR scan or VA payment instructions | owner must confirm via sandbox purchase |
| Pages/Support/Faq.tsx:38 | Instant webhook verification and download availability | owner must confirm; external latency is not tested locally |
| Pages/Support/Faq.tsx:42 | BCA/Mandiri/BRI/BNI and BI QRIS labels | owner must confirm gateway activation and permitted brand use |
| Pages/Support/Faq.tsx:63 | Payment deadline and expiry follow Midtrans | owner must confirm; existing status-driven implementation |
| Pages/Support/Faq.tsx:79 | No manual receipt upload; gateway notification and status API recheck | owner must confirm; code-backed flow |
| Pages/Support/Faq.tsx:82 | Library availability after verified payment | owner must confirm via staging |
| Pages/Support/Faq.tsx:95 | 30-day/5-download entitlement | owner must confirm; selected D1 policy |
| Pages/Support/Faq.tsx:98 | Contact owner for an exhausted quota review | owner must confirm staffing and extension criteria |
| Pages/Support/Faq.tsx:111 | Signed storage link lasting 15 minutes | owner must confirm via real private bucket |
| Pages/Support/Faq.tsx:114 | A newly issued file URL consumes a quota unit | owner must confirm; Action increments on issuance |
| Pages/Support/Faq.tsx:127 | High-resolution PDF and reflowable EPUB availability | owner must confirm each asset |
| Pages/Support/Faq.tsx:130 | Apple Books compatibility | owner must confirm actual files |
| Pages/Support/Faq.tsx:131 | Send to Kindle compatibility | owner must confirm actual files and provider limits |
| Pages/Support/Faq.tsx:132 | ReadEra/Lithium/Moon+ Reader compatibility | owner must confirm actual files |
| Pages/Support/Faq.tsx:145 | Zero-DRM, application independence and private cloud storage permission | owner must confirm publisher rights and actual assets |
| Pages/Support/Faq.tsx:148 | Personal-use restriction and 30-day/5-download access | owner must confirm; access copy corrected |
| Pages/Support/Faq.tsx:198 | Self-service help available 24/7 | owner must confirm service availability |
| Pages/Support/Faq.tsx:350 | Active customer care | owner must confirm staffing |
| Pages/Support/Faq.tsx:357 | Emergency quota review and institutional invoice help | owner must confirm support scope |
| Pages/Support/Faq.tsx:367 | support@bookil.com | owner must confirm mailbox ownership and delivery |
| Pages/Support/Faq.tsx:368 | Reply within 2 business hours | owner must confirm SLA |
| Pages/Support/Faq.tsx:378 | WhatsApp phone number displayed in the UI | owner must confirm; current number is placeholder-shaped |
| Pages/Support/Faq.tsx:379 | WhatsApp support Monday–Sunday 08:00–22:00 WIB | owner must confirm staffing |
| Layouts/StoreLayout.tsx:299 | Book catalogue subjects | owner must confirm actual catalogue |
| Layouts/StoreLayout.tsx:300 | Product formats and private time-limited downloads | owner must confirm real bucket delivery |
| Layouts/StoreLayout.tsx:305 | Official Midtrans payments | owner must confirm account approval and live activation |
| Layouts/StoreLayout.tsx:308 | Private storage | owner must confirm bucket configuration |
| Layouts/StoreLayout.tsx:385 | Statutory copyright and author protection | owner must confirm publishing rights |
| Layouts/AuthLayout.tsx:44 | Digital files and 30-day download access | owner must confirm; access copy corrected |
| Layouts/AuthLayout.tsx:50 | 30 days, 5 downloads and 15-minute file URLs | owner must confirm via staging |
| Layouts/AuthLayout.tsx:67 | Named customer testimonial about technical literature and download reliability | owner must confirm authenticity and permission |
| Layouts/AuthLayout.tsx:64 | Verified-reader label and five-star rating | owner must confirm authenticity |
| Layouts/AuthLayout.tsx:76 | Named reader and professional role | owner must confirm identity and consent |
| Layouts/AuthLayout.tsx:85 | Fixed SSL encryption strength | owner must confirm negotiated TLS behavior at the proxy and origin |
| Layouts/AuthLayout.tsx:89 | Verified Midtrans gateway badge | owner must confirm merchant approval |
| Components/InstantCheckoutModal.tsx:162 | Gateway charge shown as free | owner must confirm merchant pricing |
| Components/InstantCheckoutModal.tsx:168 | Digital tax rate and included-tax statement | owner must confirm tax treatment; no separate tax calculation exists in checkout |

The existing legal wording remains subject to the owner's review; this change does not invent a new refund window or liability policy. No support mailbox, WhatsApp number or legal approval has been verified by the agent.
