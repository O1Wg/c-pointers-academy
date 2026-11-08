import { ReplitConnectors } from "@replit/connectors-sdk";
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";

const c = new ReplitConnectors();
const api = async (path, method = "GET", body) => {
  const r = await c.proxy("github-source-control", path, {
    method,
    headers: { "Content-Type": "application/json", Accept: "application/vnd.github+json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const t = await r.text();
  if (!r.ok) throw new Error(`${method} ${path} -> ${r.status} ${t.slice(0, 300)}`);
  return t ? JSON.parse(t) : {};
};

const OWNER = "O1Wg", REPO = "c-pointers-academy";
let repo;
try {
  repo = await api(`/repos/${OWNER}/${REPO}`);
  console.log("repo exists already");
} catch {
  repo = await api("/user/repos", "POST", {
    name: REPO,
    description: "Interactive website for learning C and pointers: lessons, memory diagrams, worked examples, quizzes, and resources.",
    private: false,
    auto_init: true,
  });
  console.log("created", repo.html_url);
}
const branch = repo.default_branch || "main";

const files = execSync("git ls-files -co --exclude-standard", { encoding: "utf8" })
  .split("\n").filter(Boolean)
  .filter((f) => f !== ".replit" && f !== ".replitignore");
files.push("README.md");
const uniq = [...new Set(files)];

const tree = [];
let n = 0;
for (const f of uniq) {
  const buf = readFileSync(f);
  const blob = await api(`/repos/${OWNER}/${REPO}/git/blobs`, "POST", { content: buf.toString("base64"), encoding: "base64" });
  tree.push({ path: f, mode: "100644", type: "blob", sha: blob.sha });
  if (++n % 40 === 0) console.log("uploaded", n, "/", uniq.length);
}
console.log("uploaded", n, "files");

const ref = await api(`/repos/${OWNER}/${REPO}/git/ref/heads/${branch}`);
const parent = await api(`/repos/${OWNER}/${REPO}/git/commits/${ref.object.sha}`);
const newTree = await api(`/repos/${OWNER}/${REPO}/git/trees`, "POST", { tree });
const commit = await api(`/repos/${OWNER}/${REPO}/git/commits`, "POST", {
  message: "Initial commit: C & Pointers Academy",
  tree: newTree.sha,
  parents: [parent.sha],
});
await api(`/repos/${OWNER}/${REPO}/git/refs/heads/${branch}`, "PATCH", { sha: commit.sha, force: true });
console.log("pushed to", `https://github.com/${OWNER}/${REPO}`);
