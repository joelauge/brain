"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
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

export default function ArticlePage() {
  const params = useParams();
  const router = useRouter();
  const articleId = params.id as string;
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchArticle();
  }, [articleId]);

  const fetchArticle = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/ai-news?id=${articleId}`);
      if (!response.ok) {
        throw new Error('Article not found');
      }
      const data = await response.json();
      if (data.articles && data.articles.length > 0) {
        setArticle(data.articles[0]);
      } else {
        setError('Article not found');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load article');
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
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <Layout>
        <Section className="pt-12 pb-12">
          <div className="container text-center">
            <div className="w-8 h-8 border-2 border-color-1 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="body-2 text-n-3">Loading article...</p>
          </div>
        </Section>
      </Layout>
    );
  }

  if (error || !article) {
    return (
      <Layout>
        <Section className="pt-12 pb-12">
          <div className="container max-w-2xl">
            <div className="text-center">
              <h1 className="h2 text-n-1 mb-4">Article Not Found</h1>
              <p className="body-2 text-n-3 mb-8">{error || 'The article you are looking for does not exist.'}</p>
              <Button href="/ai-news">Back to AI News</Button>
            </div>
          </div>
        </Section>
      </Layout>
    );
  }

  return (
    <Layout>
      <Section className="pt-12 pb-12">
        <div className="container max-w-4xl">
          {/* Back Button */}
          <div className="mb-6">
            <Button
              onClick={() => router.back()}
              className="bg-n-7 hover:bg-n-6"
            >
              ← Back
            </Button>
          </div>

          {/* Article Header */}
          <div className="mb-8">
            {/* Category */}
            {article.category && (
              <Link
                href={`/ai-news/category/${encodeURIComponent(article.category)}`}
                className="inline-block px-4 py-2 bg-color-1/20 text-color-1 rounded-lg text-sm font-medium mb-4 hover:bg-color-1/30 transition-colors"
              >
                {article.category}
              </Link>
            )}

            {/* Title */}
            <h1 className="h1 text-n-1 mb-4">{article.title}</h1>

            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-4 text-n-3 body-2 mb-6">
              <span>{formatDate(article.published_at)}</span>
              {article.domain && (
                <>
                  <span>•</span>
                  <span>{article.domain}</span>
                </>
              )}
              {article.source_type && (
                <>
                  <span>•</span>
                  <span>{article.source_type}</span>
                </>
              )}
            </div>

          </div>

          {/* Article Content */}
          <div className="bg-n-8 rounded-2xl border border-n-6 p-8 mb-8">
            {/* Summary */}
            {article.summary && (
              <div className="mb-6 pb-6 border-b border-n-6">
                <p className="body-1 text-n-2 leading-relaxed">{article.summary}</p>
              </div>
            )}

            {/* Content Body */}
            <div
              className="prose prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: article.content_body }}
              style={{
                color: '#CAC6DD',
              }}
            />
          </div>

          {/* Tags */}
          {article.tags && (
            <div className="mb-8">
              <h3 className="h6 text-n-1 mb-4">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {article.tags.split(',').map((tag, idx) => (
                  <Link
                    key={idx}
                    href={`/ai-news/tag/${encodeURIComponent(tag.trim())}`}
                    className="px-4 py-2 bg-n-7 text-n-2 hover:bg-n-6 rounded-lg text-sm transition-colors"
                  >
                    {tag.trim()}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* External Link */}
          {article.url && (
            <div className="flex justify-center">
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="button px-6 py-3 bg-color-1 text-n-8 rounded-lg hover:opacity-90 transition-opacity"
              >
                Read Original Article →
              </a>
            </div>
          )}

          {/* Additional Info */}
          {(article.entities || article.score) && (
            <div className="mt-8 pt-8 border-t border-n-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {article.entities && (
                  <div>
                    <span className="text-n-3">Entities: </span>
                    <span className="text-n-2">{article.entities}</span>
                  </div>
                )}
                {article.score && (
                  <div>
                    <span className="text-n-3">Score: </span>
                    <span className="text-n-2">{article.score}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </Section>
    </Layout>
  );
}

