/**
 * Srcbook Parser for ClearThought MCP Server
 *
 * Parses .src.md files following Srcbook format to extract cells
 * and make them available as MCP resources with embedded instructions.
 */
import { randomUUID } from "node:crypto";
import { marked } from "marked";
const SRCBOOK_METADATA_RE = /^<!--\s*srcbook:(.+)\s*-->$/;
/**
 * Parse a .src.md file into a structured Srcbook format
 */
export function parseSrcbook(contents, filename) {
    // Parse markdown tokens
    const tokens = marked.lexer(contents);
    // Extract metadata
    const metadata = extractMetadata(tokens);
    // Extract cells
    const cells = extractCells(tokens, metadata.language);
    // Get title from first cell
    const titleCell = cells.find((c) => c.type === "title");
    const title = titleCell?.text || filename.replace(".src.md", "");
    return {
        metadata,
        cells,
        title,
    };
}
/**
 * Extract Srcbook metadata from tokens
 */
function extractMetadata(tokens) {
    for (const token of tokens) {
        if (token.type !== "html")
            continue;
        const match = token.raw.trim().match(SRCBOOK_METADATA_RE);
        if (match) {
            try {
                return JSON.parse(match[1]);
            }
            catch (e) {
                console.error("Failed to parse srcbook metadata:", e);
            }
        }
    }
    // Default to JavaScript if no metadata found
    return { language: "javascript" };
}
/**
 * Extract cells from markdown tokens
 */
function extractCells(tokens, language) {
    const cells = [];
    let currentMarkdown = "";
    for (const token of tokens) {
        // Skip metadata comments
        if (token.type === "html" && token.raw.match(SRCBOOK_METADATA_RE)) {
            continue;
        }
        // Title cell (H1)
        if (token.type === "heading" && token.depth === 1) {
            if (currentMarkdown.trim()) {
                cells.push({
                    id: randomUUID(),
                    type: "markdown",
                    text: currentMarkdown.trim(),
                });
                currentMarkdown = "";
            }
            cells.push({
                id: randomUUID(),
                type: "title",
                text: token.text,
            });
            continue;
        }
        // Code cell with filename (H6 followed by code block)
        if (token.type === "heading" && token.depth === 6) {
            if (currentMarkdown.trim()) {
                cells.push({
                    id: randomUUID(),
                    type: "markdown",
                    text: currentMarkdown.trim(),
                });
                currentMarkdown = "";
            }
            // Look for the next code block
            const nextIndex = tokens.indexOf(token) + 1;
            if (nextIndex < tokens.length) {
                const nextToken = tokens[nextIndex];
                if (nextToken && nextToken.type === "code") {
                    const filename = token.text;
                    if (filename === "package.json") {
                        cells.push({
                            id: randomUUID(),
                            type: "package.json",
                            source: nextToken.text,
                            filename: "package.json",
                        });
                    }
                    else {
                        cells.push({
                            id: randomUUID(),
                            type: "code",
                            source: nextToken.text,
                            language: filename.endsWith(".ts") ? "typescript" : language,
                            filename,
                        });
                    }
                    // Skip the code block token since we've processed it
                    tokens.splice(nextIndex, 1);
                }
            }
            continue;
        }
        // Regular code block without filename
        if (token.type === "code" && !token.lang?.startsWith("```")) {
            if (currentMarkdown.trim()) {
                cells.push({
                    id: randomUUID(),
                    type: "markdown",
                    text: currentMarkdown.trim(),
                });
                currentMarkdown = "";
            }
            // Only create a code cell if it's JS/TS code
            if (!token.lang ||
                ["javascript", "typescript", "js", "ts"].includes(token.lang)) {
                cells.push({
                    id: randomUUID(),
                    type: "code",
                    source: token.text,
                    language: token.lang === "typescript" || token.lang === "ts"
                        ? "typescript"
                        : language,
                    filename: `cell-${cells.length}.${language === "typescript" ? "ts" : "js"}`,
                });
            }
            else {
                // Non-JS/TS code blocks become part of markdown
                currentMarkdown += token.raw;
            }
            continue;
        }
        // Accumulate markdown content
        currentMarkdown += token.raw;
    }
    // Add any remaining markdown
    if (currentMarkdown.trim()) {
        cells.push({
            id: randomUUID(),
            type: "markdown",
            text: currentMarkdown.trim(),
        });
    }
    return cells;
}
/**
 * Convert a parsed Srcbook into MCP resource format
 */
export function srcbookToResource(srcbook, notebookName) {
    const codeLanguage = srcbook.metadata.language;
    const cellCount = srcbook.cells.length;
    const codeCellCount = srcbook.cells.filter((c) => c.type === "code").length;
    return {
        uri: `notebook:///${notebookName}`,
        name: srcbook.title,
        title: `📓 ${srcbook.title}`,
        description: `Interactive ${codeLanguage === "typescript" ? "TypeScript" : "JavaScript"} notebook with ${codeCellCount} code cells`,
        mimeType: "text/markdown",
        annotations: {
            audience: ["assistant"],
            priority: 0.8,
            capabilities: [
                codeLanguage,
                "interactive-execution",
                "literate-programming",
            ],
            instructions: {
                execution: "Use mcp__ide__executeCode to run code cells",
                navigation: "Process cells sequentially for learning flow",
                cellExtraction: "Code cells are marked with ###### filename or are standalone code blocks",
                interaction: `Extract ${codeLanguage} code and execute with appropriate tool`,
            },
            metadata: {
                language: codeLanguage,
                cellCount,
                codeCellCount,
                hasPackageJson: srcbook.cells.some((c) => c.type === "package.json"),
                hasTsConfig: !!srcbook.metadata["tsconfig.json"],
            },
        },
    };
}
/**
 * Generate embedded resource for a specific cell
 */
export function cellToEmbeddedResource(cell, notebookName, cellIndex) {
    if (cell.type === "code") {
        return {
            type: "resource",
            resource: {
                uri: `notebook:///${notebookName}#cell-${cellIndex}`,
                title: cell.filename,
                mimeType: "text/plain",
                text: cell.source,
                annotations: {
                    audience: ["assistant"],
                    instructions: `Execute this ${cell.language} code using mcp__ide__executeCode`,
                    cellType: "code",
                    language: cell.language,
                    filename: cell.filename,
                },
            },
        };
    }
    else if (cell.type === "markdown") {
        return {
            type: "resource",
            resource: {
                uri: `notebook:///${notebookName}#cell-${cellIndex}`,
                title: `Cell ${cellIndex}`,
                mimeType: "text/markdown",
                text: cell.text,
                annotations: {
                    audience: ["assistant"],
                    cellType: "markdown",
                },
            },
        };
    }
    return null;
}
/**
 * Encode a Srcbook back to .src.md format
 */
export function encodeSrcbook(srcbook) {
    const parts = [];
    // Add metadata
    parts.push(`<!-- srcbook:${JSON.stringify(srcbook.metadata)} -->`);
    // Add cells
    for (const cell of srcbook.cells) {
        switch (cell.type) {
            case "title":
                parts.push(`# ${cell.text}`);
                break;
            case "markdown":
                parts.push(cell.text);
                break;
            case "package.json":
                parts.push("###### package.json");
                parts.push("```json");
                parts.push(cell.source);
                parts.push("```");
                break;
            case "code":
                parts.push(`###### ${cell.filename}`);
                parts.push(`\`\`\`${cell.language}`);
                parts.push(cell.source);
                parts.push("```");
                break;
        }
    }
    return `${parts.join("\n\n")}\n`;
}
