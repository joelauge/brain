# Database Quick Reference

## Setup Commands

```bash
# Initial setup
npm install prisma @prisma/client
npx prisma generate
npx prisma db push
npm run db:seed

# Reset database
npm run db:reset

# View database
npx prisma studio
```

## Common Operations

### Users
```typescript
// Get user by Clerk ID
const user = await apiService.getUserByClerkId('user_123');

// Create user
const user = await apiService.createUser({
  clerkId: 'user_123',
  email: 'user@example.com',
  firstName: 'John',
  lastName: 'Doe'
});
```

### Projects
```typescript
// Get all projects (admin view)
const projects = await apiService.getProjects(undefined, true);

// Get user's projects
const projects = await apiService.getProjects(userId);

// Create project
const project = await apiService.createProject({
  clientId: 'user_123',
  projectName: 'AI Chatbot',
  projectDescription: 'Customer support bot',
  assignedConsultant: 'Joel Auge',
  quotedAmount: 150000, // $1,500.00
  steps: [
    { title: 'Discovery', text: 'Requirements', status: 'pending' }
  ]
});

// Update project
const updated = await apiService.updateProject(projectId, {
  projectName: 'Updated Name',
  quotedAmount: 200000
});

// Delete project
await apiService.deleteProject(projectId);
```

### Project Steps
```typescript
// Update step
await apiService.updateProjectStep(stepId, {
  status: 'done',
  consultantNotes: 'Completed successfully',
  clientSignOff: true
});
```

### Resource Requests
```typescript
// Create resource request
const request = await apiService.createResourceRequest({
  projectId: 'proj_123',
  stepId: 'step_456',
  title: 'Additional Resources',
  description: 'Extra compute needed',
  amount: 25000, // $250.00
  requestedBy: 'admin'
});

// Update request details
await apiService.updateResourceRequestDetails(requestId, {
  title: 'Updated Title',
  amount: 30000
});

// Update request status
await apiService.updateResourceRequest(requestId, 'approved');

// Delete request
await apiService.deleteResourceRequest(requestId);
```

### Project Requests
```typescript
// Get all project requests
const requests = await apiService.getProjectRequests();

// Create project request
const request = await apiService.createProjectRequest({
  clientId: 'user_123',
  projectTitle: 'New Project',
  projectDescription: 'Project description'
});

// Update request status
await apiService.updateProjectRequest(requestId, {
  status: 'approved',
  notes: 'Approved for development',
  reviewedBy: 'admin_id'
});
```

## Data Formats

### Currency (Amounts)
- All amounts stored in **cents**
- Example: $1,500.00 = 150000
- Use `formatCurrency()` helper for display

### Status Values
- **Project Status**: `quoted`, `active`, `completed`, `delivered`
- **Payment Status**: `pending`, `partial`, `complete`
- **Step Status**: `pending`, `in-progress`, `done`
- **Request Status**: `pending`, `reviewed`, `approved`, `rejected`

### Progress Calculation
```typescript
// Automatic calculation
const completedSteps = project.steps.filter(step => step.status === 'done').length;
const totalProgress = Math.round((completedSteps / project.steps.length) * 100);
```

## Error Handling

### Common Errors
```typescript
try {
  const result = await apiService.someOperation();
} catch (error) {
  console.error('Operation failed:', error);
  // Handle error appropriately
}
```

### Validation
- All inputs validated on both client and server
- TypeScript interfaces ensure type safety
- Prisma validates data constraints

## Testing

### Sample Data
```bash
# Reset and seed with sample data
npm run db:reset
```

### Manual Testing
```typescript
// Test in browser console
const projects = await fetch('/api/projects').then(r => r.json());
console.log(projects);
```

## Schema Changes

### Making Changes
1. Update `prisma/schema.prisma`
2. Run `npx prisma db push`
3. Update TypeScript interfaces
4. Update API routes if needed
5. Test with sample data

### Common Schema Updates
```prisma
// Add new field
model Project {
  // ... existing fields
  priority String @default("medium") // Add this
}

// Add new model
model Notification {
  id        String   @id @default(cuid())
  userId    String
  message   String
  read      Boolean  @default(false)
  createdAt DateTime @default(now())
}
```
