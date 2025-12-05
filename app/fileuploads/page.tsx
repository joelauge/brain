"use client";

import { useState, useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Layout from "@/components/Layout";
import Button from "@/components/Button";
import Section from "@/components/Section";
import Heading from "@/components/Heading";

interface UploadedFile {
  fileName: string;
  originalName: string;
  size: number;
  url: string;
  uploadedAt: string;
}

export default function FileUploadsPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/login');
    }
  }, [isLoaded, user, router]);

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    try {
      const response = await fetch('/api/upload');
      const data = await response.json();
      if (data.files) {
        setUploadedFiles(data.files);
      }
    } catch (error) {
      console.error('Error loading files:', error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.toLowerCase().endsWith('.xml')) {
        setMessage({ type: 'error', text: 'Please select an XML file' });
        return;
      }
      setFile(selectedFile);
      setMessage(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage({ type: 'error', text: 'Please select a file first' });
      return;
    }

    setUploading(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMessage({ 
          type: 'success', 
          text: `File "${data.originalName}" uploaded successfully!` 
        });
        setFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        loadFiles(); // Refresh file list
      } else {
        setMessage({ 
          type: 'error', 
          text: data.error || 'Failed to upload file' 
        });
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: 'An error occurred while uploading the file' 
      });
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  // Show loading state while checking authentication
  if (!isLoaded) {
    return (
      <Layout>
        <Section className="pt-32 pb-16">
          <div className="container mx-auto text-center">
            <Heading titleLarge="Loading..." className="mb-8" />
          </div>
        </Section>
      </Layout>
    );
  }

  // Show message if not authenticated (will redirect, but show something in the meantime)
  if (!user) {
    return (
      <Layout>
        <Section className="pt-32 pb-16">
          <div className="container mx-auto text-center">
            <Heading titleLarge="Authentication Required" className="mb-8" />
            <p className="text-n-3 mb-6">Please sign in to access this page.</p>
            <Button href="/login">Sign In</Button>
          </div>
        </Section>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-n-8 py-20 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-n-1 mb-4">
              XML File Upload
            </h1>
            <p className="text-n-2 text-lg">
              Upload XML files to make them publicly available on the site
            </p>
          </div>

          {/* Upload Section */}
          <div className="bg-n-7 rounded-2xl p-8 mb-8 border border-n-6">
            <h2 className="text-2xl font-semibold text-n-1 mb-6">
              Upload New File
            </h2>

            <div className="space-y-6">
              {/* File Input */}
              <div>
                <label className="block text-sm font-medium text-n-2 mb-2">
                  Select XML File
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xml"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-n-2 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-n-6 file:text-n-1 hover:file:bg-n-5 cursor-pointer"
                />
                {file && (
                  <p className="mt-2 text-sm text-n-3">
                    Selected: <span className="text-n-1 font-medium">{file.name}</span> ({formatFileSize(file.size)})
                  </p>
                )}
              </div>

              {/* Message */}
              {message && (
                <div
                  className={`p-4 rounded-lg ${
                    message.type === 'success'
                      ? 'bg-green-500/20 border border-green-500/50 text-green-400'
                      : 'bg-red-500/20 border border-red-500/50 text-red-400'
                  }`}
                >
                  {message.text}
                </div>
              )}

              {/* Upload Button */}
              <Button
                onClick={handleUpload}
                disabled={!file || uploading}
                className="w-full"
              >
                {uploading ? 'Uploading...' : 'Upload XML File'}
              </Button>
            </div>
          </div>

          {/* Uploaded Files List */}
          <div className="bg-n-7 rounded-2xl p-8 border border-n-6">
            <h2 className="text-2xl font-semibold text-n-1 mb-6">
              Uploaded Files ({uploadedFiles.length})
            </h2>

            {uploadedFiles.length === 0 ? (
              <p className="text-n-3 text-center py-8">
                No files uploaded yet
              </p>
            ) : (
              <div className="space-y-4">
                {uploadedFiles.map((uploadedFile) => (
                  <div
                    key={uploadedFile.fileName}
                    className="bg-n-6 rounded-lg p-4 border border-n-5 hover:border-n-4 transition-colors"
                  >
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-n-1 font-medium truncate">
                          {uploadedFile.originalName}
                        </h3>
                        <div className="flex items-center gap-4 mt-2 text-sm text-n-3">
                          <span>{formatFileSize(uploadedFile.size)}</span>
                          <span>•</span>
                          <span>{formatDate(uploadedFile.uploadedAt)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <a
                          href={uploadedFile.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-n-5 hover:bg-n-4 text-n-1 rounded-lg text-sm font-medium transition-colors"
                        >
                          View
                        </a>
                        <a
                          href={uploadedFile.url}
                          download
                          className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 text-white rounded-lg text-sm font-medium transition-opacity"
                        >
                          Download
                        </a>
                      </div>
                    </div>
                    <div className="mt-2">
                      <p className="text-xs text-n-4 font-mono break-all">
                        URL: {uploadedFile.url}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

