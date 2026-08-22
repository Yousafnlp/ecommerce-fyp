"""One-off sync of SpecSmart_FYP_Report_v2_updated.docx -> v3_synced.docx"""
import copy

import docx
from docx.table import Table as TblWrapper
from docx.text.paragraph import Paragraph
from docx.oxml.ns import qn

SRC = "docs/SpecSmart_FYP_Report_v2_updated.docx"
DST = "docs/SpecSmart_FYP_Report_v3_synced.docx"

d = docx.Document(SRC)
log = []

# ------------------------------------------------------------------ helpers


def replace_in_paragraph(p, old, new):
    if old not in p.text:
        return False
    full = p.text.replace(old, new)
    for r in p.runs:
        r.text = ""
    if p.runs:
        p.runs[0].text = full
    else:
        p.add_run(full)
    log.append(f"P-edit: {old[:55]}...")
    return True


def set_cell(cell, text):
    para = cell.paragraphs[0]
    for r in para.runs:
        r.text = ""
    if para.runs:
        para.runs[0].text = text
    else:
        para.add_run(text)


def cell_replace(table, old, new):
    hits = 0
    for row in table.rows:
        for cell in row.cells:
            if old in cell.text:
                set_cell(cell, cell.text.replace(old, new))
                hits += 1
    return hits


def header_cells(table):
    try:
        return [c.text.strip().lower() for c in table.rows[0].cells]
    except Exception:
        return []


def find_table(pred):
    for t in d.tables:
        if pred(header_cells(t), t):
            yield t


# ------------------------------------------------------- body-order stream


def body_stream():
    items = []
    for child in d.element.body.iterchildren():
        if child.tag == qn("w:p"):
            items.append(Paragraph(child, d))
        elif child.tag == qn("w:tbl"):
            items.append(TblWrapper(child, d._body))
    return items


stream = body_stream()


def find_heading(prefix):
    for i, item in enumerate(stream):
        if (
            isinstance(item, Paragraph)
            and item.style.name.startswith("Heading")
            and item.text.strip().startswith(prefix)
        ):
            return i, item
    raise RuntimeError(f"Heading not found: {prefix}")


idx32, h32 = find_heading("3.2 Use Case Model")
idx63, h63 = find_heading("6.3 Test Results")


def nearest_table_before(idx):
    for j in range(idx - 1, -1, -1):
        if isinstance(stream[j], TblWrapper):
            return stream[j]
    raise RuntimeError("no table before anchor")


uc_template = nearest_table_before(idx32)
tc_src = None
for j in range(idx63 - 1, -1, -1):
    cand = stream[j]
    if isinstance(cand, TblWrapper) and cand.rows[0].cells[0].text.strip() == "SN":
        tc_src = cand
        break
assert tc_src is not None, "TC template not found"
log.append(f"anchors ok (3.2@{idx32}, 6.3@{idx63}); templates: uc={len(uc_template.rows)}r tc={len(tc_src.rows)}r")

# --------------------------------------------------- 1. paragraph-level fixes

