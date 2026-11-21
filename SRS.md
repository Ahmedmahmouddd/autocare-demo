# Automotive Services Marketplace — Requirements Notes

**Document status:** Working draft  
**Scope:** Decisions and requirements discussed and agreed so far  
**Applications:** Admin Panel, Partner App, Customer App

---

## 1. Project Overview

The project is a **C2C automotive services marketplace** that connects car owners who need vehicle maintenance or repairs with independent mechanics and garages.

The platform supports both:

- **Emergency roadside assistance:** A customer's car breaks down and they need help at or near their current location.
- **Regular maintenance and repairs:** Customers search for and book services such as oil changes, brake repairs, inspections, and other vehicle repairs.

The product is more than a mechanic directory. It combines an automotive services marketplace with vehicle profiles and maintenance-history tracking.

## 2. Applications and Overall Structure

The system will consist of three applications/interfaces connected to a shared backend and database:

1. **Admin Panel**
2. **Partner App**
3. **Customer App**

The backend will centralize shared data and business logic, including users, partners, services, orders, chats, payments, commissions, promo codes, vehicles, maintenance records, ratings, and payouts.

---

## 3. Partner Types and Service Capabilities

There will be **two partner account types**:

### 3.1 Freelancer / Independent Mechanic

An individual mechanic registered independently on the platform.

Potential capabilities include:

- Travelling to the customer's location.
- Providing roadside assistance.
- Offering services at a workshop or other applicable location, if supported by the provider.

### 3.2 Garage

A garage or workshop registered as a business.

Potential capabilities include:

- Receiving customers at the garage's physical location.
- Offering mobile services through its team.
- Providing roadside assistance where available.

### 3.3 Service Capabilities Are Not Separate Account Types

The following describe service delivery capabilities, not additional partner account types:

- **On-site/mobile service:** The provider travels to the customer.
- **Garage service:** The customer takes the vehicle to the garage.
- **Roadside assistance:** The provider assists a customer whose vehicle has broken down.

A partner may offer one or more capabilities, depending on what they support.

**Still to define:** Whether a Garage account can manage multiple employees/mechanics under one account, or whether every mechanic must have a separate Partner account.

---

## 4. Marketplace and Discovery Model

The platform will support two marketplace interaction models: direct browsing/selection and service requests with partner quotations.

### 4.1 Customer Marketplace: Browse Services and Providers

The Customer App must provide a public marketplace/catalog where a customer can browse the full set of active services and discover all approved, active Garages and Freelancers. Browsing must not require the customer to create a service request first.

Customers can:

- Browse all available service categories and individual services.
- Browse all approved and active Garages and Freelancers.
- Search services by name, keyword, or category.
- Open a service listing and see its description, provider, published price, and relevant service conditions.
- Open a Garage/Freelancer profile and see its available services and prices, service methods, working hours/availability, location or coverage area, photos, and ratings/reviews.
- Compare prices and providers before deciding to book.
- Filter providers by location, distance, city/area, service type, rating, price, and availability; sort by distance, rating, or price.
- View Garage locations on a map and access directions.
- Contact a provider and discuss service details through chat.

Only approved and active providers and their active/published services should appear in customer browsing. A Garage's public business location may be shown; a Freelancer's private residential address must not be exposed by default. A Freelancer is discoverable by service coverage or an explicitly selected public service location.

Prices displayed in the marketplace must be clearly identified as fixed/listed prices or starting prices. If the final amount depends on inspection or vehicle condition, the listing must say so and the final price must be confirmed with the customer before the order is accepted.

### 4.2 Request a Service and Receive Offers

Customers can submit a service request. Relevant partners can respond with quotations/offers, and the customer can compare and choose an offer.

A request may include:

- Service needed or vehicle problem.
- Description of the issue.
- Customer's selected vehicle.
- Customer location.
- Photos and/or videos, where relevant.

The platform will **not** automatically assign a provider to a customer. Automatic assignment was explicitly ruled out.

---

