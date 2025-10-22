"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import Layout from "@/components/Layout";
import Button from "@/components/Button";
import { apiService, ProjectData, ProjectRequestData } from "@/lib/api";

const ClientDashboard = () => {
    const { isLoaded, user } = useUser();
    const [projects, setProjects] = useState<ProjectData[]>([]);
    const [activeProject, setActiveProject] = useState<ProjectData | null>(null);
    const [activeStep, setActiveStep] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [showProjectRequestForm, setShowProjectRequestForm] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [projectRequestForm, setProjectRequestForm] = useState({
        title: '',
        description: '',
        files: [] as File[]
    });

    const showSuccess = (message: string) => {
        setSuccessMessage(message);
        setShowSuccessModal(true);
    };

    useEffect(() => {
        const loadProjects = async () => {
            if (!isLoaded || !user) return;
            
            try {
                setIsLoading(true);
                
                // Get or create user in database
                let dbUser = await apiService.getUserByClerkId(user.id);
                if (!dbUser) {
                    dbUser = await apiService.createUser({
                        clerkId: user.id,
                        email: user.emailAddresses[0]?.emailAddress || '',
                        firstName: user.firstName || undefined,
                        lastName: user.lastName || undefined
                    });
                }

                // Fetch projects for this user
                if (dbUser) {
                    const userProjects = await apiService.getProjects(dbUser.id);
                    setProjects(userProjects);
                    
                    if (userProjects.length > 0) {
                        setActiveProject(userProjects[0]);
                    }
                } else {
                    setProjects([]);
                }
            } catch (error) {
                console.error('Error loading projects:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadProjects();
    }, [isLoaded, user]);

    const handleProjectRequest = async () => {
        if (!projectRequestForm.title || !projectRequestForm.description) {
            showSuccess('Please fill in all required fields.');
            return;
        }

        try {
            // First ensure we have a user in the database
            let dbUser = await apiService.getUserByClerkId(user?.id || '');
            if (!dbUser) {
                dbUser = await apiService.createUser({
                    clerkId: user?.id || '',
                    email: user?.emailAddresses[0]?.emailAddress || '',
                    firstName: user?.firstName || undefined,
                    lastName: user?.lastName || undefined
                });
            }

            if (!dbUser) {
                showSuccess('Unable to create user account. Please try again.');
                return;
            }

            await apiService.createProjectRequest({
                clientId: dbUser.id,
                projectTitle: projectRequestForm.title,
                projectDescription: projectRequestForm.description
            });

            showSuccess('Project request submitted successfully!');
            setProjectRequestForm({ title: '', description: '', files: [] });
            setShowProjectRequestForm(false);
        } catch (error) {
            console.error('Error submitting project request:', error);
            showSuccess('Failed to submit project request. Please try again.');
        }
    };

    const handleConsultantNotesUpdate = async (projectId: string, stepId: string, notes: string) => {
        try {
            await apiService.updateProjectStep(stepId, { consultantNotes: notes });
            
            setProjects(prev => prev.map(project => 
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

    const toggleSignOff = async (stepId: string, type: 'client' | 'consultant') => {
        if (!activeProject) return;

        try {
            const updates = type === 'client' 
                ? { clientSignOff: !activeProject.steps[activeStep].clientSignOff }
                : { consultantSignOff: !activeProject.steps[activeStep].consultantSignOff };

            await apiService.updateProjectStep(stepId, updates);
            
            setProjects(prev => prev.map(project => 
                project.id === activeProject.id 
                    ? {
                        ...project,
                        steps: project.steps.map(step => 
                            step.id === stepId ? { ...step, ...updates } : step
                        )
                    }
                    : project
            ));
        } catch (error) {
            console.error('Error updating sign-off:', error);
        }
    };

    if (!isLoaded || isLoading) {
        return (
            <Layout>
                <div className="flex items-center justify-center min-h-[50vh]">
                    <div className="text-center">
                        <div className="w-8 h-8 border-2 border-color-1 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="body-2 text-n-3">Loading dashboard...</p>
                    </div>
                </div>
            </Layout>
        );
    }

    if (!user) {
        return (
            <Layout>
                <div className="flex items-center justify-center min-h-[50vh]">
                    <div className="text-center">
                        <h2 className="h4 text-n-1 mb-4">Please sign in to access your dashboard</h2>
                        <Button href="/login">Sign In</Button>
                    </div>
                </div>
            </Layout>
        );
    }

    if (projects.length === 0) {
        return (
            <Layout>
                <div className="container max-w-4xl mx-auto px-5 py-12">
                    <div className="text-center mb-8">
                        <h1 className="h2 text-n-1 mb-4">Welcome to Your Dashboard</h1>
                        <p className="body-2 text-n-3 mb-8">You don&apos;t have any projects yet. Request a new project to get started.</p>
                        <Button onClick={() => setShowProjectRequestForm(true)}>
                            Request New Project
                        </Button>
                    </div>
                </div>

                {/* Project Request Form Modal */}
                {showProjectRequestForm && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-n-8 rounded-2xl border border-n-6 p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="h4 text-n-1">Request New Project</h3>
                                <button
                                    onClick={() => setShowProjectRequestForm(false)}
                                    className="text-n-3 hover:text-n-1 transition-colors"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-n-2 mb-2">Project Title *</label>
                                    <input
                                        type="text"
                                        value={projectRequestForm.title}
                                        onChange={(e) => setProjectRequestForm(prev => ({ ...prev, title: e.target.value }))}
                                        placeholder="Enter your project title"
                                        className="w-full bg-n-7 border border-n-5 text-n-1 px-3 py-2 rounded-lg focus:border-color-1 focus:outline-none placeholder:text-n-4"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-n-2 mb-2">Project Description *</label>
                                    <textarea
                                        value={projectRequestForm.description}
                                        onChange={(e) => setProjectRequestForm(prev => ({ ...prev, description: e.target.value }))}
                                        placeholder="Describe your project requirements..."
                                        className="w-full bg-n-7 border border-n-5 text-n-1 px-3 py-2 rounded-lg focus:border-color-1 focus:outline-none resize-none placeholder:text-n-4"
                                        rows={4}
                                    />
                                </div>
                            </div>

                            <div className="flex space-x-3 mt-8">
                                <Button onClick={handleProjectRequest} className="flex-1">
                                    Submit Request
                                </Button>
                                <Button 
                                    onClick={() => setShowProjectRequestForm(false)} 
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
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
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
    }

    return (
        <Layout>
            <div className="container max-w-6xl mx-auto px-5 py-12">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="h2 text-n-1 mb-2">Your Projects</h1>
                        <p className="body-2 text-n-3">Manage your consulting projects and track progress</p>
                    </div>
                    <Button onClick={() => setShowProjectRequestForm(true)}>
                        + Request New Project
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Project Selector */}
                    <div className="lg:col-span-1">
                        <div className="bg-n-8 rounded-2xl border border-n-6 p-6">
                            <h3 className="h6 text-n-1 mb-4">Select Project</h3>
                            <div className="space-y-3">
                                {projects.map((project) => (
                                    <button
                                        key={project.id}
                                        onClick={() => {
                                            setActiveProject(project);
                                            setActiveStep(0);
                                        }}
                                        className={`w-full text-left p-4 rounded-xl border transition-all ${
                                            activeProject?.id === project.id
                                                ? 'bg-color-1/10 border-color-1/50 text-n-1'
                                                : 'bg-n-7 border-n-6 text-n-3 hover:bg-n-6 hover:text-n-1'
                                        }`}
                                    >
                                        <h4 className="body-2 font-semibold mb-1">{project.projectName}</h4>
                                        <p className="caption text-n-4 mb-2">{project.client.firstName} {project.client.lastName}</p>
                                        <div className="flex items-center justify-between">
                                            <span className="caption text-n-4">${(project.quotedAmount / 100).toLocaleString()}</span>
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                project.projectStatus === 'delivered' ? 'bg-green-500/20 text-green-400' :
                                                project.projectStatus === 'completed' ? 'bg-blue-500/20 text-blue-400' :
                                                'bg-yellow-500/20 text-yellow-400'
                                            }`}>
                                                {project.projectStatus.charAt(0).toUpperCase() + project.projectStatus.slice(1)}
                                            </span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Project Details */}
                    <div className="lg:col-span-3">
                        {activeProject ? (
                            <div className="space-y-6">
                                {/* Project Header */}
                                <div className="bg-n-8 rounded-2xl border border-n-6 p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <h2 className="h4 text-n-1 mb-2">{activeProject.projectName}</h2>
                                            <p className="body-2 text-n-3 mb-1">{activeProject.client.firstName} {activeProject.client.lastName} • {activeProject.client.email}</p>
                                            <p className="caption text-n-4 mb-2">{activeProject.projectDescription}</p>
                                            <div className="flex items-center space-x-4">
                                                <span className="caption text-n-4">Consultant: {activeProject.assignedConsultant}</span>
                                                <span className="caption text-n-4">Value: ${(activeProject.quotedAmount / 100).toLocaleString()}</span>
                                                <span className="caption text-n-4">Progress: {activeProject.totalProgress}%</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Step Details */}
                                {activeProject.steps[activeStep] && (
                                    <div className="bg-n-8 rounded-2xl border border-n-6 p-6">
                                        <div className="flex items-center justify-between mb-6">
                                            <div>
                                                <h4 className="h5 text-n-1 mb-2">{activeProject.steps[activeStep].title}</h4>
                                                <p className="body-2 text-n-3">{activeProject.steps[activeStep].text}</p>
                                            </div>
                                            <div className="flex items-center space-x-3">
                                                <span className="text-xs text-color-1 font-medium">Current Step</span>
                                                <select
                                                    value={activeProject.steps[activeStep].status}
                                                    onChange={(e) => {
                                                        // Handle status update if needed
                                                    }}
                                                    className="bg-n-7 border border-n-5 text-n-1 text-sm rounded px-3 py-1"
                                                >
                                                    <option value="pending">Pending</option>
                                                    <option value="in-progress">In Progress</option>
                                                    <option value="done">Done</option>
                                                </select>
                                            </div>
                                        </div>

                                        {/* Client Notes */}
                                        {activeProject.steps[activeStep].clientNotes && (
                                            <div className="mb-4">
                                                <h6 className="body-2 font-semibold text-n-2 mb-2">Client Notes:</h6>
                                                <p className="body-2 text-n-3 bg-n-7 rounded-lg p-3">{activeProject.steps[activeStep].clientNotes}</p>
                                            </div>
                                        )}

                                        {/* Consultant Notes */}
                                        <div className="mb-4">
                                            <h6 className="body-2 font-semibold text-n-2 mb-2">Consultant Notes:</h6>
                                            <textarea
                                                value={activeProject.steps[activeStep].consultantNotes || ''}
                                                onChange={(e) => handleConsultantNotesUpdate(activeProject.id, activeProject.steps[activeStep].id, e.target.value)}
                                                placeholder="Add your notes, updates, or feedback for the client..."
                                                className="w-full bg-n-7 border-2 border-n-5 text-n-1 placeholder:text-n-4 focus:border-color-1 focus:outline-none px-3 py-2 rounded-lg resize-none"
                                                rows={3}
                                                style={{ minHeight: '80px' }}
                                            />
                                        </div>

                                        {/* Sign-off Section */}
                                        <div className="pt-6 border-t border-n-6">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-6">
                                                    <div className="flex items-center space-x-2">
                                                        <input
                                                            type="checkbox"
                                                            checked={activeProject.steps[activeStep].clientSignOff}
                                                            onChange={() => toggleSignOff(activeProject.steps[activeStep].id, 'client')}
                                                            className="w-4 h-4 text-color-1 bg-n-7 border-n-5 rounded focus:ring-color-1 focus:ring-2"
                                                        />
                                                        <span className="body-2 text-n-1">I approve this step</span>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <div className={`w-3 h-3 rounded-full ${
                                                            activeProject.steps[activeStep].consultantSignOff ? 'bg-green-500' : 'bg-n-5'
                                                        }`}></div>
                                                        <span className="body-2 text-n-3">Consultant approved</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Step Navigation */}
                                <div className="flex justify-between">
                                    <Button 
                                        onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
                                        disabled={activeStep === 0}
                                        className="bg-n-6 hover:bg-n-5"
                                    >
                                        Previous Step
                                    </Button>
                                    <Button 
                                        onClick={() => setActiveStep(Math.min(activeProject.steps.length - 1, activeStep + 1))}
                                        disabled={activeStep === activeProject.steps.length - 1}
                                    >
                                        Next Step
                                    </Button>
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
            </div>

            {/* Success Modal */}
            {showSuccessModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
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

export default ClientDashboard;