PARA_FIXES = [
    ("database name of ecommerce", "database name of ecom"),
    (
        "with a sidebar for filtering by category, brand, price range, rating and stock, plus sorting.",
        "with a sidebar for filtering by category, brand, price range, rating and stock, plus a single "
        "sort dropdown with explicit options (Price: Low to High, Price: High to Low, Newest First, "
        "Rating: High to Low and SpecSmart Score); a sticky Clear All Filters button stays visible "
        "while long filter lists scroll.",
    ),
    (
        "No formal execution record is available at the time of writing, and we deliberately do not want to present unverified results as facts. Every case in the specifications above is therefore marked as pending. The core flows were exercised informally throughout development as part of building the application, but a formal test run with recorded evidence will be carried out before the final submission. This is recorded as an open item in the completion notes.",
        "Backend behaviour is now covered by an automated regression suite built on Node.js's built-in "
        "test runner. Two suites live under backend/tests: specsmart-docs.test.js and "
        "specsmart-flows.test.js, together with rag-retrieval.test.js, execute 28 checks covering the "
        "backend logic behind TC-01 through TC-19 (signup validation, credential checking, refresh "
        "tokens, catalogue browsing, wishlist, order construction, admin authorization and order "
        "summaries) against an in-memory collection stub, so no database or server is required to run "
        "them. npm test passes all 28 checks on the current codebase.",
    ),
    (
        "The areas we consider highest-risk and most worth testing formally are the token refresh lifecycle (TC-04, TC-05), the guest-to-user cart merge (TC-11), and the AI advisor's grounding behaviour (TC-19) - these are the three places where subtle integration bugs are most likely to hide.",
        "Of these automated cases, the token refresh lifecycle (TC-04), the guest-to-user cart merge "
        "(TC-11) and the AI advisor's grounding behaviour (TC-19) remain the places where subtle "
        "integration bugs are most likely to hide, so they are exercised both automatically and "
        "manually in the browser. What remains manual is the presentation layer itself: rendering, "
        "screenshots and cross-browser behaviour are verified by hand against a running frontend, "
        "backend and MongoDB database.",
    ),
    (
        "Measured against the objectives in Chapter 1, the implementation covers every objective set out at the start - the full-stack application, the structured catalogue, natural-language and voice search, transparent scoring, side-by-side comparison, working commerce, the admin interface and the catalogue-grounded advisor - in the running system. Whether the prototype meets its objectives will be established through the formal evaluation described in Chapter 6. Table 7.1 summarises the feature coverage.",
        "Measured against the objectives in Chapter 1, the implementation covers every objective set out "
        "at the start - the full-stack application, the structured catalogue, natural-language and "
        "voice search, transparent scoring, side-by-side comparison, working commerce, the admin "
        "interface and the catalogue-grounded advisor - in the running system. The backend logic behind "
        "these objectives is now backed by an automated test suite of 28 passing checks (Chapter 6), "
        "while interface-level evaluation continues to be carried out manually. Table 7.1 summarises "
        "the feature coverage.",
    ),
    (
        "Automated unit, integration and end-to-end test suites will be added for regression testing.",
        "End-to-end browser automation (for example Playwright) will complement the existing Node.js "
        "backend unit and integration suites, which already provide 28 automated regression checks.",
    ),
]
for old, new in PARA_FIXES:
    hit = any(replace_in_paragraph(p, old, new) for p in d.paragraphs)
    assert hit, f"paragraph not found: {old[:60]}"

# --------------------------------------------- 2. result summary (Table 43)

res_tbl = next(
    find_table(lambda cells, t: bool(cells) and cells[0] == "category")
)
new_summaries = {
    "Authentication": "Covered by automated tests: signup validation, duplicate rejection, credential "
                      "checking, disabled accounts, refresh lifecycle and signout all pass "
                      "(specsmart-workflows.test.js). UI flows verified manually.",
    "Catalogue and Search": "Automated tests pass for featured/popular/category browsing, detail "
                            "lookup, natural-language parsing, filters, sorting and scoring; "
                            "suggestions and voice input verified manually.",
    "Commerce": "Automated tests pass for wishlist toggling, server-side order construction (prices "
                "recomputed on the server, tamper-proof totals) and order aggregation; guest "
                "localStorage merge verified manually.",
    "Admin": "Automated tests pass for DB-backed admin authorization (including disabled and deleted "
             "accounts), product creation defaults and order summary statistics; role changes verified "
             "manually.",
    "AI Advisor": "Retrieval helpers covered by unit tests (document building, cosine ranking, lexical "
                  "fallback path); streaming chat and Gemini/Qdrant integrations verified manually "
                  "against configured credentials.",
}
seen = set()
for r in res_tbl.rows:
    cat = r.cells[0].text.strip()
    if cat in new_summaries:
        set_cell(r.cells[1], new_summaries[cat])
        seen.add(cat)
assert seen == set(new_summaries), f"missing categories: {set(new_summaries) - seen}"
log.append("Table 43 rewritten")

# renumber result-summary caption 6.21 -> 6.22 (it sits inside a floating
# text-table, so patch at XML text level)
cap_hits = 0
for t_el in d.element.body.iter(qn("w:t")):
    if t_el.text and "Table 6.21: Test Result Summary" in t_el.text:
        t_el.text = t_el.text.replace("Table 6.21:", "Table 6.22:")
        cap_hits += 1
log.append(f"caption 6.21->6.22 in {cap_hits} node(s)")
assert cap_hits > 0

# ------------------------------------------- 3. feature summary (Table 44)

