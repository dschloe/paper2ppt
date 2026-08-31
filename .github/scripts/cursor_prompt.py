"""Build a Cursor-ready prompt from a Linear issue identifier."""

from __future__ import annotations

import json
import os
import sys
import urllib.error
import urllib.request

LINEAR_API_URL = os.environ.get("LINEAR_API_URL", "https://api.linear.app/graphql")

ISSUE_QUERY = """
query Issue($id: String!) {
  issue(id: $id) {
    id
    identifier
    title
    description
    url
    state { name type }
    labels { nodes { name } }
  }
}
"""

ISSUES_SEARCH = """
query Issues($first: Int!, $filter: IssueFilter) {
  issues(first: $first, filter: $filter) {
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


def graphql(query: str, variables: dict | None = None) -> dict:
    api_key = os.environ["LINEAR_API_KEY"]
    payload = json.dumps({"query": query, "variables": variables or {}}).encode("utf-8")
    req = urllib.request.Request(
        LINEAR_API_URL,
        data=payload,
        headers={
            "Authorization": api_key,
            "Content-Type": "application/json",
            "User-Agent": "paper2ppt-cursor-prompt/0.1",
        },
        method="POST",
    )
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read())
    if data.get("errors"):
        raise RuntimeError(f"Linear API error: {data['errors']}")
    return data["data"]


def get_issue(identifier: str, team_id: str) -> dict | None:
    try:
        data = graphql(ISSUE_QUERY, {"id": identifier})
        if data.get("issue"):
            return data["issue"]
    except RuntimeError:
        pass

    number = int(identifier.rsplit("-", 1)[-1])
    filt: dict = {"number": {"eq": number}}
    if team_id:
        filt["team"] = {"id": {"eq": team_id}}
    data = graphql(ISSUES_SEARCH, {"first": 10, "filter": filt})
    for node in data["issues"]["nodes"]:
        if node["identifier"].upper() == identifier.upper():
            return node
    return None


def build_prompt(issue: dict) -> str:
    labels = [n["name"] for n in (issue.get("labels") or {}).get("nodes") or []]
    desc = issue.get("description") or "(no description)"
    state = (issue.get("state") or {}).get("name", "")
    url = issue.get("url", "")

    return f"""# Task from Linear `{issue['identifier']}`

Work in the **paper-to-slides** repo (`dschloe/paper2ppt`).

## Issue
- **ID:** {issue['identifier']}
- **Title:** {issue['title']}
- **State:** {state}
- **Labels:** {', '.join(labels) if labels else '(none)'}
- **URL:** {url}

## Description
{desc}

## Instructions for Cursor
1. Reproduce / understand the issue (check CI logs if this is a CI failure).
2. Implement the smallest correct fix in `paper2ppt`.
3. Run `npm test` and rebuild the sample deck if layout/PPTX code changed.
4. Do not commit secrets. Do not push unless asked.
5. Summarize the change and suggest a PR title that includes `{issue['identifier']}`.
"""


def main() -> int:
    if len(sys.argv) < 2:
        print("Usage: cursor_prompt.py <LINEAR-ID>", file=sys.stderr)
        print("Example: cursor_prompt.py P2S-12", file=sys.stderr)
        return 1

    api_key = os.environ.get("LINEAR_API_KEY", "").strip()
    if not api_key:
        print("LINEAR_API_KEY is required.", file=sys.stderr)
        return 1

    identifier = sys.argv[1].strip()
    team_id = os.environ.get("LINEAR_TEAM_ID", "").strip()

    try:
        issue = get_issue(identifier, team_id)
        if not issue:
            print(f"Linear issue not found: {identifier}", file=sys.stderr)
            return 1
        print(build_prompt(issue))
        return 0
    except urllib.error.HTTPError as exc:
        print(f"Linear HTTP error: {exc.code} {exc.reason}", file=sys.stderr)
        return 1
    except RuntimeError as exc:
        print(str(exc), file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
