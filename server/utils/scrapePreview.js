const URL_REGEX = /(https?:\/\/[^\s]+)/;

/**
 * Parses the first URL in the text, fetches the target page,
 * and extracts Open Graph title, description, and image tags.
 */
const scrapePreview = async (text) => {
  if (!text) return null;
  const match = text.match(URL_REGEX);
  if (!match) return null;
  const url = match[0];

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      signal: AbortSignal.timeout(3000) // Timeout after 3 seconds to avoid blocking post creation
    });

    if (!response.ok) return null;
    const html = await response.text();

    const getMetaTag = (htmlText, name) => {
      // Regex 1: <meta property="og:name" content="val">
      const regex1 = new RegExp(`<meta[^>]*(?:property|name)=["']${name}["'][^>]*content=["']([^"']+)["']`, 'i');
      // Regex 2: <meta content="val" property="og:name">
      const regex2 = new RegExp(`<meta[^>]*content=["']([^"']+)["'][^>]*(?:property|name)=["']${name}["']`, 'i');
      
      const match1 = htmlText.match(regex1);
      if (match1) return match1[1];
      
      const match2 = htmlText.match(regex2);
      return match2 ? match2[1] : null;
    };

    // Extract title
    let title = getMetaTag(html, 'og:title') || getMetaTag(html, 'twitter:title') || '';
    if (!title) {
      // Fallback to HTML title tag
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      if (titleMatch) title = titleMatch[1];
    }

    // Extract description
    const description = getMetaTag(html, 'og:description') || getMetaTag(html, 'twitter:description') || getMetaTag(html, 'description') || '';
    
    // Extract image
    const image = getMetaTag(html, 'og:image') || getMetaTag(html, 'twitter:image') || '';

    if (!title && !description) return null;

    // Decode HTML entities briefly if they exist
    const cleanStr = str => str
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .trim();

    return {
      url,
      title: cleanStr(title),
      description: cleanStr(description),
      image: cleanStr(image)
    };
  } catch (err) {
    // Fail silently so post creation isn't blocked if scraping fails
    return null;
  }
};

module.exports = scrapePreview;
