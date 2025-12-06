import { NextRequest, NextResponse } from 'next/server';
import { parseString } from 'xml2js';

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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const tag = searchParams.get('tag');
    const search = searchParams.get('search');
    const articleId = searchParams.get('id');

    // Fetch XML from the external source
    const xmlResponse = await fetch('http://www.givecupid.com/latest.xml', {
      next: { revalidate: 300 } // Cache for 5 minutes
    });

    if (!xmlResponse.ok) {
      throw new Error(`Failed to fetch XML: ${xmlResponse.statusText}`);
    }

    const xmlText = await xmlResponse.text();

    // Parse XML
    const parsedXml: any = await new Promise((resolve, reject) => {
      parseString(xmlText, { 
        explicitArray: false, 
        mergeAttrs: true,
        explicitCharkey: false,
        trim: true
      }, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });

    // Extract articles from XML structure
    const dailyNews = parsedXml.daily_news || {};
    const articlesArray = Array.isArray(dailyNews.article) 
      ? dailyNews.article 
      : dailyNews.article 
        ? [dailyNews.article] 
        : [];

    // Helper function to extract text from XML node
    const extractText = (node: any): string => {
      if (!node) return '';
      if (typeof node === 'string') return node;
      if (node._) return node._;
      if (node._cdata) return node._cdata;
      if (Array.isArray(node) && node.length > 0) {
        return extractText(node[0]);
      }
      return '';
    };

    // Transform articles to our format
    let articles: Article[] = articlesArray.map((article: any) => ({
      id: article.id || '',
      title: extractText(article.title),
      url: extractText(article.url),
      domain: extractText(article.domain),
      published_at: extractText(article.published_at),
      summary: extractText(article.summary),
      content_body: extractText(article.content_body),
      image_url: extractText(article.image_url),
      category: extractText(article.category),
      tags: extractText(article.tags),
      entities: extractText(article.entities),
      score: extractText(article.score),
      source_type: extractText(article.source_type),
      is_primary_source: extractText(article.is_primary_source),
      content_hash: extractText(article.content_hash),
    }));

    // Filter by article ID if provided
    if (articleId) {
      articles = articles.filter(article => article.id === articleId);
      if (articles.length === 0) {
        return NextResponse.json({ error: 'Article not found' }, { status: 404 });
      }
      return NextResponse.json({ articles, total: 1 });
    }

    // Filter by category if provided
    if (category) {
      articles = articles.filter(article => 
        article.category.toLowerCase() === category.toLowerCase()
      );
    }

    // Filter by tag if provided
    if (tag) {
      articles = articles.filter(article => 
        article.tags.toLowerCase().includes(tag.toLowerCase())
      );
    }

    // Search functionality
    if (search) {
      const searchLower = search.toLowerCase();
      articles = articles.filter(article =>
        article.title.toLowerCase().includes(searchLower) ||
        article.summary.toLowerCase().includes(searchLower) ||
        article.content_body.toLowerCase().includes(searchLower) ||
        article.tags.toLowerCase().includes(searchLower)
      );
    }

    // Sort by published date (newest first)
    articles.sort((a, b) => {
      const dateA = new Date(a.published_at).getTime();
      const dateB = new Date(b.published_at).getTime();
      return dateB - dateA;
    });

    // Get unique categories and tags for filter options
    const categories = Array.from(new Set(articles.map(a => a.category).filter(Boolean))).sort();
    const allTags = articles.flatMap(a => 
      a.tags.split(',').map(t => t.trim()).filter(Boolean)
    );
    const uniqueTags = Array.from(new Set(allTags)).sort();

    return NextResponse.json({
      articles,
      total: articles.length,
      categories,
      tags: uniqueTags,
    });
  } catch (error) {
    console.error('Error fetching AI News:', error);
    return NextResponse.json(
      { error: 'Failed to fetch AI News', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