## 5. Admin Panel

The Admin Panel is the central management interface. It must provide records and oversight for platform entities and transactions.

### 5.1 Dashboard

The dashboard should provide platform-level statistics, including:

- Total customers.
- Total partners, separated into Freelancers and Garages.
- Total orders.
- Total transactions.
- Completed, pending, and cancelled orders/transactions.
- Platform revenue and commissions.
- Other useful platform performance statistics.

### 5.2 Customer Management

Admins should be able to:

- View all customers.
- View customer profiles.
- View customers' registered vehicles.
- View customer orders and transaction history.
- View ratings and reviews associated with customers.

### 5.3 Partner Management

Admins should be able to:

- View all Freelancers and Garages.
- View partner profiles and submitted information.
- Approve, reject, suspend, or deactivate partners.
- View partner services and pricing.
- View partner ratings and reviews.
- View partner orders, customers served, and transaction history.
- View partner performance and earnings information.

### 5.4 Transactions Management

Admins should be able to view all platform transactions, including:

- Transaction amount.
- Customer details.
- Partner details.
- Related order.
- Platform commission.
- Partner net earnings.
- Payment status.
- Transaction status.
- Relevant payment and refund information.

### 5.5 Services Management

Admins should be able to manage service categories and the services available on the platform.

The exact category structure and whether individual services require approval are not yet defined.

### 5.6 Commission Management

The Admin Panel must include a **Commission Configuration** section.

Admins should be able to:

- Configure the platform commission rate as a percentage.
- Change the commission rate without requiring an app update.
- Potentially configure different rates for different partner types (Freelancer and Garage).

The possibility of different rates by partner type was discussed as a capability to consider; the final commission rules are not yet fully specified.

**Important transaction rule:** Each transaction must store the commission rate and commission amount applied at the time of that transaction. Changing the configured rate later must not alter historical transactions.

### 5.7 Promo Codes Management

Admins should be able to create and manage promo codes.

Discussed promo-code configuration fields include:

- Promo code.
- Discount type: percentage or fixed amount.
- Discount value.
- Start date and expiry date.
- Usage limit.
- Minimum order value.
- Maximum discount amount (particularly relevant to percentage discounts).
- Active/inactive status.

Additional rules that may be supported:

- Promo code available to all customers or selected customers.
- Promo code applicable to all services or selected services.

**Still to decide:** Who funds a discount: the platform, the partner, or a configurable split between them.

### 5.8 Partner Locations Management

Admins should be able to:

- View Garage locations on a map.
- Select a Garage on the map and view its details.
- View Freelancer locations or service coverage areas, as appropriate.
- Search for partners by name or area.

For privacy, a Freelancer's personal/home address should not automatically be exposed publicly. The platform should use service coverage areas or an explicitly chosen public service location where appropriate.

### 5.9 Location Management

The Admin Panel may include management of supported cities and areas, especially if the platform needs to control the geographic areas in which services are available.

The exact geographic hierarchy and restrictions are not yet finalized.

### 5.10 Payout Management

The Admin Panel should provide payout visibility and operational oversight, including:

- Partner payout records.
- Pending, processing, successful, and failed payouts.
- Payout amounts.
- Partner information.
- Payout history.
- Monthly payout reports.
- Failed transfer handling and reconciliation.

---

## 6. Partner App

The Partner App will serve both Freelancers and Garages.

### 6.1 Profile Management

Partners should be able to create and manage their profiles.

Discussed profile information includes:

- Name or business name.
- Profile picture or business logo.
- Business/profile images or gallery.
- Contact information.
- Location or service coverage areas.
- Working hours and availability.
- Other relevant business or personal information.

The exact fields may differ between Freelancers and Garages.

### 6.2 Services Management

Partners should be able to:

- Add services.
- Edit services.
- Delete services.
- Add service descriptions.
- Set service prices or price ranges.
- Specify the service delivery type (mobile/on-site, in-garage, roadside assistance).
- Specify supported car brands and models, where relevant.

