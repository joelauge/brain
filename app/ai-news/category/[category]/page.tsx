"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
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
}

export default function CategoryPage() {
  const params = useParams();
  const category = decodeURIComponent(params.category as string);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    fetchArticles();
  }, [category]);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/ai-news?category=${encodeURIComponent(category)}`);
      const data = await response.json();
      setArticles(data.articles || []);
      setCurrentPage(1);
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const totalPages = Math.ceil(articles.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedArticles = articles.slice(startIndex, endIndex);

  return (
    <Layout>
      <Section className="pt-12 pb-12">
        <div className="container">
          {/* Header */}
          <div className="mb-8">
            <Link href="/ai-news" className="inline-block mb-4">
              <Button className="bg-n-7 hover:bg-n-6">
                ← Back to AI News
              </Button>
            </Link>
            <h1 className="h1 text-n-1 mb-4">Category: {category}</h1>
            <p className="body-2 text-n-3">
              {articles.length} article{articles.length !== 1 ? 's' : ''} found
            </p>
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
                  <p className="body-1 text-n-3">No articles found in this category.</p>
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
                </>
              )}
            </>
          )}
        </div>
      </Section>
    </Layout>
  );
}

