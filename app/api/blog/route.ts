import { NextRequest, NextResponse } from 'next/server';
import { parseString } from 'xml2js';

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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const articleId = searchParams.get('id');

    // Fetch XML from the external source
    const xmlResponse = await fetch('https://3s8bomyydqcsvtib.public.blob.vercel-storage.com/uploads/xml/blog.xml', {
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
    const articlesRoot = parsedXml.articles || {};
    const articlesArray = Array.isArray(articlesRoot.article) 
      ? articlesRoot.article 
      : articlesRoot.article 
        ? [articlesRoot.article] 
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
    let articles: BlogArticle[] = articlesArray.map((article: any, index: number) => ({
      id: `blog-${index}`,
      title: extractText(article.title),
      body: extractText(article.body),
      pubDate: extractText(article.pubDate),
      video: article.video ? {
        title: extractText(article.video.title),
        url: extractText(article.video.url),
      } : undefined,
      img: extractText(article.img),
    }));

    // Filter by article ID if provided
    if (articleId) {
      const foundArticle = articles.find(article => article.id === articleId);
      if (!foundArticle) {
        return NextResponse.json({ error: 'Article not found' }, { status: 404 });
      }
      return NextResponse.json({ articles: [foundArticle], total: 1 });
    }

    // Search functionality
    if (search) {
      const searchLower = search.toLowerCase();
      articles = articles.filter(article =>
        article.title.toLowerCase().includes(searchLower) ||
        article.body.toLowerCase().includes(searchLower)
      );
    }

    // Sort by published date (newest first)
    articles.sort((a, b) => {
      const dateA = new Date(a.pubDate).getTime();
      const dateB = new Date(b.pubDate).getTime();
      return dateB - dateA;
    });

    return NextResponse.json({
      articles,
      total: articles.length,
    });
  } catch (error) {
    console.error('Error fetching Blog:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Blog articles', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

