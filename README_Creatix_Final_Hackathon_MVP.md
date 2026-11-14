# CreatorDesk --- Creator Business Management Platform

## 1. Project Overview

CreatorDesk is a unified platform designed to help digital content
creators manage their professional activities, track brand
collaborations, monitor earnings, and connect with potential brand
partners.

The platform brings creators and brands together through two connected
interfaces:

-   **Creator Portal:** A workspace where creators manage their
    profiles, collaborations, deliverables, deadlines, contracts,
    income, and expenses.
-   **Brand Portal:** A discovery platform where brands can explore
    creator profiles, filter creators by niche, shortlist suitable
    candidates, and send collaboration enquiries.

The central idea is to simplify creator-business management by bringing
collaboration management, financial tracking, contract intelligence, and
brand discovery into one platform.

The hackathon MVP focuses on manual data entry, database-backed
workflows, basic calculations, and one AI-powered differentiating
feature. It does not depend on complex third-party integrations.

------------------------------------------------------------------------

## 2. Core Modules

### 2.1 Creator Dashboard

**Purpose:** Provide creators with a central overview of their
professional activities and business performance.

#### Features

-   Display total collaboration earnings.
-   Display total expenses and net earnings.
-   Show active brand collaborations.
-   Show pending payments.
-   Display upcoming collaboration deadlines.
-   Show recent activities and updates.
-   Provide quick access to deals, finances, contracts, and creator
    profile.
-   Display a monthly income, expense, and net-profit trend graph.

#### Workflow

1.  Creator logs into their account.
2.  The application retrieves their existing records.
3.  Dashboard calculates financial totals from saved income and expense
    records.
4.  Active collaborations and pending payments are displayed.
5.  Upcoming deadlines and recent activities are shown.
6.  A graph displays monthly income, expenses, and net profit based on
    the creator's saved financial records.

All dashboard statistics and graph values are calculated from
information entered and saved by the creator.

------------------------------------------------------------------------

### 2.2 Collaboration & Deal Management

**Purpose:** Help creators organise and manage their brand
collaborations.

#### Features

-   Create new collaboration records.
-   Add brand information.
-   Record deal payment amounts.
-   Add collaboration descriptions.
-   Define content deliverables.
-   Set submission and publishing deadlines.
-   Track deal status.
-   Track payment status.
-   Edit and delete collaboration records.
-   Link an uploaded contract and its AI-generated analysis to the
    relevant collaboration.

#### Deal Information

Each collaboration can contain:

-   Brand name
-   Campaign title
-   Description
-   Payment amount
-   Deliverables
-   Submission deadline
-   Publishing deadline
-   Payment status
-   Deal status
-   Additional notes
-   Linked contract document (optional)

#### Deal Status

-   Pending
-   Accepted
-   In Progress
-   Completed
-   Cancelled

#### Payment Status

-   Pending
-   Partially Paid
-   Paid

#### Workflow

1.  Creator receives a collaboration opportunity.
2.  Creator manually adds the deal or accepts an enquiry from a brand.
3.  Collaboration details are saved.
4.  Creator updates deliverables and deadlines.
5.  Creator can upload the associated contract and review its
    AI-extracted terms.
6.  Creator updates the payment status when payment is received.
7.  Dashboard automatically reflects the updated information.

------------------------------------------------------------------------

### 2.3 AI-Powered Contract Intelligence --- Key Differentiating Feature

**Purpose:** Help creators understand brand contracts without manually
reading and interpreting every important term.

This is the MVP's primary technical differentiator. It uses an existing
LLM API; training a custom machine-learning model is not required.

#### Features

-   Upload a brand contract in PDF format.
-   Extract text from the uploaded PDF.
-   Generate a plain-language contract summary.
-   Extract important deal information:
    -   Brand name, if present
    -   Payment amount and payment conditions
    -   Deliverables and content formats
    -   Submission and publishing deadlines
    -   Exclusivity terms, if present
    -   Usage/licensing terms, if present