### 6.3 Orders Management

Partners should be able to:

- Receive customer service requests.
- Review request details and attached media.
- Send quotations/offers.
- Accept or reject requests, as applicable to the order flow.
- View and manage ongoing orders.
- Update order statuses.
- View order history.

### 6.4 Chat

Partners should be able to communicate with customers through in-app chat.

The chat may be used to:

- Discuss the vehicle problem.
- Clarify service requirements.
- Discuss and negotiate quotations.
- Share relevant images and videos.

### 6.5 Earnings and Business Analytics

Partners should be able to view business and financial information, including:

- Total earnings.
- Completed orders.
- Pending orders.
- Transaction history.
- Customers they have served.
- Ratings and reviews.
- Revenue reports.

The partner's earnings should be reflected in the app immediately after a successful payment, even though the actual payout is monthly.

---

## 7. Customer App

### 7.1 Marketplace and Explore

The Customer App must let customers browse the marketplace independently of the service-request flow. Customers should be able to:

- Browse all active service categories and service listings.
- Browse all approved and active Garages and Freelancers.
- Search services, providers, and categories.
- View each service's description, provider, published price, and conditions (including whether the price is fixed or starts from a stated amount).
- Open a provider profile and see all of that provider's available services, prices, service methods, hours/availability, location or coverage area, and customer ratings/reviews.
- Compare services and provider prices before booking.
- Filter by location, distance, city/area, service type, rating, price, and availability; sort by distance, rating, or price.
- Start a booking/request from a service listing or provider profile.

Only approved/active providers and active/published services are visible to customers. Customers can use their current location or select a city/area manually. Garage public business locations may be shown; Freelancer residential addresses must remain private unless explicitly configured as a public service location.

Published prices must be labelled as fixed prices or starting prices. Where inspection or vehicle condition may change the final amount, this must be disclosed and the final agreed price confirmed before order acceptance.

### 7.2 Provider Profiles and Locations

Customers should be able to view Garage locations on a map and access directions to a Garage.

Freelancers should be discoverable based on their service coverage areas or service locations. Their private residential addresses should not be exposed by default.

### 7.3 Service Requests

Customers should be able to:

- Select the required service.
- Describe the vehicle problem.
- Select one of their registered vehicles.
- Share their current location when relevant.
- Upload photos and/or videos.
- Submit the request to relevant partners.
- Receive quotations/offers.
- Compare offers.
- Select a provider.

### 7.4 Chat

Customers should be able to chat with Garages and Freelancers to:

- Explain the problem.
- Ask questions.
- Discuss service details.
- Negotiate prices.
- Share images and videos.

### 7.5 In-App Payments and Transactions

For the pay-after-completion flow, when the Partner marks the work as finished, the order moves to **Awaiting Customer Confirmation**. The Customer must explicitly confirm that the vehicle/service has been delivered/received. Confirmation must not itself complete the order or count as payment.

Immediately after confirming delivery, the Customer must be taken to an in-app payment step showing the agreed order amount and payment summary. The order is not Completed until the payment gateway confirms successful payment. If payment fails or is cancelled, the order remains unpaid (for example, Awaiting Payment) and the customer can retry; the system must not create a successful transaction or credit partner earnings for a failed payment.

After a successful payment:

- The order moves to **Completed**.
- A successful transaction record must be created.
- The transaction must appear in the customer's transaction history.
- It must appear in the partner's transaction/earnings records.
- It must be visible in the Admin Panel.
- The transaction must be associated with the relevant order and both parties, with gross amount, discount (if any), commission, partner net amount, gateway reference, and payment status.
- The post-transaction rating/review flow becomes available to both parties.

Deposit-required orders follow the separate agreed deposit flow in Section 8.2; any remaining balance is collected after delivery confirmation according to the partner's selected policy.

---

## 8. Payment Model, Commission, Earnings, and Payouts

### 8.1 In-App Payment

The platform will use **in-app payments**. The customer pays through an integrated payment gateway rather than simply recording an off-platform cash transaction.

