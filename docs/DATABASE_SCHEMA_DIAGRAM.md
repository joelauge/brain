# Database Schema Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                DATABASE SCHEMA                                 │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│      USER       │    │ PROJECT_REQUEST │    │     PROJECT     │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ id (PK)         │    │ id (PK)         │    │ id (PK)         │
│ clerkId (UK)    │◄───┤ clientId (FK)   │◄───┤ clientId (FK)   │
│ email (UK)      │    │ projectTitle    │    │ projectName     │
│ firstName       │    │ projectDesc     │    │ projectDesc     │
│ lastName        │    │ status          │    │ assignedConsult │
│ createdAt       │    │ reviewedAt     │    │ quotedAmount    │
│ updatedAt       │    │ reviewedBy     │    │ totalProgress   │
└─────────────────┘    │ notes          │    │ paymentStatus   │
                        │ createdAt      │    │ projectStatus   │
                        │ updatedAt      │    │ finalClientSign │
                        └─────────────────┘    │ finalConsultSign│
                                              │ finalPaymentReq │
                                              │ completionDate  │
                                              │ createdAt       │
                                              │ updatedAt       │
                                              └─────────────────┘
                                                       │
                                                       │ 1:N
                                                       ▼
                                              ┌─────────────────┐
                                              │  PROJECT_STEP   │
                                              ├─────────────────┤
                                              │ id (PK)         │
                                              │ projectId (FK)  │
                                              │ title           │
                                              │ text            │
                                              │ date            │
                                              │ status          │
                                              │ clientNotes     │
                                              │ consultantNotes │
                                              │ clientSignOff   │
                                              │ consultantSignOff│
                                              │ completedDate   │
                                              │ createdAt       │
                                              │ updatedAt       │
                                              └─────────────────┘
                                                       │
                                                       │ 1:N
                                                       ▼
                                              ┌─────────────────┐
                                              │ RESOURCE_REQUEST│
                                              ├─────────────────┤
                                              │ id (PK)         │
                                              │ projectId (FK)  │
                                              │ stepId (FK)     │
                                              │ title           │
                                              │ description     │
                                              │ amount          │
                                              │ status          │
                                              │ requestedBy     │
                                              │ requestedAt     │
                                              │ approvedAt      │
                                              │ rejectedAt      │
                                              └─────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                              RELATIONSHIPS                                     │
└─────────────────────────────────────────────────────────────────────────────────┘

User (1) ──→ (N) ProjectRequest
User (1) ──→ (N) Project
Project (1) ──→ (N) ProjectStep
Project (1) ──→ (N) ResourceRequest
ProjectStep (1) ──→ (N) ResourceRequest

┌─────────────────────────────────────────────────────────────────────────────────┐
│                              KEY CONSTRAINTS                                   │
└─────────────────────────────────────────────────────────────────────────────────┘

• User.clerkId: UNIQUE
• User.email: UNIQUE
• Project.clientId: FOREIGN KEY → User.id
• ProjectRequest.clientId: FOREIGN KEY → User.id
• ProjectStep.projectId: FOREIGN KEY → Project.id (CASCADE DELETE)
• ResourceRequest.projectId: FOREIGN KEY → Project.id (CASCADE DELETE)
• ResourceRequest.stepId: FOREIGN KEY → ProjectStep.id (CASCADE DELETE)

┌─────────────────────────────────────────────────────────────────────────────────┐
│                              DATA FLOW                                          │
└─────────────────────────────────────────────────────────────────────────────────┘

1. CLIENT REQUEST FLOW:
   User → ProjectRequest → (Admin Review) → Project → ProjectSteps → ResourceRequests

2. PROJECT EXECUTION FLOW:
   Project (quoted) → ProjectSteps (pending→in-progress→done) → Project (completed)

3. PAYMENT FLOW:
   Project (quoted) → Initial Payment (50%) → ResourceRequests → Final Payment

4. SIGN-OFF FLOW:
   ProjectStep → Client Sign-off + Consultant Sign-off → Step Complete
   Project → Final Client Sign-off + Final Consultant Sign-off → Project Delivered

┌─────────────────────────────────────────────────────────────────────────────────┐
│                              STATUS VALUES                                     │
└─────────────────────────────────────────────────────────────────────────────────┘

Project Status:
• quoted → active → completed → delivered

Payment Status:
• pending → partial → complete

Step Status:
• pending → in-progress → done

Request Status:
• pending → reviewed → approved/rejected

Resource Request Status:
• pending → approved/rejected

┌─────────────────────────────────────────────────────────────────────────────────┘
│                              AMOUNT FORMAT                                     │
└─────────────────────────────────────────────────────────────────────────────────┘

All monetary amounts stored in CENTS:
• $1,500.00 = 150000
• $250.00 = 25000
• $0.50 = 50

Use formatCurrency() helper for display conversion.
