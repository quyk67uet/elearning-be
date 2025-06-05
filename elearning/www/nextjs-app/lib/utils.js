import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import "katex/dist/katex.min.css";

import { InlineMath, BlockMath } from "react-katex";
import React from "react";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Predefined color palette
const colors = [
  "#6366f1", // indigo-600
  "#4ade80", // green-400
  "#f97316", // orange-500
  "#22d3ee", // cyan-400
  "#a855f7", // violet-500
  "#fb923c", // amber-400
  "#ec4899", // pink-500
  "#14b8a6", // teal-500
  "#eab308", // yellow-500
  "#ef4444", // red-500
];

// Simple hash function to get a consistent index based on string
// Ensures the same topic name always gets the same color index.
const simpleHash = (str) => {
  if (!str) return 0;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
};

/**
 * Assigns a color from the predefined palette based on the topic name or ID.
 * For chapters, uses the chapter number (name field) to ensure distinct colors.
 *
 * @param {string} topicName - The name of the topic
 * @param {number|string} topicId - The ID/name of the topic (chapter number)
 * @returns {string} A hex color code
 */
export const getTopicColor = (topicName, topicId) => {
  // Check if this is a chapter topic (starts with "Chương")
  if (typeof topicName === "string" && topicName.startsWith("Chương")) {
    // Use the chapter number (topicId) to pick a color
    // Convert topicId to number if it's a string
    const chapterNum =
      typeof topicId === "number" ? topicId : parseInt(topicId, 10);

    // Make sure we have a valid number, otherwise fallback to hash method
    if (!isNaN(chapterNum)) {
      // Using modulo to wrap around if we have more chapters than colors
      return colors[(chapterNum - 1) % colors.length];
    }
  }

  // Fallback to original hash method for non-chapter topics or invalid IDs
  const topicNameForColor = (topicName || "")
    .replace(/^Chương \d+\.\s*/i, "")
    .trim();
  const hash = simpleHash(topicNameForColor);
  return colors[hash % colors.length];
};

export function formatDurationFromSeconds(totalSeconds) {
  if (totalSeconds === null || totalSeconds === undefined || totalSeconds < 0) {
    return "N/A";
  }
  if (totalSeconds === 0) {
    return "0s";
  }
  const seconds = Math.floor(totalSeconds % 60);
  const totalMinutes = Math.floor(totalSeconds / 60);
  const minutes = totalMinutes % 60;
  const hours = Math.floor(totalMinutes / 60);
  let parts = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`);
  return parts.join(" ");
}
export const parseLatex = (text) => {
  if (text === null || text === undefined || typeof text !== "string") {
    return text;
  }
  if (text.trim() === "") {
    return "";
  }

  // MODIFIED Regex: Replaced `.` with `[\s\S]` for block delimiters \[...\] and $$...$$
  // This allows the content within these delimiters to span multiple lines.
  const parts = text.split(
    /(\\\([\s\S]*?\\\)|\\\[[\s\S]*?\\\]|\$\$[\s\S]*?\$\$|\$.*?\$)/g
  );
  // Note: I've also applied [\s\S] to \( \) just in case, though it's less common for them to span lines.
  // If you are certain $...$ and \(...\) will NEVER span lines, you can revert those specific parts back to .*?
  // For safety and to handle potential edge cases, using [\s\S]*? for all content parts is often more robust.
  // Let's use it for all for now, and you can fine-tune if needed for single $.
  // Corrected regex for robustness with [\s\S] for multi-line content within all delimiters:
  // const parts = text.split(/(\\\([\s\S]*?\\\)|\\\[[\s\S]*?\\\]|\$\$[\s\S]*?\$\$|\$[\s\S]*?\$)/g);
  // For your specific issue, the key is for \[ and $$:
  // const parts = text.split(/(\\\(.*?\\\)|\\\[[\s\S]*?\\\]|\$\$[\s\S]*?\$\$|\$.*?\$)/g);

  return parts.map((part, index) => {
    if (!part) return null;

    // console.log(`Parsing part [${index}]: '${part}'`); // Keep for debugging if needed

    try {
      if (part.startsWith("\\(") && part.endsWith("\\)")) {
        return (
          <InlineMath key={index} math={part.substring(2, part.length - 2)} />
        );
      }
      if (part.startsWith("\\[") && part.endsWith("\\]")) {
        return (
          <BlockMath key={index} math={part.substring(2, part.length - 2)} />
        );
      }
      if (part.startsWith("$$") && part.endsWith("$$")) {
        return (
          <BlockMath key={index} math={part.substring(2, part.length - 2)} />
        );
      }
      if (
        part.startsWith("$") &&
        part.endsWith("$") &&
        part.length > 2 &&
        !part.match(/^\$\d+(\.\d{1,2})?(?!\d)/) // Avoid matching currency
      ) {
        // For single $, ensure it doesn't greedily match across newlines if not intended.
        // If single $ should NOT span newlines, its regex part should remain `.*?`
        // If it CAN, then `[\s\S]*?` is needed in the split regex for it too.
        // Assuming here that single $ inline math typically does not span lines.
        return (
          <InlineMath key={index} math={part.substring(1, part.length - 1)} />
        );
      }
    } catch (error) {
      console.error("Error rendering LaTeX part:", error, "\nPart:", part);
      return (
        <span
          key={index}
          className="text-red-500 font-mono"
          title={`LaTeX Error: ${error.message}`}
        >
          {part}
        </span>
      );
    }

    // If not a LaTeX part, render plain text, handling newlines
    return part.split(/(\n)/g).map((textOrNewline, subIndex) => {
      if (textOrNewline === "\n") {
        return <br key={`${index}-br-${subIndex}`} />;
      }
      return textOrNewline;
    });
  });
};

const MODE_MAP = {
  Topics: "topics",
  "Practice Test": "practice-test",
  "Full Exam Simulation": "full-exam-simulation",
};
const MODE_MAP_REVERSE = Object.fromEntries(
  Object.entries(MODE_MAP).map(([k, v]) => [v, k])
);

export function getModeFromUrl(modeFromUrl) {
  if (!modeFromUrl || modeFromUrl === "topics") return "Topics";
  return MODE_MAP_REVERSE[modeFromUrl] || "Topics";
}

export function getUrlForMode(mode) {
  return mode === "Topics"
    ? "/test"
    : { pathname: "/test", query: { mode: MODE_MAP[mode] } };
}
