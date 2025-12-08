"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
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

export default function BlogArticlePage() {
  const params = useParams();
  const router = useRouter();
  const articleId = params.id as string;
  const [article, setArticle] = useState<BlogArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchArticle();
  }, [articleId]);

  const fetchArticle = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/blog?id=${articleId}`);
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
              <Button href="/blog">Back to Blog</Button>
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
            {/* Title */}
            <h1 className="h1 text-n-1 mb-4">{article.title}</h1>

            {/* Date */}
            <p className="body-2 text-n-3 mb-6">
              {formatDate(article.pubDate)}
            </p>
          </div>

          {/* Article Content */}
          <div className="bg-n-8 rounded-2xl border border-n-6 p-8 mb-8">
            <div
              className="prose prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: article.body }}
              style={{
                color: '#CAC6DD',
              }}
            />
          </div>

          {/* Video */}
          {article.video && article.video.url && (
            <div className="mb-8">
              <h3 className="h6 text-n-1 mb-4">Video</h3>
              <div className="bg-n-8 rounded-2xl border border-n-6 p-6">
                {article.video.title && (
                  <h4 className="h6 text-n-1 mb-4">{article.video.title}</h4>
                )}
                <a
                  href={article.video.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="button px-6 py-3 bg-color-1 text-n-8 rounded-lg hover:opacity-90 transition-opacity inline-block"
                >
                  Watch Video →
                </a>
              </div>
            </div>
          )}
        </div>
      </Section>
    </Layout>
  );
}


