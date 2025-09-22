# Solution Overview

## Architecture

- **Backend:** Vanilla PHP with simple routing in `index.php`, using a `DocumentController` and `Document` model.
- **Frontend:** Angular 20 standalone component (`AppComponent`) with Angular Material UI.

## Key Decisions

1. **Standalone Angular component:** Simplifies the setup and avoids the overhead of modules.
2. **Angular Material:** Provides a clean, responsive interface without writing complex CSS.
3. **Backend simplicity:** Using plain PHP without frameworks allowed faster setup and full control.
4. **File content indexing:** Added `body` field for uploaded files to enable search and highlighting.

## Trade-offs

- No authentication implemented due to time constraints.
- Pagination is client-driven, assuming small datasets.
- Upload validation is minimal (only basic file checks).

## Interesting Implementations

- Expired cache files are removed before any new search.
- Debounced search with highlighting.
- PDF content extraction using `smalot/pdfparser`.
- Colorful UI with small, rounded buttons and table-based layout.
- Responsive design using Angular Material Grid/Table and CSS media queries