-   Highlight clauses or terms that may deserve the creator's attention.
-   Display extracted information in structured fields.
-   Allow creators to edit and confirm extracted information.
-   Save the confirmed terms and link the contract to a collaboration
    record.

#### Workflow

1.  Creator uploads a contract PDF, either from the contract section or
    while creating a collaboration.
2.  Backend extracts text from the PDF.
3.  Extracted text is sent to an existing LLM API with instructions to
    return a concise summary and structured deal fields.
4.  Backend receives and validates the response.
5.  Application displays the summary and extracted terms alongside the
    uploaded contract.
6.  Creator reviews, edits, and confirms the information.
7.  Confirmed information is saved and linked to the relevant
    collaboration.
8.  Payment amounts and deadlines can be used to populate or update the
    collaboration record after creator confirmation.

#### Important Notes

-   AI-generated summaries and clause flags are informational, not legal
    advice.
-   The original contract remains the source of truth.
-   Creators must review and confirm extracted details before they are
    saved as deal information.
-   For the MVP, support text-based PDFs first. Scanned/image-only PDFs
    may require OCR and can be left out if time is limited.
-   If the LLM API is unavailable, the creator should still be able to
    add deal details manually.

------------------------------------------------------------------------

### 2.4 Creator Financial Management & Profitability Insights

**Purpose:** Help creators understand their income, expenses, net
earnings, and the profitability of their collaborations.

#### Features

-   Add income records.
-   Add expense records.
-   Link financial records to specific collaborations.
-   Categorise expenses.
-   Track pending and received payments.
-   Calculate total income.
-   Calculate total expenses.
-   Calculate net earnings.
-   Display monthly financial summaries.
-   Display an income vs expenses graph.
-   Display a monthly net-profit trend graph.
-   View income, expenses, and profit by collaboration or brand.
-   Compare the profitability of different collaborations.

#### Financial Calculations

**Net Profit / Net Earnings**

`Net Earnings = Total Received Income - Total Recorded Expenses`

**Pending Payments**

`Pending Payments = Sum of unpaid or partially paid collaboration amounts`

For clarity, expected/pending income should be displayed separately from
received income. It must not be counted as received income in the
net-earnings calculation.

#### Graphs and Insights

The financial dashboard should include:

1.  **Monthly Income vs Expenses:** A bar or line chart comparing income
    received and expenses recorded each month.
2.  **Monthly Net Earnings Trend:** A line chart showing monthly income
    minus monthly expenses.
3.  **Collaboration Profitability:** A simple comparison of income,
    expenses, and net earnings for each collaboration, where records are
    linked.

All graph values should be calculated from the creator's saved financial
records. Do not use fabricated statistics.

#### Workflow

1.  Creator records income from a collaboration or another source.
2.  Creator adds production or collaboration-related expenses.
3.  Financial records are stored in the database and optionally linked
    to a collaboration.
4.  Application calculates totals, pending amounts, expenses, and net
    earnings.
5.  The financial dashboard displays summary cards and graphs.
6.  When a creator adds or edits a financial record, the calculations
    and graphs update automatically.

All financial information is entered manually in the MVP. No bank
account integration or payment gateway is required.

------------------------------------------------------------------------

### 2.5 Creator Professional Profile

**Purpose:** Allow creators to establish a professional identity that
brands can discover and evaluate.

#### Features

-   Profile picture.
-   Creator name and bio.
-   Creator niche.
-   Areas of expertise.
-   Location (optional).
-   Instagram profile link.
-   YouTube profile link.
-   Other social media links.
-   Follower and subscriber counts.
-   Average views.
-   Engagement rate (optional).
-   Portfolio links.
-   Selected collaboration history.
-   Public profile visibility.

#### Important

Social media statistics are entered manually by creators and must be
labelled **self-reported**. The application must not present manually
entered statistics as platform-verified data.

#### Workflow

