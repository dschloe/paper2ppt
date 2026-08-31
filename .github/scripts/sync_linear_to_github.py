"""Sync open Linear issues to GitHub Issues (ollama-advisor-agent style)."""

from __future__ import annotations

import json
import os
import sys
import urllib.error
import urllib.parse
import urllib.request
from typing import Any

LINEAR_API_URL = os.environ.get("LINEAR_API_URL", "https://api.linear.app/graphql")
GITHUB_API_URL = os.environ.get("GITHUB_API_URL", "https://api.github.com")
MARKER = "<!-- linear-id:"

ISSUES_QUERY = """
query Issues($first: Int!, $after: String, $filter: IssueFilter) {
  issues(first: $first, after: $after, filter: $filter) {
    pageInfo { hasNextPage endCursor }
    nodes {
      id
      identifier
      title
      description
      url
      state { name type }
      labels { nodes { name } }
    }
  }
}
"""


def linear_graphql(query: str, variables: dict | None = None) -> dict:
    api_key = os.environ["LINEAR_API_KEY"]
    payload = json.dumps({"query": query, "variables": variables or {}}).encode("utf-8")
    req = urllib.request.Request(
        LINEAR_API_URL,
        data=payload,
        headers={
            "Authorization": api_key,
            "Content-Type": "application/json",
            "User-Agent": "paper2ppt-issue-sync/0.1",
        },
        method="POST",
    )
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read())
    if data.get("errors"):
        raise RuntimeError(f"Linear API error: {data['errors']}")
    return data["data"]


def github_request(method: str, path: str, body: dict | None = None) -> Any:
    token = os.environ["GITHUB_TOKEN"]
    repo = os.environ.get("GITHUB_REPO", "dschloe/paper2ppt")
    url = f"{GITHUB_API_URL}/repos/{repo}{path}"
    data = json.dumps(body).encode("utf-8") if body is not None else None
    req = urllib.request.Request(
        url,
        data=data,
        headers={
            "Authorization": f"Bearer {token}",
            "Accept": "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
            "User-Agent": "paper2ppt-issue-sync/0.1",
            "Content-Type": "application/json",
        },
        method=method,
    )
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read())


def list_linear_open_issues(team_id: str, title_prefix: str = "", limit: int = 50) -> list[dict]:
    filt: dict = {"state": {"type": {"nin": ["completed", "canceled"]}}}
    if team_id:
        filt["team"] = {"id": {"eq": team_id}}
    if title_prefix:
        filt["title"] = {"contains": title_prefix}

    issues: list[dict] = []
    after = None
    while len(issues) < limit:
        page_size = min(50, limit - len(issues))
        data = linear_graphql(
            ISSUES_QUERY,
            {"first": page_size, "after": after, "filter": filt},
        )
        conn = data["issues"]
        batch = conn["nodes"]
        if title_prefix:
            batch = [i for i in batch if title_prefix in (i.get("title") or "")]
        issues.extend(batch)
        if not conn["pageInfo"]["hasNextPage"]:
            break
        after = conn["pageInfo"]["endCursor"]
    return issues


def list_github_open_issues() -> list[dict]:
    issues: list[dict] = []
    page = 1
    while True:
        query = urllib.parse.urlencode({"state": "open", "per_page": 100, "page": page})
        batch = github_request("GET", f"/issues?{query}")
        batch = [i for i in batch if "pull_request" not in i]
        issues.extend(batch)
        if len(batch) < 100:
            break
        page += 1
    return issues


def github_title(prefix: str, issue: dict) -> str:
    ident = issue["identifier"]
    title = issue["title"]
    if prefix:
        return f"{prefix} {ident}: {title}"
    return f"{ident}: {title}"


def github_body(issue: dict) -> str:
    desc = issue.get("description") or ""
    labels = [n["name"] for n in (issue.get("labels") or {}).get("nodes") or []]
    state = (issue.get("state") or {}).get("name", "")
    url = issue.get("url", "")
    return (
        f"{MARKER} {issue['identifier']} -->\n\n"
        f"**Linear:** [{issue['identifier']}]({url})\n"
        f"**State:** {state}\n"
        f"**Labels:** {', '.join(labels) if labels else '(none)'}\n\n"
        f"---\n\n"
        f"{desc}\n"
    )


def find_existing(github_issues: list[dict], identifier: str) -> dict | None:
    needle = f"{MARKER} {identifier} -->"
    for gi in github_issues:
        body = gi.get("body") or ""
        title = gi.get("title") or ""
        if needle in body or identifier in title:
            return gi
    return None


def main() -> int:
    api_key = os.environ.get("LINEAR_API_KEY", "").strip()
    token = os.environ.get("GITHUB_TOKEN", "").strip()
    team_id = os.environ.get("LINEAR_TEAM_ID", "").strip()
    title_prefix = os.environ.get("LINEAR_TITLE_PREFIX", "[paper2ppt]").strip()
    prefix = os.environ.get("ISSUE_TITLE_PREFIX", "[linear]").strip()
    dry_run = os.environ.get("DRY_RUN") == "1"

    if not api_key or not token:
        print("LINEAR_API_KEY or GITHUB_TOKEN not configured; skipping sync.")
        return 0

    try:
        linear_issues = list_linear_open_issues(team_id, title_prefix=title_prefix)
        github_issues = list_github_open_issues()
        prefix_note = f" (title contains {title_prefix!r})" if title_prefix else ""
        print(
            f"Found {len(linear_issues)} open Linear issue(s){prefix_note}, "
            f"{len(github_issues)} open GitHub issue(s)"
        )

        for issue in linear_issues:
            ident = issue["identifier"]
            title = github_title(prefix, issue)
            body = github_body(issue)
            existing = find_existing(github_issues, ident)

            if existing:
                number = existing["number"]
                if dry_run:
                    print(f"DRY RUN: would update GitHub #{number} for {ident}")
                    continue
                github_request("PATCH", f"/issues/{number}", {"title": title, "body": body})
                print(f"Updated GitHub #{number} ← {ident}")
            else:
                if dry_run:
                    print(f"DRY RUN: would create GitHub issue for {ident}")
                    continue
                created = github_request("POST", "/issues", {"title": title, "body": body, "labels": ["linear"]})
                print(f"Created GitHub #{created['number']} ← {ident} ({created.get('html_url', '')})")

        return 0
    except urllib.error.HTTPError as exc:
        print(f"HTTP error: {exc.code} {exc.reason}", file=sys.stderr)
        return 1
    except RuntimeError as exc:
        print(str(exc), file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