The payment gateway must be selected based on the target country and its support for the required marketplace/payment and payout model.

### 8.2 Partner-Selected Payment Policy

The Partner should be able to choose whether a service requires a deposit or is paid in full after completion.

Two payment policies were agreed:

**Option A — Deposit Required**

- Partner configures a deposit amount or percentage.
- Customer pays the deposit after accepting the offer.
- Partner proceeds with the service.
- The remaining amount is paid after the service is completed.
- Both payments must be associated with the same order and transaction record.

**Option B — Pay After Completion**

- Customer accepts the partner's offer.
- Partner performs the service.
- Partner marks the job as completed.
- Customer confirms completion.
- Customer pays the full amount through the app.

The partner can choose the applicable policy. The precise scope of that choice (per service, per order, or a default partner setting with possible overrides) still needs to be defined.

### 8.3 Commission Calculation

The platform deducts its configured commission from the relevant service payment according to the commission rules.

A transaction must preserve:

- Gross service amount.
- Discount, if any.
- Commission rate used.
- Commission amount.
- Partner net earnings.
- Amount paid by the customer.
- Payment status and relevant payment references.

The exact order of applying discounts and calculating commission still needs to be specified.

### 8.4 Earnings Balance and Monthly Automatic Payouts

The agreed model is:

- Partner earnings are reflected in the Partner App immediately after a successful payment and commission calculation.
- Actual transfers to partners happen monthly.
- Earnings accumulate during the month.
- The system initiates automatic monthly payouts to the partner's registered bank account or supported payment method.

This is **not** a partner-initiated wallet withdrawal model. The partner sees an earnings balance/ledger, while transfers are made monthly.

The financial records should distinguish at least:

- Earned balance.
- Amount available for payout.
- Amount included in a payout.
- Amount successfully paid out.
- Failed or reversed payout amounts.

The system must account for refunds, disputes, chargebacks, and failed transfers. The exact hold periods and payout cut-off date are still to be defined.

**Integration dependency:** The selected payment provider must support the required collection and marketplace payout/settlement flow in the target country. This must be validated before choosing the final payment architecture.

---

## 9. Promo Codes and Discount Funding

The Admin Panel will support promo codes with either:

- Percentage discounts.
- Fixed-amount discounts.

The discount funding model remains undecided. The following possibilities were discussed:

1. Platform-funded discount.
2. Partner-funded discount.
3. Shared discount between platform and partner, using configurable percentages.

This decision affects partner net earnings, platform commission calculations, transaction records, and reporting.

---

## 10. My Garage — Customer Vehicle Management

The Customer App will include a **My Garage** module where customers can register and manage one or more vehicles.

### 10.1 Vehicle Profiles

Each vehicle should have its own profile, with information such as:

- Make/brand.
- Model.
- Manufacturing year.
- Trim/model variant, where relevant.
- License plate (optional or subject to privacy rules).
- VIN (optional).
- Current mileage.
- Vehicle photos.
- Other relevant vehicle specifications.

### 10.2 Vehicle Maintenance History

The system should track maintenance and service history for each vehicle, including examples such as:

- Oil changes.
- Filter replacements.
- Tire changes.
- Brake maintenance.
- Battery replacements.
- Repairs.
- Inspections.
- Other maintenance activities.

Each record may include:

- Service performed.
- Date.
- Mileage at the time of service.
- Partner/garage that performed the service.
- Related order and transaction, where applicable.
- Notes and supporting documents or images, if needed.

### 10.3 Vehicle Service History

Customers should be able to view:

- Previous garages and mechanics.
- Services performed.
- Transaction records.
- Invoices and receipts.
- Vehicle condition updates.

### 10.4 Partner Access to Vehicle Information

Partners may view relevant vehicle information when dealing with a customer, subject to appropriate customer permissions.

The system should not expose all vehicle information indiscriminately. Access should be limited to what is needed for the service and the customer's permission.

