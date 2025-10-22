# Database Documentation

## Overview

This project uses **SQLite** as the database with **Prisma ORM** for type-safe database operations. The database is designed to support a project management system for AI consulting services.

## Database Configuration

### Environment Variables
```bash
# .env.local
DATABASE_URL="file:./dev.db"
```

### Prisma Configuration
```prisma
generator client {
  provider = "prisma-client-js"
  output   = "../lib/generated/prisma"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```

## Database Schema

### Entity Relationship Diagram

```
User (1) ──→ (N) Project
User (1) ──→ (N) ProjectRequest
Project (1) ──→ (N) ProjectStep
Project (1) ──→ (N) ResourceRequest
ProjectStep (1) ──→ (N) ResourceRequest
```

### Models

#### 1. User Model
```prisma
model User {
  id        String   @id @default(cuid())
  clerkId   String   @unique
  email     String   @unique
  firstName String?
  lastName  String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  projects        Project[]
  projectRequests ProjectRequest[]

  @@map("users")
}
```

**Purpose**: Stores user information from Clerk authentication
**Key Fields**:
- `clerkId`: Unique identifier from Clerk auth system
- `email`: User's email address (unique)
- `firstName/lastName`: Optional user names

#### 2. Project Model
```prisma
model Project {
  id                String   @id @default(cuid())
  clientId          String
  projectName       String
  projectDescription String
  assignedConsultant String
  quotedAmount      Int      // Amount in cents
  totalProgress     Int      @default(0)
  paymentStatus     String   @default("pending") // pending, partial, complete
  projectStatus     String   @default("quoted") // quoted, active, completed, delivered
  finalClientSignOff Boolean @default(false)
  finalConsultantSignOff Boolean @default(false)
  finalPaymentRequired Boolean @default(false)
  completionDate    DateTime?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  // Relations
  client          User            @relation(fields: [clientId], references: [id])
  steps           ProjectStep[]
  resourceRequests ResourceRequest[]

  @@map("projects")
}
```

**Purpose**: Main project entity for consulting engagements
**Key Fields**:
- `quotedAmount`: Stored in cents (e.g., $1500.00 = 150000)
- `totalProgress`: Percentage (0-100)
- `paymentStatus`: Payment tracking
- `projectStatus`: Project lifecycle stage

#### 3. ProjectStep Model
```prisma
model ProjectStep {
  id               String   @id @default(cuid())
  projectId        String
  title            String
  text             String
  date             String   // Step 1, Step 2, etc.
  status           String   @default("pending") // pending, in-progress, done
  clientNotes      String   @default("")
  consultantNotes  String   @default("")
  clientSignOff    Boolean  @default(false)
  consultantSignOff Boolean  @default(false)
  completedDate    DateTime?
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  // Relations
  project          Project          @relation(fields: [projectId], references: [id], onDelete: Cascade)
  resourceRequests ResourceRequest[]

  @@map("project_steps")
}
```

**Purpose**: Individual steps within a project
**Key Features**:
- Bidirectional sign-off system (client + consultant)
- Notes system for both parties
- Status tracking (pending → in-progress → done)

#### 4. ProjectRequest Model
```prisma
model ProjectRequest {
  id                String   @id @default(cuid())
  clientId          String
  projectTitle      String
  projectDescription String
  status            String   @default("pending") // pending, reviewed, approved, rejected
  reviewedAt        DateTime?
  reviewedBy        String?
  notes             String?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  // Relations
  client User @relation(fields: [clientId], references: [id])

  @@map("project_requests")
}
```

**Purpose**: Initial project requests from clients
**Workflow**: pending → reviewed → approved/rejected

#### 5. ResourceRequest Model
```prisma
model ResourceRequest {
  id          String   @id @default(cuid())
  projectId   String?
  stepId      String?
  title       String
  description String
  amount      Int      // Amount in cents
  status      String   @default("pending") // pending, approved, rejected
  requestedBy String   @default("admin") // admin, consultant
  requestedAt DateTime @default(now())
  approvedAt  DateTime?
  rejectedAt  DateTime?

  // Relations
  project Project?     @relation(fields: [projectId], references: [id], onDelete: Cascade)
  step    ProjectStep? @relation(fields: [stepId], references: [id], onDelete: Cascade)

  @@map("resource_requests")
}
```

**Purpose**: Additional resource requests within project steps
**Key Features**:
- Can be linked to both project and specific step
- Approval workflow with timestamps
- Amount tracking in cents

## Database Access Patterns

### API Routes

#### Users
- `GET /api/users` - List all users
- `GET /api/users?clerkId=xxx` - Get user by Clerk ID
- `POST /api/users` - Create new user

