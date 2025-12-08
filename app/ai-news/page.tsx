"use client";

import { useState, useEffect, Suspense, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Layout from "@/components/Layout";
import Section from "@/components/Section";
import Button from "@/components/Button";

interface Article {
  id: string;
  title: string;
  url: string;
  domain: string;
  published_at: string;
  summary: string;
  content_body: string;
  image_url?: string;
  category: string;
  tags: string;
  entities?: string;
  score?: string;
  source_type?: string;
  is_primary_source?: string;
  content_hash?: string;
}

interface ApiResponse {
  articles: Article[];
  total: number;
  categories: string[];
  tags: string[];
}

function AINewsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get('page') || '1', 10)
  );
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    searchParams.get('category')
  );
  const [selectedTag, setSelectedTag] = useState<string | null>(
    searchParams.get('tag')
  );
  const [searchQuery, setSearchQuery] = useState<string>(
    searchParams.get('search') || ''
  );
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [signupForm, setSignupForm] = useState({ firstName: '', email: '' });
  const [signupSubmitting, setSignupSubmitting] = useState(false);
  const [signupMessage, setSignupMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const bellRef = useRef<SVGSVGElement>(null);

  const itemsPerPage = 12;

  // Bell ringing animation every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (bellRef.current) {
        // Force animation restart by removing and re-adding the class
        bellRef.current.classList.remove('bell-ringing');
        // Use requestAnimationFrame to ensure the class removal is processed
        requestAnimationFrame(() => {
          if (bellRef.current) {
            bellRef.current.classList.add('bell-ringing');
            setTimeout(() => {
              if (bellRef.current) {
                bellRef.current.classList.remove('bell-ringing');
              }
            }, 500);
          }
        });
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchArticles();
  }, [selectedCategory, selectedTag, searchQuery]);

  useEffect(() => {
    // Reset to page 1 when filters change
    setCurrentPage(1);
  }, [selectedCategory, selectedTag, searchQuery]);

  useEffect(() => {
    // Update URL when filters change
    const params = new URLSearchParams();
    if (selectedCategory) params.set('category', selectedCategory);
    if (selectedTag) params.set('tag', selectedTag);
    if (searchQuery) params.set('search', searchQuery);
    if (currentPage > 1) params.set('page', currentPage.toString());
    
    const newUrl = params.toString() 
      ? `/ai-news?${params.toString()}` 
      : '/ai-news';
    router.replace(newUrl, { scroll: false });
  }, [selectedCategory, selectedTag, searchQuery, currentPage, router]);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory) params.set('category', selectedCategory);
      if (selectedTag) params.set('tag', selectedTag);
      if (searchQuery) params.set('search', searchQuery);

      const response = await fetch(`/api/ai-news?${params.toString()}`);
      const data: ApiResponse = await response.json();
      
      setArticles(data.articles || []);
      setCategories(data.categories || []);
      setTags(data.tags || []);
      setCurrentPage(1); // Reset to first page when filters change
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (category: string | null) => {
    setSelectedCategory(category);
    setSelectedTag(null); // Clear tag when category changes
  };

  const handleTagChange = (tag: string | null) => {
    setSelectedTag(tag);
    setSelectedCategory(null); // Clear category when tag changes
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchArticles();
  };

  const clearFilters = () => {
    setSelectedCategory(null);
    setSelectedTag(null);
    setSearchQuery('');
  };

  // Pagination
  const totalPages = Math.ceil(articles.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedArticles = articles.slice(startIndex, endIndex);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <Layout>
      <Section className="pt-12 pb-12">
        <div className="container">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="h1 text-n-1 mb-4 inline-flex items-start gap-2">
              AI News
              <button
                onClick={() => setShowSignupModal(true)}
                onMouseEnter={() => {
                  if (bellRef.current) {
                    bellRef.current.classList.remove('bell-ringing');
                    requestAnimationFrame(() => {
                      if (bellRef.current) {
                        bellRef.current.classList.add('bell-ringing');
                        setTimeout(() => {
                          if (bellRef.current) {
                            bellRef.current.classList.remove('bell-ringing');
                          }
                        }, 500);
                      }
                    });
                  }
                }}
                className="inline-flex items-center gap-2 -mt-1 hover:opacity-80 transition-opacity"
              >
                <span className="relative inline-block">
                  <svg
                    ref={bellRef}
                    className="w-8 h-8 text-color-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                  </svg>
                </span>
                <span className="text-n-1 text-sm font-medium">Get Notified</span>
              </button>
            </h1>
            <p className="body-2 text-n-3 max-w-2xl mx-auto">
              Stay updated with the latest developments in artificial intelligence, 
              machine learning, and technology innovation.
            </p>
          </div>

          {/* Filters */}
          <div className="mb-8 space-y-4">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex gap-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles..."
                className="flex-1 bg-n-7 border border-n-5 text-n-1 px-4 py-3 rounded-lg focus:border-color-1 focus:outline-none placeholder:text-n-4"
              />
              <Button type="submit">Search</Button>
            </form>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-n-2 text-sm font-medium">Category:</span>
              <button
                onClick={() => handleCategoryChange(null)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  !selectedCategory
                    ? 'bg-color-1 text-n-8'
                    : 'bg-n-7 text-n-2 hover:bg-n-6'
                }`}
              >
                All
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategoryChange(category)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-color-1 text-n-8'
                      : 'bg-n-7 text-n-2 hover:bg-n-6'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Active Filters */}
            {(selectedCategory || selectedTag || searchQuery) && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-n-3 text-sm">Active filters:</span>
                {selectedCategory && (
                  <span className="px-3 py-1 bg-color-1/20 text-color-1 rounded-lg text-sm">
                    Category: {selectedCategory}
                  </span>
                )}
                {selectedTag && (
                  <span className="px-3 py-1 bg-color-1/20 text-color-1 rounded-lg text-sm">
                    Tag: {selectedTag}
                  </span>
                )}
                {searchQuery && (
                  <span className="px-3 py-1 bg-color-1/20 text-color-1 rounded-lg text-sm">
                    Search: {searchQuery}
                  </span>
                )}
                <button
                  onClick={clearFilters}
                  className="px-3 py-1 bg-n-7 text-n-2 hover:bg-n-6 rounded-lg text-sm transition-colors"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-2 border-color-1 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="body-2 text-n-3">Loading articles...</p>
            </div>
          )}

          {/* Articles Grid */}
          {!loading && (
            <>
              {paginatedArticles.length === 0 ? (
                <div className="text-center py-12">
                  <p className="body-1 text-n-3">No articles found.</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {paginatedArticles.map((article) => (
                      <Link
                        key={article.id}
                        href={`/ai-news/${article.id}`}
                        className="bg-n-8 rounded-2xl border border-n-6 p-6 hover:border-color-1/50 transition-all group"
                      >
                        {/* Title */}
                        <h2 className="h5 text-n-1 mb-3 group-hover:text-color-1 transition-colors line-clamp-2">
                          {article.title}
                        </h2>

                        {/* Date */}
                        <p className="caption text-n-4 mb-2">
                          {formatDate(article.published_at)}
                        </p>

                        {/* Category */}
                        {article.category && (
                          <span className="inline-block px-3 py-1 bg-color-1/20 text-color-1 rounded-lg text-xs font-medium mb-3">
                            {article.category}
                          </span>
                        )}

                        {/* Summary */}
                        <p className="body-2 text-n-3 mb-4 line-clamp-3">
                          {article.summary}
                        </p>

                        {/* Tags */}
                        {article.tags && (
                          <div className="flex flex-wrap gap-2">
                            {article.tags.split(',').slice(0, 3).map((tag, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 bg-n-7 text-n-3 rounded text-xs"
                              >
                                {tag.trim()}
                              </span>
                            ))}
                            {article.tags.split(',').length > 3 && (
                              <span className="px-2 py-1 text-n-4 text-xs">
                                +{article.tags.split(',').length - 3} more
                              </span>
                            )}
                          </div>
                        )}
                      </Link>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="bg-n-7 hover:bg-n-6 disabled:opacity-50"
                      >
                        Previous
                      </Button>
                      <span className="px-4 py-2 text-n-2">
                        Page {currentPage} of {totalPages}
                      </span>
                      <Button
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="bg-n-7 hover:bg-n-6 disabled:opacity-50"
                      >
                        Next
                      </Button>
                    </div>
                  )}

                  {/* Results Count */}
                  <div className="text-center mt-8">
                    <p className="body-2 text-n-3">
                      Showing {startIndex + 1}-{Math.min(endIndex, articles.length)} of {articles.length} articles
                    </p>
                  </div>
                </>
              )}
            </>
          )}

          {/* Email Signup Modal */}
          {showSignupModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-n-8 rounded-2xl border border-n-6 p-8 max-w-md w-full">
                 <div className="mb-6">
                   <div className="flex items-center justify-between mb-3">
                     <h3 className="h4 text-n-1">Get Notified</h3>
                     <button
                       onClick={() => {
                         setShowSignupModal(false);
                         setSignupMessage(null);
                         setSignupForm({ firstName: '', email: '' });
                       }}
                       className="text-n-3 hover:text-n-1 transition-colors"
                     >
                       <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                       </svg>
                     </button>
                   </div>
                   <p className="body-2 text-n-3 mb-4">Sign up to receive a weekly newsletter with the latest AI news and updates.</p>
                 </div>
              

                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setSignupSubmitting(true);
                    setSignupMessage(null);

                    try {
                      // TODO: Replace with actual API endpoint
                      const response = await fetch('/api/newsletter/signup', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          firstName: signupForm.firstName,
                          email: signupForm.email,
                        }),
                      });

                      if (response.ok) {
                        setSignupMessage({ type: 'success', text: 'Successfully signed up for notifications!' });
                        setSignupForm({ firstName: '', email: '' });
                        setTimeout(() => {
                          setShowSignupModal(false);
                          setSignupMessage(null);
                        }, 2000);
                      } else {
                        setSignupMessage({ type: 'error', text: 'Failed to sign up. Please try again.' });
                      }
                    } catch (error) {
                      setSignupMessage({ type: 'error', text: 'An error occurred. Please try again.' });
                    } finally {
                      setSignupSubmitting(false);
                    }
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-n-2 mb-2">First Name</label>
                    <input
                      type="text"
                      value={signupForm.firstName}
                      onChange={(e) => setSignupForm(prev => ({ ...prev, firstName: e.target.value }))}
                      required
                      placeholder="Enter your first name"
                      className="w-full bg-n-7 border border-n-5 text-n-1 px-3 py-2 rounded-lg focus:border-color-1 focus:outline-none placeholder:text-n-4"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-n-2 mb-2">Email Address</label>
                    <input
                      type="email"
                      value={signupForm.email}
                      onChange={(e) => setSignupForm(prev => ({ ...prev, email: e.target.value }))}
                      required
                      placeholder="Enter your email"
                      className="w-full bg-n-7 border border-n-5 text-n-1 px-3 py-2 rounded-lg focus:border-color-1 focus:outline-none placeholder:text-n-4"
                    />
                  </div>

                  {signupMessage && (
                    <div
                      className={`p-4 rounded-lg ${
                        signupMessage.type === 'success'
                          ? 'bg-green-500/20 border border-green-500/50 text-green-400'
                          : 'bg-red-500/20 border border-red-500/50 text-red-400'
                      }`}
                    >
                      {signupMessage.text}
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button
                      type="submit"
                      disabled={signupSubmitting}
                      className="flex-1"
                    >
                      {signupSubmitting ? 'Submitting...' : 'Subscribe'}
                    </Button>
                    <Button
                      type="button"
                      onClick={() => {
                        setShowSignupModal(false);
                        setSignupMessage(null);
                        setSignupForm({ firstName: '', email: '' });
                      }}
                      className="bg-n-7 hover:bg-n-6"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </Section>
    </Layout>
  );
}

export default function AINewsPage() {
  return (
    <Suspense fallback={
      <Layout>
        <Section className="pt-12 pb-12">
          <div className="container">
            <div className="text-center py-12">
              <div className="w-8 h-8 border-2 border-color-1 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="body-2 text-n-3">Loading...</p>
            </div>
          </div>
        </Section>
      </Layout>
    }>
      <AINewsContent />
    </Suspense>
  );
}