### 10.5 Maintenance Scheduling and Reminders

The system should:

- Calculate upcoming maintenance based on mileage and service history where possible.
- Send reminders for oil changes, filters, tires, and other maintenance.
- Help customers track their vehicle's maintenance state over time.

### 10.6 Maintenance Record Integrity

Maintenance records should be linked to completed platform orders whenever possible. This helps preserve a reliable service history and prevents arbitrary changes to records associated with actual platform services.

The rules for customer-entered historical maintenance records and partner-added records still need to be defined.

---

## 11. Partner Registration and Verification

The proposed partner onboarding flow was accepted as a good approach.

### 11.1 Registration Flow

1. Register using phone number and OTP.
2. Select account type: Freelancer or Garage.
3. Submit personal or business information.
4. Upload required verification documents.
5. Add location and service coverage areas.
6. Add services and pricing.
7. Submit the application for Admin review.
8. Admin approves or rejects the application.
9. Once approved, the partner becomes visible to customers and can receive orders.

### 11.2 Admin Approval

The recommended approach is to require Admin approval before a partner becomes publicly visible and can receive orders.

The Admin Panel should support approval and rejection, and partner management should also support suspension or deactivation.

### 11.3 Different Information by Partner Type

The exact verification requirements are not finalized, but the following information was discussed as likely relevant.

**Freelancer:**

- Full name.
- Profile picture.
- Identity verification.
- Skills and specializations.
- Service coverage area.
- Mobile service availability.
- Working hours.
- Services and pricing.

**Garage:**

- Business name.
- Logo.
- Commercial/business registration documents, if required.
- Physical address and map location.
- Working hours.
- Staff/mechanics information, if applicable.
- Services and pricing.
- Workshop photos.

The exact required documents and verification policy depend on the target country and applicable regulations.

---

## 12. Order Lifecycle — Proposed Baseline

The following order lifecycle was proposed and the user responded "LGTM" (looks good to me), so it is the accepted baseline for further discussion.

1. **Pending** — Customer submits a service request.
2. **Offers Received** — Partners send quotations.
3. **Accepted** — Customer chooses a partner and agrees on the price.
4. **In Progress** — Partner starts working.
5. **Awaiting Confirmation** — Partner marks the job as completed.
6. **Awaiting Payment** — Customer confirms completion and proceeds to payment.
7. **Completed** — Payment succeeds and the transaction is recorded.

Additional exceptional statuses identified:

- Cancelled.
- Rejected.
- Expired.
- Disputed.
- Refunded.

The exact transitions, who can trigger each transition, cancellation rules, and how deposit payments affect statuses still need to be specified.

**Payment timing is not fully finalized at the order-lifecycle level:** The partner may require a deposit after acceptance, or choose full payment after completion. The lifecycle must support both policies without creating inconsistent order/payment states.

---

## 13. Ratings and Reviews

### 13.1 Mutual Rating Eligibility

After successful payment completes an order, both parties become eligible to review each other for that specific order:

- Customer rates the Garage/Freelancer that performed the service.
- Garage/Freelancer rates the Customer who received the service.

The review prompts should appear as a post-payment step in each party's app (and remain accessible later if the party skips the prompt). Neither party may rate the other before the order is Completed/paid. Each party may submit at most one rating/review per completed order.

### 13.2 Review Data and Visibility

Each review must be linked to the order, reviewer, and review target. The demo/default interaction uses a 1-to-5-star score and an optional written comment. Customer-to-provider reviews contribute to the provider's public rating and review history. Provider-to-customer reviews contribute to the customer's reputation/profile and may be visible to partners when evaluating future requests, subject to platform privacy and moderation rules.

The platform should support moderation/reporting of abusive or inappropriate content. Editing/deletion windows, public visibility rules for customer reviews, moderation workflow, and the exact review fields remain to be finalized.

---

## 14. Decisions Still Open

The following topics have been raised but do not yet have final decisions. They should not be treated as finalized requirements.

