import fetch from "node-fetch";

const JUDGE_URL = process.env.JUDGE_URL || "http://judge-service-go:8080";

export async function runCode({ submissionId, problemId, language, code, tests, functionName, compareMode }) {
  const response = await fetch(`${JUDGE_URL}/run`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      submissionId,
      problemId,
      language,
      code,
      tests,
      functionName,
      compareMode: compareMode || "EXACT"
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Judge error: ${errorText}`);
  }

  return await response.json();
}
