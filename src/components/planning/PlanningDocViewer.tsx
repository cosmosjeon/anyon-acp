import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface PlanningDocViewerProps {
  content: string;
}

/**
 * Markdown document viewer for planning documents
 * Renders GFM-compatible markdown with proper styling
 */
export const PlanningDocViewer: React.FC<PlanningDocViewerProps> = ({ content }) => {
  return (
    <div className="h-full overflow-y-auto p-6 bg-background">
      <div className="prose prose-sm dark:prose-invert max-w-none
        prose-headings:font-semibold
        prose-h1:text-2xl prose-h1:border-b prose-h1:pb-2 prose-h1:mb-4
        prose-h2:text-xl prose-h2:mt-6 prose-h2:mb-3
        prose-h3:text-lg prose-h3:mt-4 prose-h3:mb-2
        prose-p:leading-relaxed prose-p:mb-3
        prose-ul:my-2 prose-ol:my-2
        prose-li:my-0.5
        prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
        prose-pre:bg-muted prose-pre:border prose-pre:rounded-lg
        prose-table:border-collapse prose-table:w-full
        prose-th:border prose-th:border-border prose-th:bg-muted prose-th:px-3 prose-th:py-2 prose-th:text-left
        prose-td:border prose-td:border-border prose-td:px-3 prose-td:py-2
        prose-a:text-primary prose-a:no-underline hover:prose-a:underline
        prose-blockquote:border-l-4 prose-blockquote:border-primary/50 prose-blockquote:pl-4 prose-blockquote:italic
      ">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
};

export default PlanningDocViewer;