1. **Garage team management:** Can one Garage account manage multiple employees/mechanics, or must each mechanic have a separate Partner account?
2. **Deposit cancellation/refund policy:** Is a deposit refundable if the customer or partner cancels? Are cancellation fees applicable, and who receives them?
3. **Promo-code funding:** Is the discount paid by the platform, the partner, or shared?
4. **Payment gateway:** Which provider will support in-app customer payments and monthly partner payouts in the target country?
5. **Payout schedule details:** What is the monthly cut-off date, payout date, and handling process for failed transfers?
6. **Commission rules:** Is commission global, different by partner type, or configurable by service/category?
7. **Commission calculation basis:** Is commission calculated before or after promo-code discounts, and how are deposits treated?
8. **Deposit configuration scope:** Is the deposit setting configured per service, per order, or as a partner default?
9. **Remaining order lifecycle details:** Cancellation rules, expiry conditions, dispute handling, and deposit-related transitions.
10. **Vehicle data permissions:** Exactly which vehicle fields can partners view, and for how long?
11. **Maintenance records:** Can customers manually add historical maintenance records, and what verification label should those records have?
12. **Location structure:** Which cities/areas are supported, and how are service coverage areas configured?
13. **Verification documents:** Exact document requirements for Freelancers and Garages.
14. **Garage employees:** Roles, permissions, and whether employees need their own logins.
15. **Service catalog:** Final categories, service definitions, and whether Admin approval is required for partner-created services.
16. **Review policy details:** Moderation workflow, editing/deletion window, and precise public visibility rules for customer reviews.

---

## 15. Newly Confirmed Business Rules

The following rules are now part of the working product requirements:

1. Customers can browse the complete active service catalog and all approved/active Garages and Freelancers, including each provider's services and prices, without first submitting a request.
2. Confirming vehicle/service delivery is a distinct step from payment. In the pay-after-completion flow, customer confirmation opens the in-app payment step; only successful payment completes the order.
3. After successful payment, both parties are prompted to review each other: the Customer reviews the Garage/Freelancer, and the Garage/Freelancer reviews the Customer. Reviews are order-linked and cannot be submitted before successful completion/payment.

---

## 16. Current High-Level Module Inventory

### Admin Panel

- Dashboard and platform analytics.
- Customer management.
- Partner management and verification.
- Freelancer and Garage records.
- Services and categories management.
- Orders overview.
- Transactions management.
- Commission configuration.
- Promo-code management.
- Garage locations map.
- Freelancer service coverage visibility.
- City/area management (if required).
- Partner earnings and payout management.
- Ratings and reviews oversight.

### Partner App

- Registration and OTP verification.
- Freelancer/Garage account selection.
- Profile and business information.
- Document submission and verification status.
- Location and service coverage.
- Working hours and availability.
- Services and pricing management.
- Customer service requests.
- Quotations/offers.
- Order management and statuses.
- Customer chat.
- Customer/vehicle information access with permission.
- Earnings and transaction history.
- Monthly payout history.
- Ratings and reviews.
- Business performance reports.

### Customer App

- Registration and customer profile.
- Browse all approved Garages and Freelancers and all active services.
- Search and filter services/providers; compare published prices.
- Provider profiles, complete service catalogs, prices, locations/coverage, and reviews.
- Service requests with descriptions and media.
- Vehicle selection and location sharing.
- Receive and compare offers.
- Chat with partners.
- Deposit or post-completion in-app payments, depending on partner policy.
- Transaction history.
- Mutual post-payment ratings and reviews (customer-to-partner and partner-to-customer).
- My Garage / multiple vehicle profiles.
- Vehicle maintenance and service history.
- Upcoming maintenance calculations and reminders.

---

## 17. Scope Note

This document records the product direction and requirements discussed so far. It is not yet a complete Software Requirements Specification (SRS), database schema, API specification, or final technical architecture.

The next discussions should resolve the open business rules, then define detailed user flows, permissions, edge cases, notifications, and acceptance criteria for each module.
