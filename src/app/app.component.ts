import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DocumentService, Document } from './services/document.service';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatListModule,
    MatTableModule,
    MatSnackBarModule,
    MatTooltipModule
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  documents: Document[] = [];
  selectedDoc?: Document;
  searchKeyword = '';
  selectedFile?: File;
  uploading = false;
  loading = false;
  errorMessage = '';

  // Pagination
  currentPage = 1;
  pageLimit = 5;

  // Search
  searchSubject = new Subject<string>();
  searchTime = 0;
  resultCount = 0;

  constructor(private docService: DocumentService, private snackBar: MatSnackBar) {
    this.loadDocuments();

    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(keyword => this.performSearch(keyword));
  }

  /* ---------------- Pagination ---------------- */
  nextPage() {
    this.currentPage++;
    this.loadDocuments();
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadDocuments();
    }
  }

  /* ---------------- Load Documents ---------------- */
  loadDocuments() {
    this.setLoading();
    this.docService.list(this.currentPage, this.pageLimit).subscribe({
      next: res => {
        this.documents = res;
        this.loading = false;
      },
      error: err => this.handleError('Failed to load documents.', err)
    });
  }

  /* ---------------- File Selection ---------------- */
  onFileDropped(event: DragEvent) {
    event.preventDefault();
    const file = event.dataTransfer?.files[0];
    if (file) this.selectedFile = file;
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) this.selectedFile = file;
  }

  /* ---------------- Manual Upload ---------------- */
  uploadSelectedFile() {
    if (!this.selectedFile) {
      this.snackBar.open('❌ Please select a file first.', 'Close', { duration: 3000 });
      return;
    }

    const allowedExtensions = ['txt', 'pdf'];
    const fileExt = this.selectedFile.name.split('.').pop()?.toLowerCase();

    if (!fileExt || !allowedExtensions.includes(fileExt)) {
      this.snackBar.open('❌ Only TXT or PDF files are allowed.', 'Close', { duration: 4000 });
      return;
    }

    this.uploading = true;
    this.errorMessage = '';
    this.docService.upload(this.selectedFile).subscribe({
      next: () => {
        this.handleSuccess('Document uploaded successfully!');
        this.selectedFile = undefined; // reset selection
      },
      error: err => this.handleError('Upload failed. Invalid Document', err, true)
    });
  }

  /* ---------------- Delete Document ---------------- */
  deleteDoc(id: number) {
    if (!confirm("Are you sure you want to delete this document?")) return;

    this.docService.delete(id).subscribe({
      next: () => this.handleSuccess('Document deleted successfully!'),
      error: err => this.handleError('Failed to delete document.', err, true)
    });
  }

  /* ---------------- View Document ---------------- */
  viewDoc(id: number) {
    this.docService.get(id).subscribe({
      next: doc => this.selectedDoc = doc,
      error: err => this.handleError('Failed to load document details.', err)
    });
  }

  /* ---------------- Search ---------------- */
  onSearchInput() {
    this.searchSubject.next(this.searchKeyword);
  }

  private performSearch(keyword: string) {
    const start = performance.now();
    this.setLoading();

    if (!keyword.trim()) {
      this.clearSearch();
      return;
    }

    this.docService.search(keyword).subscribe({
      next: docs => {
        this.documents = docs;
        this.resultCount = docs.length;
        this.searchTime = performance.now() - start;
        this.loading = false;
        this.selectedDoc = docs[0] ?? undefined;
      },
      error: err => this.handleError('Search failed.', err)
    });
  }

  /* ---------------- Helper Methods ---------------- */
  private setLoading() {
    this.loading = true;
    this.errorMessage = '';
  }

  private clearSearch() {
    this.loadDocuments();
    this.resultCount = 0;
    this.searchTime = 0;
    this.selectedDoc = undefined;
  }

  private handleSuccess(message: string) {
    this.uploading = false;
    this.loading = false;
    this.loadDocuments();
    this.snackBar.open(`✅ ${message}`, 'Close', { duration: 5000 });
  }

  private handleError(userMessage: string, error: any, isUploadOrDelete = false) {
    console.error(error);
    this.errorMessage = userMessage;
    this.uploading = isUploadOrDelete ? false : this.uploading;
    this.loading = false;
    this.snackBar.open(`❌ ${userMessage}`, 'Close', { duration: 5000 });
  }
}
