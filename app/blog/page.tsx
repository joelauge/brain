"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Layout from "@/components/Layout";
import Section from "@/components/Section";
import Button from "@/components/Button";

interface BlogArticle {
  id: string;
  title: string;
  body: string;
  pubDate: string;
  video?: {
    title?: string;
    url?: string;
  };
  img?: string;
}

interface ApiResponse {
  articles: BlogArticle[];
  total: number;
}

function BlogContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [articles, setArticles] = useState<BlogArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get('page') || '1', 10)
  );
  const [searchQuery, setSearchQuery] = useState<string>(
    searchParams.get('search') || ''
  );

  const itemsPerPage = 12;

  useEffect(() => {
    fetchArticles();
  }, [searchQuery]);

  useEffect(() => {
    // Reset to page 1 when filters change
    setCurrentPage(1);
  }, [searchQuery]);

  useEffect(() => {
    // Update URL when filters change
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (currentPage > 1) params.set('page', currentPage.toString());
    
    const newUrl = params.toString() 
      ? `/blog?${params.toString()}` 
      : '/blog';
    router.replace(newUrl, { scroll: false });
  }, [searchQuery, currentPage, router]);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set('search', searchQuery);

      const response = await fetch(`/api/blog?${params.toString()}`);
      const data: ApiResponse = await response.json();
      
      setArticles(data.articles || []);
      setCurrentPage(1); // Reset to first page when filters change
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchArticles();
  };

  const clearFilters = () => {
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

  // Extract summary from body HTML
  const getSummary = (body: string, maxLength: number = 150) => {
    // Remove HTML tags and get plain text
    const text = body.replace(/<[^>]*>/g, '').trim();
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <Layout>
      <Section className="pt-12 pb-12">
        <div className="container">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="h1 text-n-1 mb-4">Blog</h1>
            <p className="body-2 text-n-3 max-w-2xl mx-auto">
              Insights, updates, and deep dives into the world of artificial intelligence 
              and technology innovation.
            </p>
          </div>

          {/* Search */}
          <div className="mb-8">
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
          </div>

          {/* Active Filters */}
          {searchQuery && (
            <div className="flex items-center gap-2 flex-wrap mb-4">
              <span className="text-n-3 text-sm">Active filters:</span>
              <span className="px-3 py-1 bg-color-1/20 text-color-1 rounded-lg text-sm">
                Search: {searchQuery}
              </span>
              <button
                onClick={clearFilters}
                className="px-3 py-1 bg-n-7 text-n-2 hover:bg-n-6 rounded-lg text-sm transition-colors"
              >
                Clear
              </button>
            </div>
          )}

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
                        href={`/blog/${article.id}`}
                        className="bg-n-8 rounded-2xl border border-n-6 p-6 hover:border-color-1/50 transition-all group"
                      >
                        {/* Title */}
                        <h2 className="h5 text-n-1 mb-3 group-hover:text-color-1 transition-colors line-clamp-2">
                          {article.title}
                        </h2>

                        {/* Date */}
                        <p className="caption text-n-4 mb-4">
                          {formatDate(article.pubDate)}
                        </p>

                        {/* Summary */}
                        <p className="body-2 text-n-3 mb-4 line-clamp-3">
                          {getSummary(article.body)}
                        </p>
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
        </div>
      </Section>
    </Layout>
  );
}

export default function BlogPage() {
  return (
    <Suspense fallback={
      <Layout>
        <Section className="pt-12 pb-12">
          <div className="container text-center">
            <div className="w-8 h-8 border-2 border-color-1 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="body-2 text-n-3">Loading...</p>
          </div>
        </Section>
      </Layout>
    }>
      <BlogContent />
    </Suspense>
  );
}