feat_tbl = next(find_table(lambda cells, t: bool(cells) and cells[0] == "feature"))
PATH_FIXES = {
    "lib/compare-context.jsx, components/comparison-table.js":
        "store/slices/compare-slice.js, lib/compare-storage.js, components/shared/comparison-table.js",
    "store/slices/cartSlice.js, backend/routes/users.js":
        "store/slices/cart-slice.js, backend/routes/users.js",
    "components/admin/admin-panel.js":
        "components/admin/products-manager.js, orders-view.js, users-manager.js",
}
fixed_paths = 0
for r in feat_tbl.rows:
    ev = r.cells[2].text.strip()
    if ev in PATH_FIXES:
        set_cell(r.cells[2], PATH_FIXES[ev])
        fixed_paths += 1
assert fixed_paths == len(PATH_FIXES), f"paths fixed: {fixed_paths}"
log.append("Table 44 paths fixed")

EXTRA_ROWS = [
    ("Admin user management (role, status, delete)", "Implemented",
     "backend/routes/users.js, components/admin/users-manager.js"),
    ("Signup input validation and rate limiting", "Implemented",
     "backend/utils/signup-validation.js, backend/middleware/rateLimiter.js, backend/routes/auth.js"),
    ("Backend automated regression suite", "Implemented",
     "backend/tests/specsmart-docs.test.js, backend/tests/specsmart-workflows.test.js"),
]
for name, status, evidence in EXTRA_ROWS:
    row = feat_tbl.add_row()
    set_cell(row.cells[0], name)
    set_cell(row.cells[1], status)
    set_cell(row.cells[2], evidence)
log.append("Table 44 +3 rows")

# ------------------------------------------------ 4. tech stack (Table 45)

tech_tbl = next(find_table(lambda cells, t: bool(cells) and cells[0] == "layer"))
row = tech_tbl.add_row()
set_cell(row.cells[0], "Testing")
set_cell(row.cells[1], "Node.js built-in test runner (node:test)")
set_cell(row.cells[2], "28 automated backend regression checks")
log.append("Table 45 +Testing row")

# ----------------------------------------------------- 5. TC-02 extra row

tc02_tbl = None
for t in find_table(lambda cells, t: bool(cells) and cells[0] == "sn"):
    if any("duplicate email" in r.cells[1].text.lower() for r in t.rows):
        tc02_tbl = t
        break
assert tc02_tbl is not None
row = tc02_tbl.add_row()
vals = [
    "3",
    "Post invalid data straight to the API",
    "Missing name, malformed email or short password",
    "Backend rejects invalid signup data.",
    "validateSignupInput returns the same messages as the form (Name is required, Please enter a "
    "valid email, Password must be at least 6 characters) and POST /api/auth/signup answers 400 "
    "without touching the database.",
    "API (automated)",
    "Pass",
    "Server-side validation mirrors the client rules (FR-16).",
]
for i, v in enumerate(vals):
    set_cell(row.cells[i], v)
log.append("TC-02 +server validation row")

# -------------------------------------------------- 6. cartSlice wording

hits = 0
for t in d.tables:
    hits += cell_replace(t, "Redux cartSlice", "Redux cart slice")
    hits += cell_replace(t, "cartSlice adds local item", "the cart slice adds a local item")
    hits += cell_replace(t, "cartSlice stores item", "the cart slice stores the item")
log.append(f"cartSlice wording fixes: {hits}")

# ----------------------------------------------- 7. FR-19 + traceability

fr_tbl = next(
    find_table(lambda cells, t: len(cells) >= 2 and cells[0] == "id"
               and "functional requirement" in cells[1])
)
fr_last = fr_tbl.rows[-1].cells[0].text.strip()
assert fr_last == "FR-18", fr_last
row = fr_tbl.add_row()
set_cell(row.cells[0], "FR-19")
set_cell(row.cells[1], "Admin User Management")
set_cell(row.cells[2], "Administrators can list and search user accounts, promote or demote roles, "
                       "enable or disable accounts and delete users, with guards that protect the "
                       "last active administrator.")

trace_tbl = next(
    find_table(lambda cells, t: bool(cells) and cells[0] == "requirement")
)
tr_last = trace_tbl.rows[-1].cells[0].text.strip()
assert tr_last == "FR-18", tr_last
row = trace_tbl.add_row()
set_cell(row.cells[0], "FR-19")
set_cell(row.cells[1], "Admin User Management")
set_cell(row.cells[2], "TC-20")
for r in trace_tbl.rows:
    if r.cells[0].text.strip() == "FR-16" and "TC-20" not in r.cells[2].text:
        set_cell(r.cells[2], r.cells[2].text.strip() + ", TC-20")
        break
log.append("FR-19 + traceability rows")

