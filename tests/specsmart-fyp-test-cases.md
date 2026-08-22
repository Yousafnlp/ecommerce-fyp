# SpecSmart FYP Test Cases

This file is the project-side source for the test cases referenced in the
FYP report. Backend logic cases marked `Automated` are implemented in
`backend/tests/specsmart-docs.test.js` and
`backend/tests/specsmart-flows.test.js`. UI and full workflow cases marked
`Manual / Integration` are intended for browser/API verification against a
running frontend, backend and MongoDB database.

| Test Case ID | Test Case Name | Functional Requirement(s) | Execution Mode | Project Evidence |
| --- | --- | --- | --- | --- |
| TC-01 | Register Valid Customer Account | FR-01 | Automated + Manual | `backend/tests/specsmart-workflows.test.js`, `components/auth/signup/signup-form.js`, `backend/routes/auth.js`, `backend/models/User.js` |
| TC-02 | Reject Invalid Signup Data | FR-01, FR-16 | Automated + Manual | `backend/tests/specsmart-workflows.test.js`, `backend/utils/signup-validation.js`, `components/auth/signup/signup-form.js` |
| TC-03 | Sign In With Valid and Invalid Credentials | FR-02 | Automated + Manual | `backend/tests/specsmart-workflows.test.js`, `components/auth/signin/signin-form.js`, `store/slices/auth-slice.js`, `backend/routes/auth.js` |
| TC-04 | Restore and End Session | FR-02, FR-03 | Automated + Manual | `backend/tests/specsmart-workflows.test.js`, `backend/middleware/authenticateRefreshToken.js`, `backend/utils/jwt.js` |
| TC-05 | Browse Featured, Popular, Category and Detail Products | FR-04, FR-05 | Automated + Manual | `backend/tests/specsmart-workflows.test.js`, `components/products/**`, `backend/routes/products.js`, `backend/models/Product.js` |
| TC-06 | Search Products With Query and Suggestions | FR-06 | Automated + Manual | `backend/tests/specsmart-docs.test.js`, `backend/services/ProductSearchService.js` |
| TC-07 | Apply Product Filters and Sorting | FR-08 | Automated + Manual | `backend/tests/specsmart-docs.test.js`, `config/sorting.js`, `backend/utils/search/filters.js`, `backend/utils/search/sort.js` |
| TC-08 | Use Voice Search | FR-07 | Manual / Integration | `components/search/use-web-speech-recognition.js`, `components/search/use-whisper-fallback.js`, `app/api/speech-to-text/route.js` |
| TC-09 | Calculate SpecSmart Product Score | FR-09 | Automated | `backend/tests/specsmart-docs.test.js`, `backend/models/Product.js` |
| TC-10 | Toggle Wishlist | FR-10, FR-16 | Automated + Manual | `backend/tests/specsmart-workflows.test.js`, `components/shared/product-card.js`, `backend/routes/users.js`, `backend/models/User.js` |
| TC-11 | Manage Guest and Authenticated Cart | FR-11 | Automated + Manual | `backend/tests/specsmart-docs.test.js`, `store/slices/cart-slice.js`, `backend/routes/users.js` |
| TC-12 | Checkout Authenticated User | FR-12 | Automated + Manual | `backend/tests/specsmart-docs.test.js`, `backend/routes/users.js`, `components/checkout/checkout-page-content.js`, `backend/models/User.js` |
| TC-13 | Checkout Empty or Guest Cart | FR-12 | Automated + Manual | `backend/tests/specsmart-workflows.test.js`, `components/checkout/checkout-page-content.js`, `store/slices/cart-slice.js` |
| TC-14 | View Dashboard Orders and Wishlist | FR-13 | Automated + Manual | `backend/tests/specsmart-workflows.test.js`, `components/dashboard/user-dashboard.js`, `backend/routes/users.js` |
| TC-15 | Restrict Protected Routes | FR-16 | Automated + Manual | `backend/tests/specsmart-docs.test.js`, `backend/middleware/authenticateToken.js`, `backend/middleware/requireAdmin.js` |
| TC-16 | Create Product From Admin Panel | FR-14, FR-16 | Automated + Manual | `backend/tests/specsmart-workflows.test.js`, `components/admin/product-form.js`, `backend/routes/products.js`, `backend/models/Product.js` |
| TC-17 | View Admin Order Summary | FR-15, FR-16 | Automated + Manual | `backend/tests/specsmart-workflows.test.js`, `backend/routes/users.js`, `backend/models/User.js` |
| TC-18 | Compare Products | FR-17 | Automated + Manual | `backend/tests/specsmart-docs.test.js`, `store/slices/compare-slice.js`, `components/shared/comparison-table.js` |
| TC-19 | AI Advisor Chat | FR-18 | Automated + Manual | `backend/tests/specsmart-docs.test.js`, `components/chatbot/chat-bot.jsx`, `backend/routes/chatbot.js` |

## Run Automated Tests

From the project root:

```bash
npm test
```

On Windows PowerShell, if `npm.ps1` is blocked by execution policy, run:

```bash
npm.cmd test
```

The suites are self-contained: they stub the MongoDB collection layer, so no
running database or server is required.
