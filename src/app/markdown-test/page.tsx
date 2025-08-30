import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function MarkdownTest() {
  const testMarkdown = `
# Test Header

This is **bold text** and this is *italic text*.

- List item 1
- List item 2
- List item 3

\`\`\`javascript
console.log("Hello World");
\`\`\`

> This is a blockquote

| Column 1 | Column 2 |
|----------|----------|
| Cell 1   | Cell 2   |
`;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Markdown Test</h1>
      <div className="border p-4 rounded">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {testMarkdown}
        </ReactMarkdown>
      </div>
    </div>
  );
}
