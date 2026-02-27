import { useCallback, useEffect, useRef } from 'react';

/**
 * Lightweight Intersection Observer hook.
 * Adds class "in-view" to the element when it enters the viewport.
 * Combined with "section-hidden" class in App.css this creates scroll entrance animations.
 */
export const useInView = (threshold = 0.15) => {
    const ref = useRef<HTMLDivElement>(null);

    const observe = useCallback(() => {
        const el = ref.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                    observer.unobserve(entry.target); // fire once
                }
            },
            { threshold }
        );

        observer.observe(el);
        return () => observer.unobserve(el);
    }, [threshold]);

    useEffect(() => {
        return observe();
    }, [observe]);

    return ref;
};