1.  Creator completes their profile.
2.  Creator enters their social media links and statistics.
3.  Creator adds portfolio links.
4.  Creator chooses which information should be publicly visible.
5.  The application generates a shareable creator profile.
6.  Brands can discover and view the published profile.

------------------------------------------------------------------------

### 2.6 Brand Discovery & Collaboration Portal

**Purpose:** Help brands discover suitable creators and initiate
collaborations.

#### Features

-   Brand registration and login.
-   Brand profile creation.
-   Browse available creators.
-   Search creators by name.
-   Filter creators by niche.
-   Filter creators by social platform.
-   Filter creators by follower range.
-   View creator profiles.
-   View creator portfolios.
-   View creator-provided statistics, clearly labelled as self-reported.
-   Shortlist creators.
-   Send collaboration enquiries.

#### Collaboration Enquiry Information

Brands can submit:

-   Campaign title.
-   Campaign description.
-   Offered payment.
-   Required deliverables.
-   Expected deadlines.
-   Additional requirements.

#### Workflow

1.  Brand creates an account.
2.  Brand searches the creator directory.
3.  Brand views creator profiles.
4.  Brand shortlists suitable creators.
5.  Brand sends a collaboration enquiry.
6.  Creator receives the enquiry in their dashboard.
7.  Creator accepts or rejects the enquiry.
8.  Accepted enquiries can be converted into collaboration records.
9.  Creator can then manage the collaboration, attach its contract, and
    track its finances.

------------------------------------------------------------------------

## 3. Complete Application Workflow

The application follows this connected workflow:

1.  **Creator Registration:** A creator registers and creates their
    account.
2.  **Profile Creation:** Creator adds their niche, social links,
    audience information, and portfolio.
3.  **Brand Discovery:** Brands browse and discover available creators.
4.  **Collaboration Enquiry:** A brand sends a collaboration proposal to
    a creator.
5.  **Enquiry Management:** Creator accepts or rejects the proposal.
6.  **Deal Creation:** Accepted proposals become collaboration records.
7.  **Contract Intelligence:** Creator uploads the contract. The
    application summarises it and extracts important deal terms for the
    creator to review.
8.  **Deal Management:** Creator confirms deal terms and tracks
    deliverables, deadlines, and payment status.
9.  **Financial Tracking:** Creator records received income and
    collaboration-related expenses.
10. **Profitability Insights:** Financial dashboard updates monthly
    income, expenses, net earnings, and collaboration-level comparisons.
11. **Dashboard Updates:** Collaboration and financial information
    update automatically when records change.

The platform connects creator discovery with actual collaboration
management, contract understanding, and financial tracking rather than
functioning as a standalone creator directory.

------------------------------------------------------------------------

## 4. Suggested Technology Stack

The application should use a simple technology stack suitable for
AI-assisted development.

  -----------------------------------------------------------------------
  Layer                   Technology              Purpose
  ----------------------- ----------------------- -----------------------
  Frontend                React + Vite            Application interface

  Styling                 Tailwind CSS            Responsive UI

  Backend Services        Supabase                Database and
                                                  authentication

  Database                PostgreSQL (Supabase)   Persistent application
                                                  data

  Authentication          Supabase Auth           Creator and brand
                                                  accounts

  AI Contract Analysis    Existing Gemini or      Contract summary and
                          OpenAI API              term extraction

  PDF Text Extraction     PDF text extraction     Extract text from
                          library                 uploaded contracts

  Charts                  Recharts                Financial
                                                  visualisations

  Icons                   Lucide React            Interface icons

  Deployment              Vercel                  Application hosting
  -----------------------------------------------------------------------

### Implementation Principles

-   Use Supabase for authentication and database operations.
-   Use role-based access for creator and brand accounts.
-   Store user-specific records in the database.
-   Use database relationships to connect users, collaborations,
    contracts, and financial records.
-   Use an existing LLM API for contract analysis. A custom ML model is
    not required.
-   Use ordinary application logic for financial calculations, payment
    status, and deadlines.
-   Treat AI-extracted contract information as unconfirmed until the
    creator reviews it.
