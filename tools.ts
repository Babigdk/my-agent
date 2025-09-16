import { tool } from "ai";
import { simpleGit } from "simple-git";
import { z } from "zod";

const excludeFiles = ["dist", "bun.lock"];

const fileChange = z.object({
  rootDir: z.string().min(1).describe("The root directory"),
});

type FileChange = z.infer<typeof fileChange>;

async function getFileChangesInDirectory({ rootDir }: FileChange) {
  const git = simpleGit(rootDir);
  const summary = await git.diffSummary();
  const diffs: { file: string; diff: string }[] = [];

  for (const file of summary.files) {
    if (excludeFiles.includes(file.file)) continue;
    const diff = await git.diff(["--", file.file]);
    diffs.push({ file: file.file, diff });
  }

  return diffs;
}

export const getFileChangesInDirectoryTool = tool({
  description: "Gets the code changes made in given directory",
  inputSchema: fileChange,
  execute: getFileChangesInDirectory,
});

const textSummarization = z.object({
  text: z.string().min(1).describe("The text to summarize"),
});

type TextSummarization = z.infer<typeof textSummarization>;

async function summarize_text({ text }: TextSummarization) {
  // Use a regular expression to split the text into sentences.
  const sentences = text.match(/[^.!?]+[.!?]+/g);

  // If the text contains less than or equal to 2 sentences, return the original text.
  if (!sentences || sentences.length <= 2) {
    return text;
  }

  // Otherwise, return the first and last sentences.
  return `${sentences[0].trim()} ${sentences[sentences.length - 1].trim()}`;
}

export const summarizeTextTool = tool({
  description: "Summarizes a given text",
  inputSchema: textSummarization,
  execute: summarize_text,
});
