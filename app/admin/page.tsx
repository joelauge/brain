"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import Layout from "@/components/Layout";
import Section from "@/components/Section";
import Heading from "@/components/Heading";
import Button from "@/components/Button";
import { apiService, ProjectData, ProjectRequestData, ResourceRequestData } from "@/lib/api";

const AdminDashboard = () => {
    const { user, isLoaded } = useUser();
    const [activeTab, setActiveTab] = useState<"requests" | "clients" | "resources" | "projects">("requests");
    const [projectRequests, setProjectRequests] = useState<ProjectRequestData[]>([]);
    const [clients, setClients] = useState<any[]>([]);
    const [resourceRequests, setResourceRequests] = useState<ResourceRequestData[]>([]);
    const [activeProjects, setActiveProjects] = useState<ProjectData[]>([]);
    const [selectedProject, setSelectedProject] = useState<ProjectData | null>(null);
    const [selectedRequest, setSelectedRequest] = useState<ProjectRequestData | null>(null);
    const [editingNotes, setEditingNotes] = useState(false);
    const [tempNotes, setTempNotes] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [projectRequestSearch, setProjectRequestSearch] = useState('');
    const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());
    
    // Modal states
    const [showEditProjectModal, setShowEditProjectModal] = useState(false);
    const [showNewProjectModal, setShowNewProjectModal] = useState(false);
    const [showEditResourceModal, setShowEditResourceModal] = useState(false);
    const [showNewResourceModal, setShowNewResourceModal] = useState(false);
    const [showDeleteProjectModal, setShowDeleteProjectModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [editingResourceRequest, setEditingResourceRequest] = useState<ResourceRequestData | null>(null);
    const [creatingResourceForStep, setCreatingResourceForStep] = useState<{projectId: string, stepId: string} | null>(null);
    
    // Form states
    const [editProjectForm, setEditProjectForm] = useState({
        projectName: '',
        projectDescription: '',
        assignedConsultant: '',
        quotedAmount: 0
    });
    
    const [newProjectForm, setNewProjectForm] = useState({
        clientId: '',
        projectName: '',
        projectDescription: '',
        assignedConsultant: '',
        quotedAmount: 0,
        sourceRequestId: '', // Track which request this project came from
        isNewClient: false, // Whether this is for a new client
        newClientEmail: '', // Email for new client
        newClientFirstName: '', // First name for new client
        newClientLastName: '' // Last name for new client
    });
    
    const [editResourceForm, setEditResourceForm] = useState({
        title: '',
        description: '',
        amount: 0
    });
    
    const [newResourceForm, setNewResourceForm] = useState({
        title: '',
        description: '',
        amount: 0
    });

    // Admin email addresses
    const adminEmails = [
        "joelauge@gmail.com",
        "joel@brainmediaconsulting.com", 
        "david@brainmediaconsulting.com"
    ];

    const isAdmin = user?.emailAddresses?.some(email => 
        adminEmails.includes(email.emailAddress)
    );

    useEffect(() => {
        const loadData = async () => {
            if (!isLoaded || !user || !isAdmin) return;
            
            try {
                setIsLoading(true);
                
                // Load all data from database
                const [requests, projects, resources, users] = await Promise.all([
                    apiService.getProjectRequests(),
                    apiService.getProjects(undefined, true), // Admin view
                    apiService.getResourceRequests(),
                    apiService.getUsers()
                ]);

                setProjectRequests(requests);
                setActiveProjects(projects);
                setResourceRequests(resources);
                setClients(users);
                
                // Set first project as selected if available
                if (projects.length > 0 && !selectedProject) {
                    setSelectedProject(projects[0]);
                }
                
                // Set first request as selected if available
                if (requests.length > 0 && !selectedRequest) {
                    setSelectedRequest(requests[0]);
                }
            } catch (error) {
                console.error('Error loading admin data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [isLoaded, user, isAdmin]);

    // Auto-expand active step when project changes
    useEffect(() => {
        if (selectedProject) {
            const activeStepId = getActiveStepId(selectedProject);
            if (activeStepId) {
                setExpandedSteps(new Set([activeStepId]));
            } else if (selectedProject.steps.length > 0) {
                // If no active step found, expand the first step
                setExpandedSteps(new Set([selectedProject.steps[0].id]));
            }
        }
    }, [selectedProject]);

    const handleRequestStatusUpdate = async (requestId: string, status: "approved" | "rejected" | "reviewed", notes?: string) => {
        try {
            const updatedRequest = await apiService.updateProjectRequest(requestId, {
                status,
                notes,
                reviewedBy: user?.id || 'admin'
            });

            setProjectRequests(prev => prev.map(request => 
                request.id === requestId ? updatedRequest : request
            ));
        } catch (error) {
            console.error('Error updating request status:', error);
        }
    };

    const handleArchiveRequest = async (requestId: string) => {
        try {
            const updatedRequest = await apiService.updateProjectRequest(requestId, {
                status: 'archived',
                notes: selectedRequest?.notes || 'Request archived by admin',
                reviewedBy: user?.id || 'admin'
            });
            
            setProjectRequests(prev => prev.map(request => 
                request.id === requestId ? updatedRequest : request
            ));
            
            // Clear selection if the archived request was selected
            if (selectedRequest?.id === requestId) {
                setSelectedRequest(null);
            }
            
            showSuccess('Request archived successfully!');
        } catch (error) {
            console.error('Error archiving request:', error);
            showSuccess('Failed to archive request. Please try again.');
        }
    };

    const handleStartEditingNotes = () => {
        setTempNotes(selectedRequest?.notes || '');
        setEditingNotes(true);
    };

    const handleSaveNotes = async () => {
        if (!selectedRequest) return;
        
        try {
            const updatedRequest = await apiService.updateProjectRequest(selectedRequest.id, {
                status: selectedRequest.status,
                notes: tempNotes,
                reviewedBy: user?.id || 'admin'
            });
            
            setProjectRequests(prev => prev.map(request => 
                request.id === selectedRequest.id ? updatedRequest : request
            ));
            
            setSelectedRequest(updatedRequest);
            setEditingNotes(false);
            showSuccess('Notes updated successfully!');
        } catch (error) {
            console.error('Error updating notes:', error);
            showSuccess('Failed to update notes. Please try again.');
        }
    };

    const handleCancelEditingNotes = () => {
        setEditingNotes(false);
        setTempNotes('');
    };

    const handleResourceRequestStatusUpdate = async (requestId: string, status: "approved" | "rejected") => {
        try {
            const updatedRequest = await apiService.updateResourceRequest(requestId, status);
            
            setResourceRequests(prev => prev.map(request => 
                request.id === requestId ? updatedRequest : request
            ));

            // Also update in active projects
            setActiveProjects(prev => prev.map(project => ({
                ...project,
                steps: project.steps.map(step => ({
                    ...step,
                    resourceRequests: step.resourceRequests.map(req => 
                        req.id === requestId ? updatedRequest : req
                    )
                }))
            })));
        } catch (error) {
            console.error('Error updating resource request status:', error);
        }
    };

    const handleConsultantNotesUpdate = async (projectId: string, stepId: string, notes: string) => {
        try {
            await apiService.updateProjectStep(stepId, { consultantNotes: notes });
            
            setActiveProjects(prev => prev.map(project => 
                project.id === projectId 
                    ? {
                        ...project,
                        steps: project.steps.map(step => 
                            step.id === stepId ? { ...step, consultantNotes: notes } : step
                        )
                    }
                    : project
            ));
        } catch (error) {
            console.error('Error updating consultant notes:', error);
        }
    };

    const handleStepStatusUpdate = async (projectId: string, stepId: string, status: "pending" | "in-progress" | "done") => {
        try {
            // Find the project and step
            const project = activeProjects.find(p => p.id === projectId);
            if (!project) return;

            const stepIndex = project.steps.findIndex(s => s.id === stepId);
            if (stepIndex === -1) return;

            const currentStep = project.steps[stepIndex];

            // Enforce sequential completion - can't move to next step without completing previous ones
            if (status === 'in-progress' || status === 'done') {
                // Check if all previous steps are completed
                for (let i = 0; i < stepIndex; i++) {
                    if (project.steps[i].status !== 'done') {
                        showSuccess(`Cannot start this step. Step ${i + 1} (${project.steps[i].title}) must be completed first.`);
                        return;
                    }
                }
            }

            // If moving to 'done', ensure both client and consultant have signed off
            if (status === 'done' && (!currentStep.clientSignOff || !currentStep.consultantSignOff)) {
                showSuccess('Cannot mark step as done. Both client and consultant must sign off first.');
                return;
            }

            await apiService.updateProjectStep(stepId, { status });
            
            setActiveProjects(prev => prev.map(project => {
                if (project.id !== projectId) return project;
                
                const updatedSteps = project.steps.map(step => 
                    step.id === stepId 
                        ? { 
                            ...step, 
                            status,
                            completedDate: status === 'done' ? new Date().toISOString() : undefined
                        }
                        : step
                );

                // Recalculate progress
                const completedSteps = updatedSteps.filter(step => step.status === 'done').length;
                const totalProgress = Math.round((completedSteps / updatedSteps.length) * 100);

                return {
                    ...project,
                    steps: updatedSteps,
                    totalProgress
                };
            }));

            // Auto-expand next step if current step was completed
            if (status === 'done') {
                const project = activeProjects.find(p => p.id === projectId);
                if (project) {
                    const updatedSteps = project.steps.map(step => 
                        step.id === stepId 
                            ? { ...step, status, completedDate: new Date().toISOString() }
                            : step
                    );
                    const nextActiveStep = updatedSteps.find(step => step.status !== 'done');
                    if (nextActiveStep) {
                        setExpandedSteps(new Set([nextActiveStep.id]));
                    }
                }
            }
        } catch (error) {
            console.error('Error updating step status:', error);
        }
    };

    const handleResourceRequestCreate = async (projectId: string, stepId: string, title: string, description: string, amount: number) => {
        try {
            const newRequest = await apiService.createResourceRequest({
                projectId,
                stepId,
                title,
                description,
                amount,
                requestedBy: 'admin'
            });

            setActiveProjects(prev => prev.map(project => 
                project.id === projectId 
                    ? {
                        ...project,
                        steps: project.steps.map(step => 
                            step.id === stepId 
                                ? { 
                                    ...step, 
                                    resourceRequests: [...step.resourceRequests, newRequest]
                                }
                                : step
                        )
                    }
                    : project
            ));

            // Also add to global resource requests
            setResourceRequests(prev => [...prev, newRequest]);
        } catch (error) {
            console.error('Error creating resource request:', error);
        }
    };

    const handleCreateNewResourceRequest = async () => {
        if (!creatingResourceForStep) return;
        
        try {
            await handleResourceRequestCreate(
                creatingResourceForStep.projectId,
                creatingResourceForStep.stepId,
                newResourceForm.title,
                newResourceForm.description,
                newResourceForm.amount
            );
            
            setShowNewResourceModal(false);
            setCreatingResourceForStep(null);
            setNewResourceForm({title: '', description: '', amount: 0});
            showSuccess('Resource request created successfully!');
        } catch (error) {
            console.error('Error creating resource request:', error);
            showSuccess('Failed to create resource request. Please try again.');
        }
    };

    // Project management handlers
    const handleEditProject = () => {
        if (selectedProject) {
            setEditProjectForm({
                projectName: selectedProject.projectName,
                projectDescription: selectedProject.projectDescription,
                assignedConsultant: selectedProject.assignedConsultant,
                quotedAmount: selectedProject.quotedAmount
            });
            setShowEditProjectModal(true);
        }
    };

    const handleUpdateProject = async () => {
        if (!selectedProject) return;
        
        try {
            const updatedProject = await apiService.updateProject(selectedProject.id, editProjectForm);
            
            setActiveProjects(prev => prev.map(project => 
                project.id === selectedProject.id ? updatedProject : project
            ));
            
            setSelectedProject(updatedProject);
            setShowEditProjectModal(false);
        } catch (error) {
            console.error('Error updating project:', error);
        }
    };

    const handleDeleteProject = async () => {
        if (!selectedProject) return;
        
        try {
            await apiService.deleteProject(selectedProject.id);
            
            setActiveProjects(prev => prev.filter(project => project.id !== selectedProject.id));
            setSelectedProject(null);
            setShowDeleteProjectModal(false);
        } catch (error) {
            console.error('Error deleting project:', error);
        }
    };

    const showSuccess = (message: string) => {
        setSuccessMessage(message);
        setShowSuccessModal(true);
    };

    const handleResendInvite = async (project: ProjectData) => {
        try {
            await apiService.resendProjectInvite({
                email: project.client.email,
                firstName: project.client.firstName || '',
                projectName: project.projectName,
                projectDescription: project.projectDescription,
                quotedAmount: project.quotedAmount,
                assignedConsultant: project.assignedConsultant
            });
            
            // Update last invite sent time
            await apiService.updateUserInviteStatus(project.client.id, {
                lastInviteSentAt: new Date().toISOString()
            });
            
            // Refresh the project data
            const updatedProjects = await apiService.getProjects(undefined, true); // Pass adminView=true
            setActiveProjects(updatedProjects);
            
            showSuccess('Invite resent successfully!');
        } catch (error) {
            console.error('Error resending invite:', error);
            showSuccess('Failed to resend invite. Please try again.');
        }
    };

    const handleCreateNewProject = async () => {
        try {
            const { sourceRequestId, isNewClient, newClientEmail, newClientFirstName, newClientLastName, ...projectData } = newProjectForm;
            
            let clientId = projectData.clientId;
            
            // If this is a new client, create the user first
            if (isNewClient && newClientEmail) {
                try {
                    const newUser = await apiService.createUser({
                        clerkId: `temp_${Date.now()}`, // Temporary ID, will be updated when they sign up
                        email: newClientEmail,
                        firstName: newClientFirstName,
                        lastName: newClientLastName
                    });
                    clientId = newUser.id;
                    
                    // Set invite tracking
                    await apiService.updateUserInviteStatus(newUser.id, {
                        inviteSentAt: new Date().toISOString(),
                        lastInviteSentAt: new Date().toISOString()
                    });
                } catch (error) {
                    console.error('Error creating new user:', error);
                        showSuccess('Failed to create new client. Please try again.');
                    return;
                }
            }
            
            if (!clientId) {
                showSuccess('Please select a client or provide new client details.');
                return;
            }
            
            const newProject = await apiService.createProject({
                ...projectData,
                clientId,
                steps: [
                    { title: 'Discovery & Assessment', text: 'Understanding business goals and AI readiness', status: 'pending' },
                    { title: 'Strategy Development', text: 'Creating AI implementation roadmap', status: 'pending' },
                    { title: 'Development & Testing', text: 'Building and testing the solution', status: 'pending' }
                ]
            });
            
            setActiveProjects(prev => [newProject, ...prev]);
            setSelectedProject(newProject);
            setShowNewProjectModal(false);
            
            // If this project was created from a request, mark the request as converted
            if (sourceRequestId) {
                try {
                    await apiService.updateProjectRequest(sourceRequestId, {
                        status: 'converted',
                        notes: 'Project created and moved to active projects'
                    });
                    
                    // Update the project requests list
                    setProjectRequests(prev => prev.map(request => 
                        request.id === sourceRequestId 
                            ? { ...request, status: 'converted', notes: 'Project created and moved to active projects' }
                            : request
                    ));
                } catch (error) {
                    console.error('Error updating request status:', error);
                }
            }
            
            // If this is a new client, send them an email notification
            if (isNewClient && newClientEmail) {
                try {
                    await apiService.sendProjectNotification({
                        email: newClientEmail,
                        firstName: newClientFirstName,
                        projectName: projectData.projectName,
                        projectDescription: projectData.projectDescription,
                        quotedAmount: projectData.quotedAmount,
                        assignedConsultant: projectData.assignedConsultant
                    });
                } catch (error) {
                    console.error('Error sending notification email:', error);
                    // Don't block the project creation if email fails
                }
            }
            
            setNewProjectForm({
                clientId: '',
                projectName: '',
                projectDescription: '',
                assignedConsultant: '',
                quotedAmount: 0,
                sourceRequestId: '',
                isNewClient: false,
                newClientEmail: '',
                newClientFirstName: '',
                newClientLastName: ''
            });
        } catch (error) {
            console.error('Error creating project:', error);
        }
    };

    const handleCreateProjectFromRequest = async (request: ProjectRequestData) => {
        try {
            // Pre-populate the new project form with request data
            setNewProjectForm({
                clientId: request.clientId,
                projectName: request.projectTitle,
                projectDescription: request.projectDescription,
                assignedConsultant: 'Joel Auge', // Default consultant
                quotedAmount: 0, // Will need to be set manually
                sourceRequestId: '',
                isNewClient: false,
                newClientEmail: '',
                newClientFirstName: '',
                newClientLastName: ''
            });
            
            // Store the request ID to mark it as converted later
            setNewProjectForm(prev => ({ ...prev, sourceRequestId: request.id }));
            
            // Show the new project modal
            setShowNewProjectModal(true);
            
            // Switch to the projects tab to show the new project once created
            setActiveTab('projects');
        } catch (error) {
            console.error('Error preparing project from request:', error);
        }
    };

    // Resource request management handlers
    const handleEditResourceRequest = (resourceRequest: ResourceRequestData) => {
        setEditingResourceRequest(resourceRequest);
        setEditResourceForm({
            title: resourceRequest.title,
            description: resourceRequest.description,
            amount: resourceRequest.amount
        });
        setShowEditResourceModal(true);
    };

    const handleUpdateResourceRequest = async () => {
        if (!editingResourceRequest) return;
        
        try {
            const updatedRequest = await apiService.updateResourceRequestDetails(editingResourceRequest.id, editResourceForm);
            
            setActiveProjects(prev => prev.map(project => ({
                ...project,
                steps: project.steps.map(step => ({
                    ...step,
                    resourceRequests: step.resourceRequests.map(req => 
                        req.id === editingResourceRequest.id ? updatedRequest : req
                    )
                }))
            })));
            
            setResourceRequests(prev => prev.map(req => 
                req.id === editingResourceRequest.id ? updatedRequest : req
            ));
            
            setShowEditResourceModal(false);
            setEditingResourceRequest(null);
        } catch (error) {
            console.error('Error updating resource request:', error);
        }
    };

    const handleDeleteResourceRequest = async (resourceRequestId: string) => {
        if (confirm('Are you sure you want to delete this resource request?')) {
            try {
                await apiService.deleteResourceRequest(resourceRequestId);
                
                setActiveProjects(prev => prev.map(project => ({
                    ...project,
                    steps: project.steps.map(step => ({
                        ...step,
                        resourceRequests: step.resourceRequests.filter(req => req.id !== resourceRequestId)
                    }))
                })));
                
                setResourceRequests(prev => prev.filter(req => req.id !== resourceRequestId));
            } catch (error) {
                console.error('Error deleting resource request:', error);
            }
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString();
    };

    // Filter project requests based on search and status
    const getFilteredProjectRequests = () => {
        let filtered = projectRequests;
        
        // Filter by search term
        if (projectRequestSearch.trim()) {
            const searchTerm = projectRequestSearch.toLowerCase();
            filtered = filtered.filter(request => 
                request.projectTitle.toLowerCase().includes(searchTerm) ||
                request.projectDescription.toLowerCase().includes(searchTerm) ||
                (request.client.firstName?.toLowerCase().includes(searchTerm) || false) ||
                (request.client.lastName?.toLowerCase().includes(searchTerm) || false) ||
                request.client.email.toLowerCase().includes(searchTerm) ||
                (request.notes && request.notes.toLowerCase().includes(searchTerm)) ||
                request.status.toLowerCase().includes(searchTerm)
            );
        }
        
        return filtered;
    };

    const getActiveProjectRequests = () => {
        return getFilteredProjectRequests().filter(request => 
            request.status !== 'converted' && request.status !== 'archived'
        );
    };

    const getConvertedProjectRequests = () => {
        return getFilteredProjectRequests().filter(request => request.status === 'converted');
    };

    const getArchivedProjectRequests = () => {
        return getFilteredProjectRequests().filter(request => request.status === 'archived');
    };

    const getActiveStepId = (project: ProjectData) => {
        // Find the first step that is not completed
        const activeStep = project.steps.find(step => step.status !== 'done');
        return activeStep ? activeStep.id : project.steps[project.steps.length - 1]?.id;
    };

    const toggleStepExpansion = (stepId: string) => {
        setExpandedSteps(prev => {
            const newSet = new Set(prev);
            if (newSet.has(stepId)) {
                newSet.delete(stepId);
            } else {
                newSet.add(stepId);
            }
            return newSet;
        });
    };

    const getInviteStatus = (client: any) => {
        if (!client.inviteSentAt) {
            return { status: 'not-invited', label: 'Not Invited', color: 'text-n-4' };
        }
        
        if (client.inviteAcceptedAt) {
            return { status: 'accepted', label: 'Invite Accepted', color: 'text-green-400' };
        }
        
        return { status: 'pending', label: 'Invite Pending', color: 'text-yellow-400' };
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount / 100);
    };

    if (!isLoaded || isLoading) {
        return (
            <Layout>
                <Section className="py-20">
                    <div className="container">
                        <div className="text-center">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-color-1"></div>
                            <p className="mt-4 body-2 text-n-3">Loading admin dashboard...</p>
                        </div>
                    </div>
                </Section>
            </Layout>
        );
    }

    if (!user || !isAdmin) {
        return (
            <Layout>
                <Section className="py-20">
                    <div className="container">
                        <div className="text-center">
                            <h2 className="h2 mb-4">Access Denied</h2>
                            <p className="body-2 text-n-3 mb-8">You don't have permission to access the admin dashboard.</p>
                            <Button href="/">Go Home</Button>
                        </div>
                    </div>
                </Section>
            </Layout>
        );
    }

    return (
        <Layout>
            <Section className="py-20">
                <div className="container">
                    <div className="mb-12 text-center">
                        <Heading
                            className="mb-4"
                            titleLarge="Admin Dashboard"
                            textLarge={`Welcome back, ${user.firstName || 'Admin'}. Manage project requests, clients, and resources.`}
                        />
                    </div>

                    {/* Tab Navigation */}
                    <div className="mb-8">
                        <div className="flex space-x-1 bg-n-8 rounded-xl p-1 max-w-2xl mx-auto">
                            <button
                                onClick={() => setActiveTab("requests")}
                                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                                    activeTab === "requests"
                                        ? 'bg-color-1 text-n-8'
                                        : 'text-n-3 hover:text-n-1'
                                }`}
                            >
                                Project Requests
                            </button>
                            <button
                                onClick={() => setActiveTab("projects")}
                                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                                    activeTab === "projects"
                                        ? 'bg-color-1 text-n-8'
                                        : 'text-n-3 hover:text-n-1'
                                }`}
                            >
                                Manage Projects
                            </button>
                            <button
                                onClick={() => setActiveTab("clients")}
                                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                                    activeTab === "clients"
                                        ? 'bg-color-1 text-n-8'
                                        : 'text-n-3 hover:text-n-1'
                                }`}
                            >
                                Clients
                            </button>
                            <button
                                onClick={() => setActiveTab("resources")}
                                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                                    activeTab === "resources"
                                        ? 'bg-color-1 text-n-8'
                                        : 'text-n-3 hover:text-n-1'
                                }`}
                            >
                                Resources
                            </button>
                        </div>
                    </div>

                    {/* Project Requests Tab */}
                    {activeTab === "requests" && (
                        <div className="flex gap-6">
                            {/* Request Selector Sidebar */}
                            <div className="w-80 flex-shrink-0">
                                <div className="bg-n-8 rounded-2xl border border-n-6 p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="h6 text-n-1">Project Requests</h3>
                                        <div className="text-sm text-n-3">
                                            {getActiveProjectRequests().filter(r => r.status === 'pending').length} pending
                                        </div>
                                    </div>

                                    {/* Search Bar */}
                                    <div className="relative mb-6">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <svg className="h-4 w-4 text-n-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                            </svg>
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Search requests..."
                                            value={projectRequestSearch}
                                            onChange={(e) => setProjectRequestSearch(e.target.value)}
                                            className="w-full bg-n-7 border border-n-5 text-n-1 px-9 py-2 rounded-lg focus:border-color-1 focus:outline-none placeholder:text-n-4 text-sm"
                                        />
                                        {projectRequestSearch && (
                                            <button
                                                onClick={() => setProjectRequestSearch('')}
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-n-4 hover:text-n-2"
                                            >
                                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        )}
                                    </div>

                                    {getActiveProjectRequests().length === 0 ? (
                                        <div className="text-center py-8">
                                            <p className="body-2 text-n-3">
                                                {projectRequestSearch ? 'No requests match your search.' : 'No active project requests.'}
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {getActiveProjectRequests().map((request) => (
                                                <button
                                                    key={request.id}
                                                    onClick={() => setSelectedRequest(request)}
                                                    className={`w-full text-left p-4 rounded-xl border transition-all ${
                                                        selectedRequest?.id === request.id
                                                            ? 'bg-color-1/10 border-color-1/50 text-n-1'
                                                            : 'bg-n-7 border-n-6 text-n-3 hover:bg-n-6 hover:text-n-1'
                                                    }`}
                                                >
                                                    <div className="mb-2">
                                                        <h4 className="body-2 font-semibold text-n-1 mb-1">{request.projectTitle}</h4>
                                                        <p className="caption text-n-4">{request.client.firstName} {request.client.lastName}</p>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                            request.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                                                            request.status === 'reviewed' ? 'bg-blue-500/20 text-blue-400' :
                                                            request.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                                                            request.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                                                            request.status === 'archived' ? 'bg-gray-500/20 text-gray-400' :
                                                            'bg-purple-500/20 text-purple-400'
                                                        }`}>
                                                            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                                                        </span>
                                                        <span className="caption text-n-4">{formatDate(request.createdAt)}</span>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {/* Converted Projects Section */}
                                    {getConvertedProjectRequests().length > 0 && (
                                        <div className="mt-8">
                                            <h4 className="h6 text-n-1 mb-4">Converted Projects</h4>
                                            <div className="space-y-3">
                                                {getConvertedProjectRequests().map((request) => (
                                                    <div
                                                        key={request.id}
                                                        className="w-full text-left p-4 rounded-xl border bg-n-7 border-n-6 text-n-3 opacity-75"
                                                    >
                                                        <div className="mb-2">
                                                            <h4 className="body-2 font-semibold text-n-1 mb-1">{request.projectTitle}</h4>
                                                            <p className="caption text-n-4">{request.client.firstName} {request.client.lastName}</p>
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <span className="px-2 py-1 rounded text-xs font-medium bg-purple-500/20 text-purple-400">
                                                                Converted
                                                            </span>
                                                            <span className="caption text-n-4">{formatDate(request.reviewedAt || request.createdAt)}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Archived Projects Section */}
                                    {getArchivedProjectRequests().length > 0 && (
                                        <div className="mt-8">
                                            <h4 className="h6 text-n-1 mb-4">Archived Projects</h4>
                                            <div className="space-y-3">
                                                {getArchivedProjectRequests().map((request) => (
                                                    <div
                                                        key={request.id}
                                                        className="w-full text-left p-4 rounded-xl border bg-n-7 border-n-6 text-n-3 opacity-60"
                                                    >
                                                        <div className="mb-2">
                                                            <h4 className="body-2 font-semibold text-n-1 mb-1">{request.projectTitle}</h4>
                                                            <p className="caption text-n-4">{request.client.firstName} {request.client.lastName}</p>
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <span className="px-2 py-1 rounded text-xs font-medium bg-gray-500/20 text-gray-400">
                                                                Archived
                                                            </span>
                                                            <span className="caption text-n-4">{formatDate(request.reviewedAt || request.createdAt)}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Request Details */}
                            <div className="flex-1">
                                {selectedRequest ? (
                                    <div className="bg-n-8 rounded-2xl border border-n-6 p-6">
                                        <div className="flex items-center justify-between mb-6">
                                            <div>
                                                <h3 className="h5 text-n-1 mb-2">{selectedRequest.projectTitle}</h3>
                                                <div className="flex items-center space-x-3">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                        selectedRequest.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                                                        selectedRequest.status === 'reviewed' ? 'bg-blue-500/20 text-blue-400' :
                                                        selectedRequest.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                                                        selectedRequest.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                                                        selectedRequest.status === 'archived' ? 'bg-gray-500/20 text-gray-400' :
                                                        'bg-purple-500/20 text-purple-400'
                                                    }`}>
                                                        {selectedRequest.status.charAt(0).toUpperCase() + selectedRequest.status.slice(1)}
                                                    </span>
                                                    <span className="caption text-n-4">Requested: {formatDate(selectedRequest.createdAt)}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            {/* Project Description */}
                                            <div>
                                                <h4 className="h6 text-n-1 mb-3">Project Description</h4>
                                                <p className="body-2 text-n-3 bg-n-7 rounded-lg p-4">{selectedRequest.projectDescription}</p>
                                            </div>

                                            {/* Client Information */}
                                            <div>
                                                <h4 className="h6 text-n-1 mb-3">Client Information</h4>
                                                <div className="bg-n-7 rounded-lg p-4">
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <p className="caption text-n-4 mb-1">Name</p>
                                                            <p className="body-2 text-n-1">{selectedRequest.client.firstName} {selectedRequest.client.lastName}</p>
                                                        </div>
                                                        <div>
                                                            <p className="caption text-n-4 mb-1">Email</p>
                                                            <p className="body-2 text-n-1">{selectedRequest.client.email}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Admin Notes */}
                                            <div>
                                                <div className="flex items-center justify-between mb-3">
                                                    <h4 className="h6 text-n-1">Admin Notes</h4>
                                                    {!editingNotes && (
                                                        <button
                                                            onClick={handleStartEditingNotes}
                                                            className="text-color-1 hover:text-color-1/80 text-sm font-medium"
                                                        >
                                                            {selectedRequest.notes ? 'Edit Notes' : 'Add Notes'}
                                                        </button>
                                                    )}
                                                </div>
                                                
                                                {editingNotes ? (
                                                    <div className="space-y-3">
                                                        <textarea
                                                            value={tempNotes}
                                                            onChange={(e) => setTempNotes(e.target.value)}
                                                            placeholder="Add your notes about this project request..."
                                                            className="w-full bg-n-7 border border-n-5 text-n-1 placeholder:text-n-4 focus:border-color-1 focus:outline-none px-3 py-2 rounded-lg resize-none"
                                                            rows={4}
                                                        />
                                                        <div className="flex space-x-2">
                                                            <Button
                                                                onClick={handleSaveNotes}
                                                                className="text-xs px-3 py-1"
                                                            >
                                                                Save Notes
                                                            </Button>
                                                            <Button
                                                                onClick={handleCancelEditingNotes}
                                                                className="text-xs px-3 py-1"
                                                            >
                                                                Cancel
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="bg-n-7 rounded-lg p-4 min-h-[60px]">
                                                        {selectedRequest.notes ? (
                                                            <p className="body-2 text-n-3">{selectedRequest.notes}</p>
                                                        ) : (
                                                            <p className="body-2 text-n-4 italic">No notes added yet</p>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="pt-4 border-t border-n-6">
                                                {selectedRequest.status === "pending" && (
                                                    <div className="flex space-x-3">
                                                        <Button
                                                            onClick={() => handleRequestStatusUpdate(selectedRequest.id, "approved", "Project approved for development")}
                                                        >
                                                            Approve
                                                        </Button>
                                                        <Button
                                                            onClick={() => handleRequestStatusUpdate(selectedRequest.id, "rejected", "Project scope needs clarification")}
                                                        >
                                                            Reject
                                                        </Button>
                                                        <Button
                                                            onClick={() => handleRequestStatusUpdate(selectedRequest.id, "reviewed", "Under review - will contact client")}
                                                        >
                                                            Mark Reviewed
                                                        </Button>
                                                    </div>
                                                )}

                                                {selectedRequest.status === "approved" && (
                                                    <div className="flex space-x-3">
                                                        <Button
                                                            onClick={() => handleCreateProjectFromRequest(selectedRequest)}
                                                        >
                                                            Create Project
                                                        </Button>
                                                        <Button
                                                            onClick={() => handleRequestStatusUpdate(selectedRequest.id, "rejected", "Project scope needs clarification")}
                                                        >
                                                            Reject
                                                        </Button>
                                                    </div>
                                                )}

                                                {selectedRequest.status === "converted" && (
                                                    <div className="flex items-center space-x-2 text-purple-400">
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                        <span className="text-sm font-medium">Project created and moved to active projects</span>
                                                    </div>
                                                )}

                                                {selectedRequest.status === "archived" && (
                                                    <div className="flex items-center space-x-2 text-gray-400">
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8l4 4-4 4m9-4H9" />
                                                        </svg>
                                                        <span className="text-sm font-medium">This request has been archived</span>
                                                    </div>
                                                )}

                                                {/* Archive Button - Show for all non-archived requests */}
                                                {selectedRequest.status !== "archived" && (
                                                    <div className="mt-4 pt-4 border-t border-n-6">
                                            <Button
                                                onClick={() => handleArchiveRequest(selectedRequest.id)}
                                            >
                                                Archive Request
                                            </Button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-n-8 rounded-2xl border border-n-6 p-12 text-center">
                                        <div className="w-16 h-16 bg-n-7 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <svg className="w-8 h-8 text-n-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                        </div>
                                        <h3 className="h5 text-n-1 mb-2">No Request Selected</h3>
                                        <p className="body-2 text-n-3">Select a project request from the sidebar to view details and take action.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Manage Projects Tab */}
                    {activeTab === "projects" && (
                        <div className="flex gap-6">
                            {/* Project Selector Sidebar */}
                            <div className="w-80 flex-shrink-0">
                                <div className="bg-n-8 rounded-2xl border border-n-6 p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="h6 text-n-1">Projects</h3>
                                        <div className="flex items-center space-x-2">
                                            <div className="text-sm text-n-3">
                                                {activeProjects.length} active
                                            </div>
                                            <Button
                                                onClick={() => setShowNewProjectModal(true)}
                                                className="text-xs px-3 py-1"
                                            >
                                                + New
                                            </Button>
                                        </div>
                                    </div>

                                    {activeProjects.length === 0 ? (
                                        <div className="text-center py-8">
                                            <p className="body-2 text-n-3">No active projects found.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {activeProjects.map((project) => (
                                                <button
                                                    key={project.id}
                                                    onClick={() => setSelectedProject(project)}
                                                    className={`w-full text-left p-4 rounded-xl border transition-all ${
                                                        selectedProject?.id === project.id
                                                            ? 'bg-color-1/10 border-color-1/50 text-n-1'
                                                            : 'bg-n-7 border-n-6 text-n-3 hover:bg-n-6 hover:text-n-1'
                                                    }`}
                                                >
                                                    <div className="mb-2">
                                                        <h4 className="body-2 font-semibold text-n-1 mb-1">{project.projectName}</h4>
                                                        <p className="caption text-n-4">{project.client.firstName} {project.client.lastName}</p>
                                                    </div>
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="caption text-n-4">{formatCurrency(project.quotedAmount)}</span>
                                                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                            project.projectStatus === 'delivered' ? 'bg-green-500/20 text-green-400' :
                                                            project.projectStatus === 'completed' ? 'bg-blue-500/20 text-blue-400' :
                                                            'bg-yellow-500/20 text-yellow-400'
                                                        }`}>
                                                            {project.projectStatus.charAt(0).toUpperCase() + project.projectStatus.slice(1)}
                                                        </span>
                                                    </div>
                                                    <div className="w-full bg-n-8 rounded-full h-1.5">
                                                        <div 
                                                            className="bg-color-1 h-1.5 rounded-full transition-all duration-500"
                                                            style={{ width: `${project.totalProgress}%` }}
                                                        ></div>
                                                    </div>
                                                    <div className="mt-2 text-right">
                                                        <span className="caption text-n-4">{project.totalProgress}% complete</span>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Project Details */}
                            <div className="flex-1">
                                {selectedProject ? (
                                    <div className="bg-n-8 rounded-2xl border border-n-6 p-6">
                                        <div className="flex items-start justify-between mb-6">
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-2">
                                                    <h4 className="h5 text-n-1">{selectedProject.projectName}</h4>
                                                    <div className="flex items-center space-x-3">
                                                        <Button
                                                            onClick={handleEditProject}
                                                            className="text-xs px-3 py-1"
                                                        >
                                                            Edit
                                                        </Button>
                                                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                                            selectedProject.projectStatus === 'delivered' ? 'bg-green-500/20 text-green-400' :
                                                            selectedProject.projectStatus === 'completed' ? 'bg-blue-500/20 text-blue-400' :
                                                            'bg-yellow-500/20 text-yellow-400'
                                                        }`}>
                                                            {selectedProject.projectStatus.charAt(0).toUpperCase() + selectedProject.projectStatus.slice(1)}
                                                        </div>
                                                    </div>
                                                </div>
                                                <p className="body-2 text-n-3 mb-1">{selectedProject.client.firstName} {selectedProject.client.lastName} • {selectedProject.client.email}</p>
                                                
                                                {/* Invite Status */}
                                                {(() => {
                                                    const inviteStatus = getInviteStatus(selectedProject.client);
                                                    return (
                                                        <div className="flex items-center space-x-2 mb-2">
                                                            <span className={`text-xs font-medium ${inviteStatus.color}`}>
                                                                {inviteStatus.label}
                                                            </span>
                                                            {(inviteStatus.status === 'pending' || inviteStatus.status === 'not-invited') && (
                                                                <button
                                                                    onClick={() => handleResendInvite(selectedProject)}
                                                                    className="text-xs text-color-1 hover:text-color-1/80 underline"
                                                                >
                                                                    {inviteStatus.status === 'not-invited' ? 'Send Invite' : 'Resend Invite'}
                                                                </button>
                                                            )}
                                                            {inviteStatus.status === 'accepted' && (
                                                                <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                                </svg>
                                                            )}
                                                        </div>
                                                    );
                                                })()}
                                                
                                                <p className="caption text-n-4 mb-2">{selectedProject.projectDescription}</p>
                                                <div className="flex items-center space-x-4">
                                                    <span className="caption text-n-4">Consultant: {selectedProject.assignedConsultant}</span>
                                                    <span className="caption text-n-4">Value: {formatCurrency(selectedProject.quotedAmount)}</span>
                                                    <span className="caption text-n-4">Progress: {selectedProject.totalProgress}%</span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="w-full bg-n-7 rounded-full h-2">
                                                    <div 
                                                        className="bg-color-1 h-2 rounded-full transition-all duration-500"
                                                        style={{ width: `${selectedProject.totalProgress}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Project Steps */}
                                        <div className="space-y-4">
                                            <h5 className="h6 text-n-1 mb-4">Project Steps</h5>
                                            {selectedProject.steps.map((step) => {
                                                const isExpanded = expandedSteps.has(step.id);
                                                const isActiveStep = getActiveStepId(selectedProject) === step.id;
                                                
                                                return (
                                                    <div key={step.id} className="bg-n-7 rounded-xl border border-n-6">
                                                        {/* Step Header - Always Visible */}
                                                        <button
                                                            onClick={() => toggleStepExpansion(step.id)}
                                                            className="w-full p-4 text-left hover:bg-n-6/50 transition-colors rounded-xl"
                                                        >
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex-1">
                                                                    <div className="flex items-center space-x-3 mb-2">
                                                                        <h6 className="body-2 font-semibold text-n-1">{step.title}</h6>
                                                                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                                            step.status === 'done' ? 'bg-green-500/20 text-green-400' :
                                                                            step.status === 'in-progress' ? 'bg-yellow-500/20 text-yellow-400' :
                                                                            'bg-n-6 text-n-3'
                                                                        }`}>
                                                                            {step.status === 'done' ? 'Completed' :
                                                                             step.status === 'in-progress' ? 'In Progress' :
                                                                             'Pending'}
                                                                        </span>
                                                                        {step.completedDate && (
                                                                            <span className="caption text-n-4">
                                                                                Completed: {formatDate(step.completedDate)}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    <p className="caption text-n-3">{step.text}</p>
                                                                </div>
                                                                <div className="flex items-center space-x-3">
                                                                    {isActiveStep && (
                                                                        <span className="text-xs text-color-1 font-medium">Current Step</span>
                                                                    )}
                                                                    <svg 
                                                                        className={`w-5 h-5 text-n-3 transition-transform duration-200 ${
                                                                            isExpanded ? 'rotate-180' : ''
                                                                        }`} 
                                                                        fill="none" 
                                                                        stroke="currentColor" 
                                                                        viewBox="0 0 24 24"
                                                                    >
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                                    </svg>
                                                                </div>
                                                            </div>
                                                        </button>

                                                        {/* Step Content - Collapsible */}
                                                        <div className={`overflow-hidden transition-all duration-300 ${
                                                            isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
                                                        }`}>
                                                            <div className="px-4 pb-4">
                                                                <div className="flex items-center justify-between mb-4">
                                                                    <div className="flex-1">
                                                                        <p className="caption text-n-3 mb-2">{step.text}</p>
                                                                    </div>
                                                                    <div className="flex space-x-2">
                                                                        <select
                                                                            value={step.status}
                                                                            onChange={(e) => handleStepStatusUpdate(selectedProject.id, step.id, e.target.value as "pending" | "in-progress" | "done")}
                                                                            className="bg-n-8 border border-n-5 text-n-1 text-sm rounded px-2 py-1"
                                                                        >
                                                                            <option value="pending">Pending</option>
                                                                            <option value="in-progress">In Progress</option>
                                                                            <option value="done">Done</option>
                                                                        </select>
                                                                    </div>
                                                                </div>

                                                                {/* Client Notes */}
                                                                {step.clientNotes && (
                                                                    <div className="mb-4">
                                                                        <h6 className="body-2 font-semibold text-n-2 mb-2">Client Notes:</h6>
                                                                        <p className="body-2 text-n-3 bg-n-8 rounded-lg p-3">{step.clientNotes}</p>
                                                                    </div>
                                                                )}

                                                                {/* Consultant Notes */}
                                                                <div className="mb-4">
                                                                    <h6 className="body-2 font-semibold text-n-2 mb-2">Consultant Notes:</h6>
                                                                    <textarea
                                                                        value={step.consultantNotes || ''}
                                                                        onChange={(e) => handleConsultantNotesUpdate(selectedProject.id, step.id, e.target.value)}
                                                                        placeholder="Add your notes, updates, or feedback for the client..."
                                                                        className="w-full bg-n-8 border-2 border-n-5 text-n-1 placeholder:text-n-4 focus:border-color-1 focus:outline-none px-3 py-2 rounded-lg resize-none"
                                                                        rows={3}
                                                                        style={{ minHeight: '80px' }}
                                                                    />
                                                                </div>

                                                                {/* Resource Requests */}
                                                                <div className="mb-4">
                                                                    <div className="flex items-center justify-between mb-3">
                                                                        <h6 className="body-2 font-semibold text-n-2">Resource Requests</h6>
                                                                        <button
                                                                            onClick={() => {
                                                                                setCreatingResourceForStep({projectId: selectedProject.id, stepId: step.id});
                                                                                setNewResourceForm({title: '', description: '', amount: 0});
                                                                                setShowNewResourceModal(true);
                                                                            }}
                                                                            className="text-color-1 hover:text-color-1/80 text-sm font-medium"
                                                                        >
                                                                            + Request Resources
                                                                        </button>
                                                                    </div>
                                                                    
                                                                    {step.resourceRequests.length > 0 ? (
                                                                        <div className="space-y-2">
                                                                            {step.resourceRequests.map((request) => (
                                                                                <div key={request.id} className="bg-n-8 rounded-lg p-3 border border-n-6">
                                                                                    <div className="flex items-center justify-between">
                                                                                        <div className="flex-1">
                                                                                            <h6 className="body-2 font-semibold text-n-1">{request.title}</h6>
                                                                                            <p className="caption text-n-3">{request.description}</p>
                                                                                        </div>
                                                                                        <div className="flex items-center space-x-3">
                                                                                            <div className="text-right">
                                                                                                <p className="body-2 text-color-1 font-semibold">{formatCurrency(request.amount)}</p>
                                                                                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                                                                    request.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                                                                                                    request.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                                                                                                    'bg-yellow-500/20 text-yellow-400'
                                                                                                }`}>
                                                                                                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                                                                                                </span>
                                                                                            </div>
                                                                                            <div className="flex space-x-1">
                                                                                                <button
                                                                                                    onClick={() => handleEditResourceRequest(request)}
                                                                                                    className="text-color-1 hover:text-color-1/80 text-xs px-2 py-1 rounded border border-color-1/50 hover:bg-color-1/10"
                                                                                                >
                                                                                                    Edit
                                                                                                </button>
                                                                                                <button
                                                                                                    onClick={() => handleDeleteResourceRequest(request.id)}
                                                                                                    className="text-red-400 hover:text-red-300 text-xs px-2 py-1 rounded border border-red-400/50 hover:bg-red-400/10 transition-colors"
                                                                                                    title="Delete Resource Request"
                                                                                                >
                                                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                                                    </svg>
                                                                                                </button>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    ) : (
                                                                        <p className="caption text-n-4">No resource requests for this step.</p>
                                                                    )}
                                                                </div>

                                                                {/* Sign-off Status */}
                                                                <div className="flex items-center justify-between pt-3 border-t border-n-6">
                                                                    <div className="flex items-center space-x-4">
                                                                        <div className="flex items-center space-x-2">
                                                                            <div className={`w-3 h-3 rounded-full ${step.clientSignOff ? 'bg-green-500' : 'bg-n-5'}`}></div>
                                                                            <span className="caption text-n-3">Client Signed Off</span>
                                                                        </div>
                                                                        <div className="flex items-center space-x-2">
                                                                            <div className={`w-3 h-3 rounded-full ${step.consultantSignOff ? 'bg-green-500' : 'bg-n-5'}`}></div>
                                                                            <span className="caption text-n-3">Consultant Signed Off</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* Project Actions */}
                                        <div className="mt-8 pt-6 border-t border-n-6">
                                            <div className="flex justify-end">
                                                <button
                                                    onClick={() => setShowDeleteProjectModal(true)}
                                                    className="flex items-center space-x-2 text-red-400 hover:text-red-300 px-4 py-2 rounded-lg border border-red-400/50 hover:bg-red-400/10 transition-colors"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                    <span className="text-sm font-medium">Delete Project</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-n-8 rounded-2xl border border-n-6 p-12 text-center">
                                        <h3 className="h5 text-n-1 mb-4">Select a Project</h3>
                                        <p className="body-2 text-n-3">Choose a project from the sidebar to view its details and manage its progress.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Clients Tab */}
                    {activeTab === "clients" && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="h5 text-n-1">Clients</h3>
                                <div className="text-sm text-n-3">
                                    {clients.length} total clients
                                </div>
                            </div>

                            {clients.length === 0 ? (
                                <div className="text-center py-12">
                                    <p className="body-2 text-n-3">No clients found.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {clients.map((client) => (
                                        <div key={client.id} className="bg-n-8 rounded-xl p-6 border border-n-6">
                                            <div className="flex items-center justify-between mb-4">
                                                <h4 className="h6 text-n-1">{client.firstName} {client.lastName}</h4>
                                                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                            </div>
                                            <p className="caption text-n-3 mb-2">{client.email}</p>
                                            <p className="body-2 text-n-4">Projects: {activeProjects.filter(p => p.clientId === client.id).length}</p>
                                            <p className="caption text-n-4 mt-4">Joined: {formatDate(client.createdAt)}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Resources Tab */}
                    {activeTab === "resources" && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="h5 text-n-1">Resource Requests</h3>
                                <div className="text-sm text-n-3">
                                    {resourceRequests.filter(r => r.status === 'pending').length} pending
                                </div>
                            </div>

                            {resourceRequests.length === 0 ? (
                                <div className="text-center py-12">
                                    <p className="body-2 text-n-3">No resource requests found.</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {resourceRequests.map((request) => (
                                        <div key={request.id} className="bg-n-8 rounded-2xl border border-n-6 p-6">
                                            <div className="flex items-center justify-between mb-4">
                                                <h4 className="h6 text-n-1">{request.title}</h4>
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                    request.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                                                    request.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                                                    'bg-red-500/20 text-red-400'
                                                }`}>
                                                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                                                </span>
                                            </div>
                                            <p className="body-2 text-n-3 mb-4">{request.description}</p>
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <p className="h6 text-n-1">{formatCurrency(request.amount)}</p>
                                                    <p className="caption text-n-4">Additional Cost</p>
                                                </div>

                                                {request.status === "pending" && (
                                                    <div className="flex space-x-2">
                                                        <Button
                                                            onClick={() => handleResourceRequestStatusUpdate(request.id, "approved")}
                                                        >
                                                            Approve
                                                        </Button>
                                                        <Button
                                                            onClick={() => handleResourceRequestStatusUpdate(request.id, "rejected")}
                                                        >
                                                            Reject
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </Section>

            {/* Edit Project Modal */}
            {showEditProjectModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-n-8 rounded-2xl border border-n-6 p-6 w-full max-w-md mx-4">
                        <h3 className="h5 text-n-1 mb-6">Edit Project</h3>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-n-2 mb-2">Project Name</label>
                                <input
                                    type="text"
                                    value={editProjectForm.projectName}
                                    onChange={(e) => setEditProjectForm(prev => ({ ...prev, projectName: e.target.value }))}
                                    className="w-full bg-n-7 border border-n-5 text-n-1 px-3 py-2 rounded-lg focus:border-color-1 focus:outline-none"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-n-2 mb-2">Description</label>
                                <textarea
                                    value={editProjectForm.projectDescription}
                                    onChange={(e) => setEditProjectForm(prev => ({ ...prev, projectDescription: e.target.value }))}
                                    className="w-full bg-n-7 border border-n-5 text-n-1 px-3 py-2 rounded-lg focus:border-color-1 focus:outline-none resize-none"
                                    rows={3}
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-n-2 mb-2">Assigned Consultant</label>
                                <input
                                    type="text"
                                    value={editProjectForm.assignedConsultant}
                                    onChange={(e) => setEditProjectForm(prev => ({ ...prev, assignedConsultant: e.target.value }))}
                                    className="w-full bg-n-7 border border-n-5 text-n-1 px-3 py-2 rounded-lg focus:border-color-1 focus:outline-none"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-n-2 mb-2">Quoted Amount ($)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={(editProjectForm.quotedAmount / 100).toFixed(2)}
                                    onChange={(e) => setEditProjectForm(prev => ({ ...prev, quotedAmount: Math.round((parseFloat(e.target.value) || 0) * 100) }))}
                                    className="w-full bg-n-7 border border-n-5 text-n-1 px-3 py-2 rounded-lg focus:border-color-1 focus:outline-none"
                                />
                            </div>
                        </div>
                        
                        <div className="flex space-x-3 mt-6">
                            <Button onClick={handleUpdateProject} className="flex-1">
                                Update Project
                            </Button>
                            <Button onClick={() => setShowEditProjectModal(false)} className="flex-1 bg-n-6 hover:bg-n-5">
                                Cancel
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* New Project Modal */}
            {showNewProjectModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-n-8 rounded-2xl border border-n-6 p-6 w-full max-w-md mx-4">
                        <h3 className="h5 text-n-1 mb-6">Create New Project</h3>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-n-2 mb-2">Client</label>
                                <div className="space-y-3">
                                    <div className="flex space-x-2">
                                        <button
                                            type="button"
                                            onClick={() => setNewProjectForm(prev => ({ ...prev, isNewClient: false }))}
                                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                                                !newProjectForm.isNewClient 
                                                    ? 'bg-color-1 text-n-8' 
                                                    : 'bg-n-7 text-n-3 hover:text-n-1'
                                            }`}
                                        >
                                            Existing Client
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setNewProjectForm(prev => ({ ...prev, isNewClient: true }))}
                                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                                                newProjectForm.isNewClient 
                                                    ? 'bg-color-1 text-n-8' 
                                                    : 'bg-n-7 text-n-3 hover:text-n-1'
                                            }`}
                                        >
                                            New Client
                                        </button>
                                    </div>
                                    
                                    {!newProjectForm.isNewClient ? (
                                        <select
                                            value={newProjectForm.clientId}
                                            onChange={(e) => setNewProjectForm(prev => ({ ...prev, clientId: e.target.value }))}
                                            className="w-full bg-n-7 border border-n-5 text-n-1 px-3 py-2 rounded-lg focus:border-color-1 focus:outline-none"
                                        >
                                            <option value="">Select a client</option>
                                            {clients.map(client => (
                                                <option key={client.id} value={client.id}>
                                                    {client.firstName} {client.lastName} ({client.email})
                                                </option>
                                            ))}
                                        </select>
                                    ) : (
                                        <div className="space-y-3">
                                            <div>
                                                <label className="block text-xs font-medium text-n-3 mb-1">Email Address</label>
                                                <input
                                                    type="email"
                                                    value={newProjectForm.newClientEmail}
                                                    onChange={(e) => setNewProjectForm(prev => ({ ...prev, newClientEmail: e.target.value }))}
                                                    placeholder="client@company.com"
                                                    className="w-full bg-n-7 border border-n-5 text-n-1 px-3 py-2 rounded-lg focus:border-color-1 focus:outline-none"
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="block text-xs font-medium text-n-3 mb-1">First Name</label>
                                                    <input
                                                        type="text"
                                                        value={newProjectForm.newClientFirstName}
                                                        onChange={(e) => setNewProjectForm(prev => ({ ...prev, newClientFirstName: e.target.value }))}
                                                        placeholder="John"
                                                        className="w-full bg-n-7 border border-n-5 text-n-1 px-3 py-2 rounded-lg focus:border-color-1 focus:outline-none"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-n-3 mb-1">Last Name</label>
                                                    <input
                                                        type="text"
                                                        value={newProjectForm.newClientLastName}
                                                        onChange={(e) => setNewProjectForm(prev => ({ ...prev, newClientLastName: e.target.value }))}
                                                        placeholder="Smith"
                                                        className="w-full bg-n-7 border border-n-5 text-n-1 px-3 py-2 rounded-lg focus:border-color-1 focus:outline-none"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-n-2 mb-2">Project Name</label>
                                <input
                                    type="text"
                                    value={newProjectForm.projectName}
                                    onChange={(e) => setNewProjectForm(prev => ({ ...prev, projectName: e.target.value }))}
                                    className="w-full bg-n-7 border border-n-5 text-n-1 px-3 py-2 rounded-lg focus:border-color-1 focus:outline-none"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-n-2 mb-2">Description</label>
                                <textarea
                                    value={newProjectForm.projectDescription}
                                    onChange={(e) => setNewProjectForm(prev => ({ ...prev, projectDescription: e.target.value }))}
                                    className="w-full bg-n-7 border border-n-5 text-n-1 px-3 py-2 rounded-lg focus:border-color-1 focus:outline-none resize-none"
                                    rows={3}
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-n-2 mb-2">Assigned Consultant</label>
                                <input
                                    type="text"
                                    value={newProjectForm.assignedConsultant}
                                    onChange={(e) => setNewProjectForm(prev => ({ ...prev, assignedConsultant: e.target.value }))}
                                    className="w-full bg-n-7 border border-n-5 text-n-1 px-3 py-2 rounded-lg focus:border-color-1 focus:outline-none"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-n-2 mb-2">Quoted Amount ($)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={(newProjectForm.quotedAmount / 100).toFixed(2)}
                                    onChange={(e) => setNewProjectForm(prev => ({ ...prev, quotedAmount: Math.round((parseFloat(e.target.value) || 0) * 100) }))}
                                    className="w-full bg-n-7 border border-n-5 text-n-1 px-3 py-2 rounded-lg focus:border-color-1 focus:outline-none"
                                />
                            </div>
                        </div>
                        
                        <div className="flex space-x-3 mt-6">
                            <Button onClick={handleCreateNewProject} className="flex-1">
                                Create Project
                            </Button>
                            <Button onClick={() => setShowNewProjectModal(false)} className="flex-1 bg-n-6 hover:bg-n-5">
                                Cancel
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Resource Request Modal */}
            {showEditResourceModal && editingResourceRequest && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-n-8 rounded-2xl border border-n-6 p-6 w-full max-w-md mx-4">
                        <h3 className="h5 text-n-1 mb-6">Edit Resource Request</h3>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-n-2 mb-2">Title</label>
                                <input
                                    type="text"
                                    value={editResourceForm.title}
                                    onChange={(e) => setEditResourceForm(prev => ({ ...prev, title: e.target.value }))}
                                    className="w-full bg-n-7 border border-n-5 text-n-1 px-3 py-2 rounded-lg focus:border-color-1 focus:outline-none"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-n-2 mb-2">Description</label>
                                <textarea
                                    value={editResourceForm.description}
                                    onChange={(e) => setEditResourceForm(prev => ({ ...prev, description: e.target.value }))}
                                    className="w-full bg-n-7 border border-n-5 text-n-1 px-3 py-2 rounded-lg focus:border-color-1 focus:outline-none resize-none"
                                    rows={3}
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-n-2 mb-2">Amount ($)</label>
                                <input
                                    type="number"
                                    value={editResourceForm.amount}
                                    onChange={(e) => setEditResourceForm(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                                    className="w-full bg-n-7 border border-n-5 text-n-1 px-3 py-2 rounded-lg focus:border-color-1 focus:outline-none"
                                />
                            </div>
                        </div>
                        
                        <div className="flex space-x-3 mt-6">
                            <Button onClick={handleUpdateResourceRequest} className="flex-1">
                                Update Request
                            </Button>
                            <Button onClick={() => setShowEditResourceModal(false)} className="flex-1 bg-n-6 hover:bg-n-5">
                                Cancel
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Project Confirmation Modal */}
            {showDeleteProjectModal && selectedProject && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-n-8 rounded-2xl border border-n-6 p-6 w-full max-w-md mx-4">
                        <div className="flex items-center space-x-3 mb-6">
                            <div className="flex-shrink-0 w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
                                <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="h5 text-n-1">Delete Project</h3>
                                <p className="caption text-n-3">This action cannot be undone</p>
                            </div>
                        </div>
                        
                        <div className="mb-6">
                            <p className="body-2 text-n-2 mb-3">
                                Are you sure you want to delete <strong className="text-n-1">"{selectedProject.projectName}"</strong>?
                            </p>
                            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                                <p className="caption text-red-400">
                                    This will permanently delete the project and all associated data including:
                                </p>
                                <ul className="caption text-red-400 mt-2 ml-4 list-disc">
                                    <li>Project steps and progress</li>
                                    <li>Resource requests</li>
                                    <li>Client notes and consultant notes</li>
                                    <li>All project history</li>
                                </ul>
                            </div>
                        </div>
                        
                        <div className="flex space-x-3">
                            <Button 
                                onClick={handleDeleteProject} 
                                className="flex-1"
                            >
                                Yes, Delete Project
                            </Button>
                            <Button 
                                onClick={() => setShowDeleteProjectModal(false)} 
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* New Resource Request Modal */}
            {showNewResourceModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-n-8 rounded-2xl border border-n-6 p-6 w-full max-w-md mx-4">
                        <h3 className="h5 text-n-1 mb-6">Create Resource Request</h3>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-n-2 mb-2">Title</label>
                                <input
                                    type="text"
                                    value={newResourceForm.title}
                                    onChange={(e) => setNewResourceForm(prev => ({ ...prev, title: e.target.value }))}
                                    placeholder="e.g., Additional Development Hours"
                                    className="w-full bg-n-7 border border-n-5 text-n-1 px-3 py-2 rounded-lg focus:border-color-1 focus:outline-none placeholder:text-n-4"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-n-2 mb-2">Description</label>
                                <textarea
                                    value={newResourceForm.description}
                                    onChange={(e) => setNewResourceForm(prev => ({ ...prev, description: e.target.value }))}
                                    placeholder="Describe what additional resources are needed..."
                                    className="w-full bg-n-7 border border-n-5 text-n-1 px-3 py-2 rounded-lg focus:border-color-1 focus:outline-none resize-none placeholder:text-n-4"
                                    rows={3}
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-n-2 mb-2">Amount ($)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={newResourceForm.amount}
                                    onChange={(e) => setNewResourceForm(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                                    placeholder="0.00"
                                    className="w-full bg-n-7 border border-n-5 text-n-1 px-3 py-2 rounded-lg focus:border-color-1 focus:outline-none placeholder:text-n-4"
                                />
                            </div>
                        </div>
                        
                        <div className="flex space-x-3 mt-6">
                            <Button onClick={handleCreateNewResourceRequest} className="flex-1">
                                Create Request
                            </Button>
                            <Button 
                                onClick={() => {
                                    setShowNewResourceModal(false);
                                    setCreatingResourceForStep(null);
                                    setNewResourceForm({title: '', description: '', amount: 0});
                                }} 
                                className="flex-1 bg-n-6 hover:bg-n-5"
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Success Modal */}
            {showSuccessModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-n-8 rounded-2xl border border-n-6 p-6 max-w-md mx-4">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h4 className="h5 text-n-1 mb-2">Success!</h4>
                            <p className="body-2 text-n-3 mb-6">{successMessage}</p>
                            <Button 
                                onClick={() => setShowSuccessModal(false)} 
                                className="w-full"
                            >
                                OK
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default AdminDashboard;