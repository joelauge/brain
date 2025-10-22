import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create sample users
  const client1 = await prisma.user.upsert({
    where: { email: 'john@company.com' },
    update: {},
    create: {
      clerkId: 'user_2client1',
      email: 'john@company.com',
      firstName: 'John',
      lastName: 'Smith'
    }
  })

  const client2 = await prisma.user.upsert({
    where: { email: 'sarah@techstartup.com' },
    update: {},
    create: {
      clerkId: 'user_2client2',
      email: 'sarah@techstartup.com',
      firstName: 'Sarah',
      lastName: 'Johnson'
    }
  })

  const admin1 = await prisma.user.upsert({
    where: { email: 'joelauge@gmail.com' },
    update: {},
    create: {
      clerkId: 'user_2admin1',
      email: 'joelauge@gmail.com',
      firstName: 'Joel',
      lastName: 'Auge'
    }
  })

  console.log('✅ Users created')

  // Create sample project requests
  const projectRequest1 = await prisma.projectRequest.create({
    data: {
      clientId: client1.id,
      projectTitle: 'AI Chatbot for Customer Support',
      projectDescription: 'We need a sophisticated AI chatbot that can handle customer inquiries, process orders, and provide 24/7 support. The bot should integrate with our existing CRM system and be able to escalate complex issues to human agents.',
      status: 'pending'
    }
  })

  const projectRequest2 = await prisma.projectRequest.create({
    data: {
      clientId: client2.id,
      projectTitle: 'Machine Learning Recommendation Engine',
      projectDescription: 'Looking to implement a recommendation system for our e-commerce platform. Need ML models that can analyze user behavior and suggest relevant products.',
      status: 'reviewed',
      reviewedAt: new Date(),
      reviewedBy: admin1.id,
      notes: 'High priority project. Client has budget approved.'
    }
  })

  console.log('✅ Project requests created')

  // Create sample project
  const project1 = await prisma.project.create({
    data: {
      clientId: client1.id,
      projectName: 'AI Chatbot for Customer Support',
      projectDescription: 'Sophisticated AI chatbot for customer inquiries and order processing',
      assignedConsultant: 'Joel Auge',
      quotedAmount: 1500000, // $15,000 in cents
      totalProgress: 33,
      paymentStatus: 'partial',
      projectStatus: 'active',
      steps: {
        create: [
          {
            title: 'Discovery & Assessment',
            text: 'Understanding business goals and AI readiness',
            date: 'Step 1',
            status: 'done',
            clientNotes: 'Client provided detailed requirements document',
            consultantNotes: 'Initial assessment complete. Client has good technical foundation.',
            clientSignOff: true,
            consultantSignOff: true,
            completedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
          },
          {
            title: 'Strategy Development',
            text: 'Creating AI implementation roadmap',
            date: 'Step 2',
            status: 'in-progress',
            clientNotes: 'Waiting for strategy document',
            consultantNotes: 'Working on comprehensive AI strategy. Need additional data sources.',
            clientSignOff: false,
            consultantSignOff: false
          },
          {
            title: 'Development & Testing',
            text: 'Building and testing the AI chatbot',
            date: 'Step 3',
            status: 'pending',
            clientNotes: '',
            consultantNotes: '',
            clientSignOff: false,
            consultantSignOff: false
          }
        ]
      }
    }
  })

  console.log('✅ Project created')

  // Create sample resource request
  const steps = await prisma.projectStep.findMany({
    where: { projectId: project1.id }
  })
  
  const resourceRequest1 = await prisma.resourceRequest.create({
    data: {
      projectId: project1.id,
      stepId: steps[1].id, // Second step (index 1)
      title: 'Additional Data Processing',
      description: 'Client requested additional data sources that require extra processing',
      amount: 250000, // $2,500 in cents
      status: 'pending',
      requestedBy: 'admin'
    }
  })

  console.log('✅ Resource request created')

  console.log('🎉 Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
