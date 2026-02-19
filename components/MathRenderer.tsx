
import React, { useEffect, useRef } from 'react';

interface MathRendererProps {
  content: string;
  className?: string;
}

const MathRenderer: React.FC<MathRendererProps> = ({ content, className }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && (window as any).MathJax) {
      (window as any).MathJax.typesetPromise([containerRef.current]).catch((err: any) => 
        console.error('MathJax rendering error:', err)
      );
    }
  }, [content]);

  return (
    <div 
      ref={containerRef} 
      className={className}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
};

export default MathRenderer;