#### Projects
- `GET /api/projects` - List projects (with optional clientId filter)
- `GET /api/projects?adminView=true` - Admin view with all projects
- `POST /api/projects` - Create new project
- `PATCH /api/projects/[id]` - Update project details
- `DELETE /api/projects/[id]` - Delete project

#### Project Steps
- `PATCH /api/project-steps` - Update step (status, notes, sign-offs)

#### Project Requests
- `GET /api/project-requests` - List all project requests
- `POST /api/project-requests` - Create new project request
- `PATCH /api/project-requests` - Update request status

#### Resource Requests
- `GET /api/resource-requests` - List all resource requests
- `POST /api/resource-requests` - Create new resource request
- `PATCH /api/resource-requests` - Update request status
- `PATCH /api/resource-requests/[id]` - Update request details
- `DELETE /api/resource-requests/[id]` - Delete resource request

### Service Layer

#### DatabaseService (`lib/database.ts`)
Centralized service class for all database operations:

```typescript
export class DatabaseService {
  // User Operations
  static async getUserByClerkId(clerkId: string): Promise<UserData | null>
  static async createUser(data: CreateUserData): Promise<UserData>
  static async getUsers(): Promise<UserData[]>

  // Project Operations
  static async getProjects(clientId?: string, adminView?: boolean): Promise<ProjectData[]>
  static async createProject(data: CreateProjectData): Promise<ProjectData>
  static async updateProject(id: string, data: UpdateProjectData): Promise<ProjectData>

  // Project Step Operations
  static async updateProjectStep(id: string, data: UpdateStepData): Promise<ProjectStepData>

  // Resource Request Operations
  static async getResourceRequests(): Promise<ResourceRequestData[]>
  static async createResourceRequest(data: CreateResourceRequestData): Promise<ResourceRequestData>
  static async updateResourceRequest(id: string, status: string): Promise<ResourceRequestData>

  // Utility Functions
  static formatCurrency(amountInCents: number): string
}
```

#### ApiService (`lib/api.ts`)
Client-side service for making HTTP requests:

```typescript
class ApiService {
  // Mirror all DatabaseService methods but use fetch() for HTTP calls
  async getUserByClerkId(clerkId: string): Promise<UserData | null>
  async createUser(data: CreateUserData): Promise<UserData>
  async getProjects(clientId?: string, adminView?: boolean): Promise<ProjectData[]>
  // ... etc
}
```

## Data Types & Interfaces

### Core Data Types
```typescript
export interface UserData {
  id: string
  clerkId: string
  email: string
  firstName?: string
  lastName?: string
  createdAt: Date
  updatedAt: Date
}

export interface ProjectData {
  id: string
  clientId: string
  client: UserData
  projectName: string
  projectDescription: string
  assignedConsultant: string
  quotedAmount: number // Stored in cents
  totalProgress: number
  paymentStatus: string
  projectStatus: string
  finalClientSignOff: boolean
  finalConsultantSignOff: boolean
  finalPaymentRequired: boolean
  completionDate?: Date
  createdAt: Date
  updatedAt: Date
  steps: ProjectStepData[]
  resourceRequests: ResourceRequestData[]
}

export interface ProjectStepData {
  id: string
  projectId: string
  title: string
  text: string
  date: string
  status: string
  clientNotes?: string
  consultantNotes?: string
  clientSignOff: boolean
  consultantSignOff: boolean
  completedDate?: Date
  createdAt: Date
  updatedAt: Date
  resourceRequests: ResourceRequestData[]
}

export interface ResourceRequestData {
  id: string
  projectId?: string
  stepId?: string
  title: string
  description: string
  amount: number // Stored in cents
  status: string
  requestedBy: string
  requestedAt: Date
  approvedAt?: Date
  rejectedAt?: Date
}

export interface ProjectRequestData {
  id: string
  clientId: string
  client: UserData
  projectTitle: string
  projectDescription: string
  status: string
  reviewedAt?: Date
  reviewedBy?: string
  notes?: string
  createdAt: Date
  updatedAt: Date
}
```

## Database Operations

### Setup & Migration

#### Initial Setup
```bash
# Install dependencies
npm install prisma @prisma/client

# Generate Prisma client
npx prisma generate

# Create and apply migration
npx prisma db push

# Seed database with sample data
npm run db:seed
```

#### Reset Database
```bash
# Force reset and re-seed
npm run db:reset
```

### Common Operations

#### Creating a Project
```typescript
const project = await apiService.createProject({
  clientId: "user_123",
  projectName: "AI Chatbot Implementation",
  projectDescription: "Build customer support chatbot",
  assignedConsultant: "Joel Auge",
  quotedAmount: 150000, // $1,500.00
  steps: [
    { title: "Discovery", text: "Requirements gathering", status: "pending" },
    { title: "Development", text: "Build chatbot", status: "pending" }
  ]
});
```

