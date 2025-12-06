"use client";

import { useState, useEffect, Suspense } from "react";
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

  const itemsPerPage = 12;

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
            <h1 className="h1 text-n-1 mb-4">AI News</h1>
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

