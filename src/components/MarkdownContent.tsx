import React from "react";

function parseLine(line: string, i: number): React.ReactNode {
  // ## Heading
  if (line.startsWith("## ")) {
    return (
      <h2 key={i} className="text-lg font-bold mt-8 mb-3 text-gray-900">
        {line.replace("## ", "")}
      </h2>
    );
  }

  // Table rows
  if (line.startsWith("| ")) {
    const cells = line
      .split("|")
      .filter((c) => c.trim())
      .map((c) => c.trim());
    // Skip separator rows (|---|---|)
    if (cells.every((c) => /^[-:]+$/.test(c))) return null;
    const isHeader = i === 0 || line.includes("날짜");
    return (
      <tr key={i} className={isHeader ? "font-bold" : ""}>
        {cells.map((cell, j) => (
          <td key={j} className="py-1.5 pr-4 text-sm text-gray-600">
            {cell}
          </td>
        ))}
      </tr>
    );
  }

  // Bullet list: - **bold** rest
  if (line.startsWith("- **")) {
    const parts = line.replace("- **", "").split("**");
    return (
      <p key={i} className="ml-2 mb-1">
        <strong>{parts[0]}</strong>
        {renderInline(parts.slice(1).join(""))}
      </p>
    );
  }

  // Bullet list: - text
  if (line.startsWith("- ")) {
    return (
      <p key={i} className="ml-2 mb-1">
        <span className="text-gray-300 mr-2">·</span>
        {renderInline(line.slice(2))}
      </p>
    );
  }

  // Full bold line: **text**
  if (line.match(/^\*\*.+\*\*$/)) {
    return (
      <p key={i} className="font-bold mt-4 mb-1 text-gray-900">
        {line.replace(/\*\*/g, "")}
      </p>
    );
  }

  // Bold prefix: **text** rest
  if (line.match(/^\*\*.+?\*\*/)) {
    const match = line.match(/^\*\*(.+?)\*\*(.*)$/);
    if (match) {
      return (
        <p key={i} className="mt-3">
          <strong>{match[1]}</strong>
          {renderInline(match[2])}
        </p>
      );
    }
  }

  // Numbered list
  if (/^\d+\.\s/.test(line)) {
    return (
      <p key={i} className="ml-4 mb-1 text-gray-600">
        {renderInline(line)}
      </p>
    );
  }

  // Empty line
  if (line.trim() === "") return <br key={i} />;

  // Regular paragraph
  return <p key={i}>{renderInline(line)}</p>;
}

function renderInline(text: string): React.ReactNode {
  // Handle inline **bold**
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  if (parts.length === 1) return text;

  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return <span key={i}>{part}</span>;
  });
}

export default function MarkdownContent({ content }: { content: string }) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let tableRows: React.ReactNode[] = [];
  let inTable = false;

  lines.forEach((line, i) => {
    const isTableLine = line.startsWith("| ");

    if (isTableLine) {
      inTable = true;
      const row = parseLine(line, i);
      if (row) tableRows.push(row);
    } else {
      if (inTable) {
        // Flush table
        elements.push(
          <div key={`table-${i}`} className="overflow-x-auto my-4">
            <table className="w-full">
              <tbody>{tableRows}</tbody>
            </table>
          </div>
        );
        tableRows = [];
        inTable = false;
      }
      elements.push(parseLine(line, i));
    }
  });

  // Flush remaining table
  if (inTable && tableRows.length > 0) {
    elements.push(
      <div key="table-end" className="overflow-x-auto my-4">
        <table className="w-full">
          <tbody>{tableRows}</tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="text-gray-700 leading-relaxed">{elements}</div>
  );
}