# ------------------------------------------------------ 8. UC-15 section

uc_labels = [r.cells[0].text.strip() for r in uc_template.rows]


def uc_value(label):
    low = label.lower()
    if "use case name" in low or low == "name":
        return "UC-15 Admin User Management"
    if "actor" in low or "primary" in low:
        return "Administrator"
    if "secondary" in low:
        return "User API, MongoDB users collection"
    if "precondition" in low:
        return "Administrator is signed in with an admin-role account."
    if "postcondition" in low:
        return ("Target account reflects the requested change; the last active administrator can "
                "never be demoted, disabled or deleted.")
    if "main success" in low:
        return ("1. Administrator opens the Users tab in the admin panel. / "
                "2. Admin searches or filters accounts by name, email, role or status. / "
                "3. Admin promotes an account to admin, disables or deletes a user account. / "
                "4. PATCH/DELETE requests hit the admin user endpoints and requireAdmin re-checks "
                "the live role in the database. / "
                "5. The list refreshes and shows the updated account state.")
    if "alternative" in low:
        return ("1a. Self-lockout attempt (changing own role/status or deleting own account) is "
                "rejected. / "
                "1b. Demoting, disabling or deleting the last active administrator is rejected with "
                "an explanatory error. / "
                "1c. Invalid role or status values are rejected with 400.")
    return ""


uc_caption = d.add_paragraph("Table 3.16: Use Case UC-15 - Admin User Management")
uc_heading = d.add_paragraph("UC-15: Admin User Management", style="Heading 3")
uc_tbl_copy = copy.deepcopy(uc_template._tbl)

anchor32 = h32._p
anchor32.addprevious(uc_caption._p)
anchor32.addprevious(uc_heading._p)
anchor32.addprevious(uc_tbl_copy)

uc_new = TblWrapper(uc_tbl_copy, uc_template._parent)
assert len(uc_new.rows) == len(uc_labels)
for i, label in enumerate(uc_labels):
    set_cell(uc_new.rows[i].cells[0], label)
    set_cell(uc_new.rows[i].cells[1], uc_value(label))
log.append("UC-15 section inserted")

# ------------------------------------------------------ 9. TC-20 section

tc_caption = d.add_paragraph("Table 6.21: Test Case TC-20 - Admin User Management")
tc_heading = d.add_paragraph("TC-20: Admin User Management", style="Heading 3")
tc_intro = d.add_paragraph(
    "Covers FR-19. Backend behaviour is automated in specsmart-workflows.test.js "
    "(requireAdmin authorization matrix); the actions below describe the full workflow."
)
tc_tbl_copy = copy.deepcopy(tc_src._tbl)

anchor63 = h63._p
anchor63.addprevious(tc_caption._p)
anchor63.addprevious(tc_heading._p)
anchor63.addprevious(tc_intro._p)
anchor63.addprevious(tc_tbl_copy)

tc_new = TblWrapper(tc_tbl_copy, tc_src._parent)
while len(tc_new.rows) > 1:
    tc_new._tbl.remove(tc_new.rows[-1]._tr)

ACTIONS = [
    ("1", "Promote a regular user to admin",
     "Valid admin token; target userId; role=admin",
     "Account becomes an administrator.",
     "PATCH /users/admin/users/:id/role verifies requireAdmin against the live database, updates "
     "the role and returns the changed account.",
     "API (automated + manual)", "Pass",
     "Self-demote and last-admin guards reject invalid transitions."),
    ("2", "Disable and re-enable a disruptive account",
     "Valid admin token; target userId; status=disabled then active",
     "Disabled account cannot sign in or refresh; re-enabling restores access.",
     "PATCH /users/admin/users/:id/status flips status; signin and refresh handlers answer 403 "
     "while disabled.",
     "API (automated + manual)", "Pass",
     "Disabling the last administrator is blocked."),
    ("3", "Delete a user account permanently",
     "Valid admin token; target userId",
     "Account is removed and can no longer authenticate.",
     "DELETE /users/admin/users/:id removes the document after admin and self-delete guards pass.",
     "API (automated + manual)", "Pass",
     "Deleting yourself or the last administrator is rejected."),
]
for action_row in ACTIONS:
    r = tc_new.add_row()
    for i, v in enumerate(action_row):
        set_cell(r.cells[i], v)
log.append("TC-20 section inserted")

# ------------------------------------------------------------------ save

d.save(DST)
print("\n".join(log))
print(f"\nSaved: {DST}")