#### Updating Project Progress
```typescript
// Update step status (automatically recalculates project progress)
await apiService.updateProjectStep(stepId, {
  status: "done",
  consultantNotes: "Step completed successfully"
});
```

#### Managing Resource Requests
```typescript
// Create resource request
const request = await apiService.createResourceRequest({
  projectId: "proj_123",
  stepId: "step_456",
  title: "Additional Data Processing",
  description: "Extra computational resources needed",
  amount: 25000, // $250.00
  requestedBy: "admin"
});

// Update request details
await apiService.updateResourceRequestDetails(requestId, {
  title: "Updated Title",
  description: "Updated description",
  amount: 30000 // $300.00
});
```

## Business Logic

### Project Lifecycle
1. **Project Request**: Client submits request → `ProjectRequest` created
2. **Approval**: Admin reviews → Status updated to "approved"
3. **Project Creation**: Approved request → `Project` created with default steps
4. **Execution**: Steps progress through pending → in-progress → done
5. **Completion**: All steps done → Project marked as "completed"
6. **Delivery**: Final sign-offs → Project marked as "delivered"

### Progress Calculation
```typescript
// Automatic progress calculation
const completedSteps = project.steps.filter(step => step.status === 'done').length;
const totalProgress = Math.round((completedSteps / project.steps.length) * 100);
```

### Payment Tracking
- **Initial Payment**: 50% when project moves from "quoted" to "active"
- **Resource Requests**: Additional costs approved by client
- **Final Payment**: Remaining balance + approved resource requests

### Sign-off System
- **Step Level**: Both client and consultant must sign off each step
- **Project Level**: Both parties must sign off for final delivery
- **Resource Requests**: Client approval required for additional costs

## Security Considerations

### Access Control
- **Admin Users**: Defined by email addresses in admin dashboard
- **Client Access**: Users can only see their own projects
- **API Security**: All routes protected by authentication middleware

### Data Validation
- **Input Sanitization**: All user inputs validated and sanitized
- **Type Safety**: TypeScript interfaces ensure data consistency
- **Amount Validation**: Currency amounts stored in cents to avoid floating-point issues

### Backup & Recovery
- **SQLite File**: Database stored as `dev.db` file
- **Version Control**: Schema changes tracked via Prisma migrations
- **Seed Data**: Sample data available for development/testing

## Performance Considerations

### Indexing
- **Primary Keys**: All models use `cuid()` for unique, sortable IDs
- **Foreign Keys**: Properly indexed for join operations
- **Unique Constraints**: Email and Clerk ID fields indexed

### Query Optimization
- **Eager Loading**: Related data loaded in single queries
- **Pagination**: Large datasets handled with proper pagination
- **Caching**: Client-side caching for frequently accessed data

### Scalability
- **SQLite Limitations**: Suitable for development and small-medium production
- **Migration Path**: Easy to migrate to PostgreSQL/MySQL for larger scale
- **ORM Benefits**: Prisma provides database-agnostic operations

## Development Workflow

### Making Schema Changes
1. Update `prisma/schema.prisma`
2. Run `npx prisma db push` to apply changes
3. Update TypeScript interfaces in `lib/api.ts`
4. Update API routes if needed
5. Test changes with sample data

### Adding New Features
1. Define data model in Prisma schema
2. Create API routes in `app/api/`
3. Add service methods to `DatabaseService`
4. Update client-side `ApiService`
5. Implement UI components
6. Add to seed data for testing

### Testing Database Operations
```bash
# Run seed script to populate with test data
npm run db:seed

# Reset database for clean testing
npm run db:reset

# Check database in Prisma Studio
npx prisma studio
```

## Troubleshooting

### Common Issues

#### Migration Errors
```bash
# Reset database completely
rm dev.db
npx prisma db push
npm run db:seed
```

#### Type Errors
```bash
# Regenerate Prisma client after schema changes
npx prisma generate
```

#### Connection Issues
- Verify `DATABASE_URL` in `.env.local`
- Ensure `dev.db` file exists and is writable
- Check Prisma client generation

### Debugging Queries
```typescript
// Enable Prisma query logging
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});
```

## Future Enhancements

### Planned Features
- **File Attachments**: Support for project files and documents
- **Time Tracking**: Log hours spent on project steps
- **Notifications**: Email/SMS notifications for status changes
- **Reporting**: Analytics and reporting dashboard
- **Multi-tenancy**: Support for multiple organizations

### Database Migrations
- **PostgreSQL**: For production scalability
- **Redis**: For caching and session management
- **File Storage**: S3-compatible storage for attachments

---

*Last Updated: January 2025*
*Database Version: SQLite with Prisma ORM*
