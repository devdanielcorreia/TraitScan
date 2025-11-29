# TraitScan - SaaS Platform Implementation Plan

## Overview
Building a multi-tenant SaaS platform for psychological assessments with Stripe subscriptions, role-based access, and multilingual support.

## Phase 1: Foundation & Database Setup
- [x] 1.1 Initialize Supabase project
- [x] 1.2 Create comprehensive database schema with RLS policies
  - [x] User roles and profiles
  - [x] Psychologists, companies, employees tables
  - [x] Quizzes, questions, alternatives
  - [x] Assessments and assessment_quizzes junction
  - [x] Assessment applications and responses
  - [x] Invitations system
  - [x] Stripe subscriptions tracking
- [x] 1.3 Create TypeScript types for all database tables
- [x] 1.4 Set up database API functions

## Phase 2: Authentication & Authorization
- [x] 2.1 Implement Supabase Auth with miaoda-auth-react
- [x] 2.2 Create login page
- [x] 2.3 Set up role-based route guards
- [ ] 2.4 Implement invitation system with magic links
- [x] 2.5 Create profile management

## Phase 3: Stripe Integration
- [ ] 3.1 Create Stripe checkout Edge Function
- [ ] 3.2 Create Stripe payment verification Edge Function
- [ ] 3.3 Create Stripe webhook handler Edge Function
- [ ] 3.4 Implement subscription status checking
- [ ] 3.5 Add trial period logic (7 days)

## Phase 4: Admin Dashboard
- [ ] 4.1 Admin dashboard with metrics
- [ ] 4.2 Psychologist management (CRUD)
- [ ] 4.3 Company management (CRUD)
- [ ] 4.4 Invitation management
- [ ] 4.5 Subscription and billing overview
- [ ] 4.6 Promote psychologists to admin

## Phase 5: Psychologist Area
- [x] 5.1 Psychologist dashboard
- [x] 5.2 Quiz creation and management
  - [x] Create quiz with 10 questions
  - [x] 4 alternatives per question with weights (1-4)
  - [x] Edit, duplicate, archive quizzes
- [x] 5.3 Assessment template creation
  - [x] Combine multiple quizzes
  - [x] Save as reusable templates
- [x] 5.4 Company management (create companies)
- [x] 5.5 Employee management for their companies
- [x] 5.6 Apply assessments to employees
- [x] 5.7 Generate unique assessment links
- [x] 5.8 View reports and results
- [ ] 5.9 Invite other psychologists

## Phase 6: Company Area
- [x] 6.1 Company dashboard
- [x] 6.2 Employee management (CRUD)
- [ ] 6.3 View assessment reports for their employees
- [ ] 6.4 Subscription management page
- [ ] 6.5 Company settings
- [ ] 6.6 Access control based on subscription status

## Phase 7: Employee Assessment Flow
- [x] 7.1 Unique link generation system
- [x] 7.2 Assessment taking page (no login required)
- [x] 7.3 Display questions and alternatives
- [x] 7.4 Save responses to database
- [x] 7.5 Calculate scores automatically
- [x] 7.6 Generate reports

## Phase 8: Reporting System
- [x] 8.1 Calculate quiz scores (sum of weights)
- [x] 8.2 Calculate percentages
- [x] 8.3 Generate interpretations
- [x] 8.4 Display reports to companies
- [x] 8.5 Display reports to psychologists
- [ ] 8.6 Export functionality

## Phase 9: Internationalization (i18n)
- [x] 9.1 Set up i18n system
- [x] 9.2 Create translation files (PT, EN, ES)
- [x] 9.3 Translate all UI text
- [x] 9.4 Language selector in header
- [x] 9.5 Save language preference to database

## Phase 10: Theme & UI Polish
- [x] 10.1 Implement dark/light theme toggle
- [x] 10.2 Design professional color scheme (blue corporate primary)
- [x] 10.3 Ensure responsive design
- [ ] 10.4 Add loading states and skeletons
- [x] 10.5 Error handling and toast notifications

## Phase 11: Landing Page
- [x] 11.1 Hero section with value proposition
- [x] 11.2 Benefits for companies
- [x] 11.3 How psychologists use the platform
- [x] 11.4 Pricing table
- [x] 11.5 Contact form for companies
- [x] 11.6 Call-to-action sections

## Phase 12: Testing & Validation
- [ ] 12.1 Test all user flows
- [ ] 12.2 Verify RLS policies work correctly
- [ ] 12.3 Test Stripe integration
- [ ] 12.4 Test invitation system
- [ ] 12.5 Verify data isolation between tenants
- [x] 12.6 Run lint checks

## Notes
- Using Supabase for backend (Auth, PostgreSQL, Edge Functions)
- Stripe for subscription billing
- React + TypeScript + Tailwind CSS + shadcn/ui
- Multi-tenant with strict data isolation via RLS
- No direct user registration - invitation-only system
