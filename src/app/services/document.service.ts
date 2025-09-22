import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * Document interface represents a single document entity.
 */
export interface Document {
  id: number;
  name: string;
  path: string;
  created_at: string;
  body?: string;
  highlighted_content?: string;
}

@Injectable({ providedIn: 'root' })
export class DocumentService {
  /** Base API URL */
  private readonly apiUrl = 'http://localhost:8000/api';

  constructor(private readonly http: HttpClient) {}

  /**
   * Fetch paginated documents.
   * @param page Current page number (default: 1)
   * @param limit Number of documents per page (default: 5)
   */
  list(page: number = 1, limit: number = 5): Observable<Document[]> {
    return this.http.get<Document[]>(`${this.apiUrl}/documents?page=${page}&limit=${limit}`);
  }

  /**
   * Upload a new document.
   * @param file File object to upload
   */
  upload(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('document', file);
    return this.http.post(`${this.apiUrl}/documents`, formData);
  }

  /**
   * Fetch a single document by ID.
   * @param id Document ID
   */
  get(id: number): Observable<Document> {
    return this.http.get<Document>(`${this.apiUrl}/documents/${id}`);
  }

  /**
   * Delete a document by ID.
   * @param id Document ID
   */
  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/documents/${id}`);
  }

  /**
   * Search documents by keyword.
   * @param keyword Search term
   */
  search(keyword: string): Observable<Document[]> {
    return this.http.get<Document[]>(`${this.apiUrl}/search?keyword=${encodeURIComponent(keyword)}`);
  }
}