-   Keep sensitive creator information and contracts private by default.
-   Avoid unnecessary third-party API integrations.

------------------------------------------------------------------------

## 5. Database Structure

The following entities provide a starting database design.

### User

-   id
-   name
-   email
-   role (creator / brand)
-   created_at

### CreatorProfile

-   id
-   user_id
-   bio
-   niche
-   location
-   profile_image
-   instagram_url
-   youtube_url
-   follower_count
-   subscriber_count
-   average_views
-   engagement_rate
-   portfolio_links
-   is_public

### BrandProfile

-   id
-   user_id
-   brand_name
-   description
-   industry
-   website
-   logo

### Collaboration

-   id
-   creator_id
-   brand_id (optional, where the brand has an account)
-   campaign_title
-   description
-   payment_amount
-   deliverables
-   submission_deadline
-   publishing_deadline
-   deal_status
-   payment_status
-   contract_document_id (optional)
-   created_at

### ContractDocument

-   id
-   creator_id
-   collaboration_id (optional)
-   file_url
-   original_filename
-   extracted_text
-   ai_summary
-   extracted_terms
-   review_status (pending / confirmed)
-   uploaded_at

### FinancialRecord

-   id
-   creator_id
-   collaboration_id (optional)
-   record_type (income / expense)
-   category
-   amount
-   description
-   transaction_date
-   payment_status

### Enquiry

-   id
-   creator_id
-   brand_id
-   campaign_title
-   description
-   offered_payment
-   deliverables
-   deadline
-   status
-   created_at

### Shortlist

-   id
-   brand_id
-   creator_id
-   created_at

These are conceptual entities and can be adjusted during implementation.
Keep the schema simple and avoid building unnecessary tables.

------------------------------------------------------------------------

## 6. MVP Scope and Priorities

The hackathon MVP should focus on a complete working workflow rather
than implementing every possible feature.

### Priority 1 --- Essential Creator Experience

-   Creator and brand registration/login.
-   Role-based dashboards.
-   Creator profile creation and editing.
-   Collaboration creation and management.
-   Manual income and expense tracking.
-   Automatic financial calculations.
-   Monthly income vs expenses graph.
-   Monthly net-earnings trend graph.

### Priority 2 --- Complete Two-Sided Product Workflow

-   Brand profile creation.
-   Creator directory.
-   Search and basic filters.
-   Creator profile viewing.
-   Brand shortlisting.
-   Collaboration enquiry submission.
-   Creator enquiry management.
-   Accept/reject enquiry functionality.
-   Convert accepted enquiries into collaboration records.

### Priority 3 --- Key Differentiator

-   Contract PDF upload.
-   Text extraction from text-based PDFs.
-   AI-generated contract summary.
-   Extraction of payment, deliverables, and deadlines.
-   Creator review/edit/confirm functionality.
-   Link confirmed contract terms to a collaboration.

If time is limited, prioritise extracting payment, deliverables, and
deadlines first. Exclusivity and usage/licensing clause analysis can be
simplified or left for future development.

### Priority 4 --- UI and Demo Polish

-   Financial charts.
-   Upcoming deadline indicators.
-   Recent activity section.
-   Public shareable creator profiles.
-   Responsive layouts.
-   Empty states and loading indicators.
-   Toast notifications.
-   Sample demonstration data, clearly identified as sample data.

### Features Excluded from the Hackathon MVP

The following features are intentionally excluded to keep implementation
manageable:

-   Gmail account integration.
-   Automatic email extraction.
-   WhatsApp automatic personal-chat integration.
-   Instagram API integration.
-   YouTube API integration.
-   Automatic social media analytics.
-   Platform-verified creator metrics.
-   Bank account integration.
-   Payment gateway integration.
-   Automated payment reconciliation.
-   Scheduled email notifications.
-   Complex creator recommendation algorithms.
-   Advanced campaign analytics.
-   Automated contract negotiation or legal advice.

These can be considered for future development.

