import { useEffect } from 'react';

interface SEOConfig {
    title: string;
    description: string;
    canonical?: string;
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
}

/**
 * useSEO — Programmatically updates page metadata for SEO.
 * Sets document.title, <meta name="description">, <link rel="canonical">,
 * and Open Graph tags on every route that calls this hook.
 */
export const useSEO = ({
    title,
    description,
    canonical,
    ogTitle,
    ogDescription,
    ogImage,
}: SEOConfig): void => {
    useEffect(() => {
        // 1. Page title
        document.title = title;

        // 2. Meta description
        let metaDesc = document.querySelector<HTMLMetaElement>('meta[name="description"]');
        if (!metaDesc) {
            metaDesc = document.createElement('meta');
            metaDesc.name = 'description';
            document.head.appendChild(metaDesc);
        }
        metaDesc.content = description;

        // 3. Canonical link
        let canonicalLink = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
        if (canonical) {
            if (!canonicalLink) {
                canonicalLink = document.createElement('link');
                canonicalLink.rel = 'canonical';
                document.head.appendChild(canonicalLink);
            }
            canonicalLink.href = canonical;
        }

        // 4. Open Graph tags
        const setOgMeta = (property: string, content: string) => {
            let el = document.querySelector<HTMLMetaElement>(`meta[property="${property}"]`);
            if (!el) {
                el = document.createElement('meta');
                el.setAttribute('property', property);
                document.head.appendChild(el);
            }
            el.content = content;
        };

        setOgMeta('og:title', ogTitle || title);
        setOgMeta('og:description', ogDescription || description);
        setOgMeta('og:type', 'website');
        if (ogImage) setOgMeta('og:image', ogImage);
        if (canonical) setOgMeta('og:url', canonical);

        // Cleanup: restore to default on unmount
        return () => {
            document.title = 'ElevateAI | AI Resume Checker';
        };
    }, [title, description, canonical, ogTitle, ogDescription, ogImage]);
};
