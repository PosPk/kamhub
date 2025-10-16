# ERD и статусные машины (Mermaid)

Актуально на: 2025-10-16

---

## ERD — Core Booking Domain

```mermaid
erDiagram
  USER ||--o{ BOOKING : makes
  USER ||--o{ INVENTORY_HOLD : places

  TOUR ||--o{ SLOT : has
  SLOT ||--o{ INVENTORY_HOLD : is_held_by
  SLOT ||--o{ BOOKING : reserves

  BOOKING }o--|| TOUR : for
  BOOKING ||--|| INVOICE : billed_as
  BOOKING ||--o{ PAYMENT_INTENT : paid_via

  %% Дополнительные привязки
  BOOKING }o--o{ TRANSFER_ROUTE : optional_addon
```

---

## ERD — Organizations & RBAC

```mermaid
erDiagram
  USER ||--o{ ROLE_ASSIGNMENT : has
  ROLE ||--o{ ROLE_ASSIGNMENT : in
  ROLE ||--o{ PERMISSION : grants
  ORGANIZATION ||--o{ ROLE_ASSIGNMENT : context

  ORGANIZATION ||--o{ USER : employs
  ORGANIZATION ||--o{ API_KEY : owns
  ORGANIZATION ||--o{ CONTRACT : has
  ORGANIZATION ||--o{ PAYOUT : receives
  ORGANIZATION ||--o{ COMMISSION : configured

  %% Транспорт у организаций типа Transfer
  ORGANIZATION ||--o{ VEHICLE : operates
  ORGANIZATION ||--o{ DRIVER : hires
```

---

## ERD — Payments & Finance

```mermaid
erDiagram
  BOOKING ||--|| INVOICE : billed_by
  INVOICE ||--o{ PAYMENT_INTENT : paid_with

  INVOICE }o--o{ TAX : includes
  INVOICE }o--o{ COMMISSION : includes

  PAYMENT_INTENT }o--|| CURRENCY_RATE : in_currency
  PAYOUT }o--o{ INVOICE : settles
```

---

## ERD — Notifications

```mermaid
erDiagram
  NOTIFICATION_TEMPLATE ||--o{ NOTIFICATION_EVENT : used_by
  NOTIFICATION_EVENT ||--o{ DELIVERY_ATTEMPT : has
  USER ||--o{ PREFERENCE : sets
  NOTIFICATION_EVENT }o--|| USER : target
```

---

## ERD — Transport & Geo & Content

```mermaid
erDiagram
  LOCATION ||--o{ TOUR : located_in
  LOCATION ||--o{ TRANSFER_ROUTE : passes

  TRANSFER_ROUTE }o--o{ VEHICLE : served_by
  TRANSFER_ROUTE }o--o{ DRIVER : driven_by

  DOCUMENT ||--o{ ATTACHMENT : contains
  DOCUMENT }o--o{ USER : about
  DOCUMENT }o--o{ TOUR : about
  DOCUMENT }o--o{ BOOKING : about

  CHAT_MESSAGE }o--|| USER : sent_by
  CHAT_MESSAGE }o--o{ BOOKING : relates_to
```

---

## ERD — Security & Compliance

```mermaid
erDiagram
  AUDIT_LOG }o--|| USER : actor
  API_KEY }o--|| ORGANIZATION : owner
  RATE_LIMIT }o--|| API_KEY : applied_to
  CONSENT }o--|| USER : given_by
```

---

## Словарь сущностей (минимальный)

- USER: аккаунт пользователя (PII, роли).
- ORGANIZATION: Operator | Transfer | Agent.
- ROLE, PERMISSION, ROLE_ASSIGNMENT: управление доступом.
- TOUR, SLOT, INVENTORY_HOLD, BOOKING: каталог и процесс бронирования.
- INVOICE, PAYMENT_INTENT, PAYOUT, COMMISSION, TAX, CURRENCY_RATE: финансы.
- NOTIFICATION_TEMPLATE, NOTIFICATION_EVENT, DELIVERY_ATTEMPT, PREFERENCE: уведомления.
- VEHICLE, DRIVER, TRANSFER_ROUTE: домен трансферов.
- LOCATION: нормализованная география.
- DOCUMENT, ATTACHMENT, CHAT_MESSAGE: контент и коммуникации.
- AUDIT_LOG, API_KEY, RATE_LIMIT, CONSENT: безопасность и комплаенс.

---

## Статусная машина — Booking

```mermaid
stateDiagram-v2
  [*] --> draft
  draft --> held: create_hold
  held --> awaiting_payment: create_payment_intent
  awaiting_payment --> confirmed: payment_succeeded/capture
  awaiting_payment --> canceled: cancel_by_user
  awaiting_payment --> expired: hold_timeout
  held --> canceled: release_hold
  confirmed --> canceled: operator_cancel/refund
  confirmed --> refunded: refund_full
  confirmed --> partially_refunded: refund_partial
  canceled --> [*]
  expired --> [*]

  note right of held: InventoryHold с таймаутом N минут
  note right of awaiting_payment: Идемпотентность на create/confirm
```

---

## Статусная машина — PaymentIntent

```mermaid
stateDiagram-v2
  [*] --> created
  created --> authorized: auth_success
  created --> failed: auth_failed
  authorized --> captured: capture_success
  authorized --> canceled: cancel
  authorized --> failed: capture_failed
  captured --> refunded: refund_full
  captured --> partially_refunded: refund_partial
  created --> canceled: cancel
  failed --> [*]
  canceled --> [*]
  refunded --> [*]
  partially_refunded --> [*]

  note right of created: idempotencyKey на create
  note right of captured: журнал транзакций и вебхуки
```

---

## Примечания по реализации

- Держите статусные переходы на стороне сервера с сохранением истории (AuditLog).
- Все операции оплаты — идемпотентные (по ключу), вебхуки — с верификацией сигнатур.
- Удержание инвентаря (InventoryHold) освобождается по таймауту или после успешного капчара.
- Для масштабируемости уведомлений — очередь, ретраи и дедупликация по eventId.