------------------------------------------------------------------------

## 7. Future Enhancements

After completing the MVP, the platform can be expanded with:

-   Gmail integration for collaboration communication management.
-   Social media account integrations for platform-connected statistics.
-   Advanced contract comparison and clause analysis.
-   Automated payment reconciliation.
-   Advanced brand-creator matching.
-   Automated payment reminders.
-   Campaign performance analytics.
-   More detailed creator business intelligence.
-   Additional collaboration and campaign management capabilities.

These are future enhancements and are not required for the hackathon
demonstration.

------------------------------------------------------------------------

## 8. Product USP

**CreatorDesk is a unified creator-business management platform that
connects brand discovery, collaboration management, AI-assisted contract
understanding, and financial profitability tracking in one
application.**

The platform focuses on four connected activities:

1.  **Discover:** Help brands find creators suitable for their
    campaigns.
2.  **Connect:** Enable brands and creators to initiate collaborations.
3.  **Understand & Manage:** Help creators understand contract terms and
    manage deals, deliverables, and deadlines.
4.  **Track & Analyse:** Monitor income, expenses, monthly net earnings,
    and collaboration profitability.

Its main value lies in connecting the entire creator collaboration
lifecycle rather than providing isolated tools. The AI-powered contract
summary and structured term extraction add a practical layer of
intelligence to the creator's deal-management workflow.

------------------------------------------------------------------------

## 9. Hackathon Demonstration Scenario

A sample end-to-end demonstration can be performed using two accounts.

### Creator Account

A creator named Aanya:

-   Creates a professional profile.
-   Selects Beauty & Lifestyle as her niche.
-   Adds social media links and self-reported audience statistics.
-   Publishes her profile.

### Brand Account

A skincare brand:

-   Creates a brand account.
-   Searches for beauty creators.
-   Finds Aanya's profile.
-   Sends a collaboration enquiry offering ₹12,000 for two reels.

### Collaboration and Contract Management

-   Aanya receives the enquiry.
-   Aanya accepts the proposal.
-   The enquiry is converted into a collaboration.
-   Aanya uploads a sample contract PDF.
-   The application extracts the payment amount, deliverables, and
    deadlines.
-   Aanya reviews and confirms the extracted information.
-   She adds the deliverables and deadlines to the collaboration.

### Financial Tracking

-   Aanya records ₹12,000 as received collaboration income.
-   Aanya records ₹2,000 in production expenses.
-   The dashboard calculates net earnings of ₹10,000 for the recorded
    transaction data.
-   The financial graph reflects the income, expenses, and net earnings
    for the relevant month.

### Final Dashboard

The creator dashboard displays:

-   Recorded collaboration income: ₹12,000
-   Recorded production expenses: ₹2,000
-   Net earnings: ₹10,000
-   Active collaborations: Updated
-   Pending payments: Updated
-   Upcoming deadlines: Updated
-   Monthly income, expense, and net-earnings graphs: Updated

This demonstration establishes that the platform works as a connected
system from creator discovery to collaboration, contract understanding,
and financial tracking.

------------------------------------------------------------------------

## 10. Development Guidelines

-   Prioritise functional workflows over decorative features.
-   Build the application module by module.
-   Ensure all major forms save information to Supabase.
-   Ensure creator and brand accounts have appropriate permissions.
-   Test the entire collaboration workflow before adding enhancements.
-   Use sample data for demonstration purposes, clearly identifying it
    as sample data.
-   Do not display fabricated platform-verified statistics.
-   Do not build integrations that are unnecessary for the MVP.
-   Ensure the application is usable on both desktop and mobile devices.
-   If AI contract analysis is unavailable, keep manual contract and
    deal entry functional.
-   Test the financial calculations against known income and expense
    examples.

**Final Development Goal:** Build a polished, responsive, and functional
Creator Business Management Platform that demonstrates the complete
journey from creator discovery to collaboration management, AI-assisted
contract understanding, and financial profitability tracking within the
hackathon timeframe.
