import { useEffect, useRef, useState } from "react";

export function useInViewAnimation<T extends HTMLElement = HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Триггер при 20% видимости секции
        if (entry.isIntersecting) {
          setIsInView(true);
          // Не останавливаем наблюдение — оставляем анимацию навсегда
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return { ref, isInView };
}
