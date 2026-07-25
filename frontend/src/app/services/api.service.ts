import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AiReportRequest {
  userNotes: string;
  templateContent?: object | null;
  reportId?: string | null;
}

export interface AiReportResponse {
  message: string;
  transformedContent: object;
  report?: object;
}

export interface AuthResponse {
  token: string;
  user: { id: string; name: string; email: string };
}

export interface DbTemplate {
  id: string;
  title: string;
  type?: string;
  category?: string;
  description?: string;
  content?: any;
  is_custom?: boolean;
  created_at?: string;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  // Base URL — change to your production URL when deploying
  private readonly baseUrl = 'http://localhost:5000/api';

  /** AI Style Transfer: generate a report from notes + template */
  generateAIReport(payload: AiReportRequest): Observable<AiReportResponse> {
    return this.http.post<AiReportResponse>(`${this.baseUrl}/reports/generate`, payload);
  }

  /** Upload audio file and get a structured Tiptap report back */
  uploadAudio(file: File, workspaceId?: string): Observable<{ reportId: string; content: object }> {
    const form = new FormData();
    form.append('audio', file, file.name);
    if (workspaceId) form.append('workspaceId', workspaceId);
    return this.http.post<{ reportId: string; content: object }>(`${this.baseUrl}/reports/audio`, form);
  }

  /** Upload internship activity photo/notes and generate report section via Vision AI */
  uploadActivityImage(file: File): Observable<{ imageUrl: string; filename: string; htmlContent: string; tiptapContent: object }> {
    const form = new FormData();
    form.append('image', file, file.name);
    return this.http.post<{ imageUrl: string; filename: string; htmlContent: string; tiptapContent: object }>(`${this.baseUrl}/reports/image`, form);
  }

  /** Export a report to PowerPoint — returns a Blob for download */
  exportPptx(content: object, title: string): Observable<Blob> {
    return this.http.post(
      `${this.baseUrl}/reports/export/pptx`,
      { content, title },
      { responseType: 'blob' },
    );
  }

  /** Upload a document (.docx, .pdf, .txt, .md) as a custom template */
  uploadTemplateDocument(file: File, title: string, category: string, description: string): Observable<{ message: string; template: DbTemplate }> {
    const form = new FormData();
    form.append('document', file, file.name);
    form.append('title', title);
    form.append('category', category);
    form.append('description', description);
    return this.http.post<{ message: string; template: DbTemplate }>(`${this.baseUrl}/templates/upload`, form);
  }

  /** Get all templates from the database */
  getTemplates(): Observable<DbTemplate[]> {
    return this.http.get<DbTemplate[]>(`${this.baseUrl}/templates`);
  }

  /** Delete a custom template */
  deleteTemplate(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/templates/${id}`);
  }

  /** Auth – login */
  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/login`, { email, password });
  }

  /** Auth – register */
  register(name: string, email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/register`, { name, email, password });
  }

  /** Get all reports belonging to the current user */
  getUserReports(): Observable<object[]> {
    const token = localStorage.getItem('rh_token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.get<object[]>(`${this.baseUrl}/reports/me`, { headers });
  }
}
