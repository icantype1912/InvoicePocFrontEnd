import { Component, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DatePipe, JsonPipe } from '@angular/common';
import { environment } from '../../../environments/environment';

export enum JobStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  INVALID = 'INVALID',
  FAILED = 'FAILED'
}

export type JobQueueItem = {
  id: string;
  jobType: string;
  status: JobStatus;
  retryCount: number;
  lockedBy: string;
  lockedAt: string;
  nextRetryAt: string;
  createdAt: string;
  updatedAt: string;
  payloadJson: string;
  errorMessage: string;
};

export type JobQueueResponse = {
  jobs: JobQueueItem[];
  page: number;
  pageSize: number;
  total: number;
};

@Component({
  selector: 'app-job-queue',
  standalone: true,
  imports: [DatePipe, JsonPipe],
  templateUrl: './job-queue.html',
  styleUrl: './job-queue.css',
})
export class JobQueue implements OnInit {

  constructor(private http: HttpClient) {}

  JobStatus = JobStatus;

  jobs = signal<JobQueueItem[]>([]);
  selectedJob = signal<JobQueueItem | null>(null);

  page = signal(1);
  totalPages = signal(1);
  statusFilter = signal<string | null>(null);

  ngOnInit() {
    this.loadJobs();
  }

  loadJobs() {
    let url = `${environment.apiUrl}/Jobs?page=${this.page()}&pageSize=50`;

    if (this.statusFilter()) {
      url += `&status=${this.statusFilter()}`;
    }

    this.http.get<JobQueueResponse>(url).subscribe({
      next: (res) => {
        this.jobs.set(res.jobs);
        this.totalPages.set(Math.ceil(res.total / res.pageSize) || 1);
      },
      error: (err) => console.error('Failed loading jobs', err)
    });
  }

  viewJob(id: string) {
    this.http.get<JobQueueItem>(`${environment.apiUrl}/Jobs/${id}`)
      .subscribe({
        next: (res) => this.selectedJob.set(res),
        error: (err) => console.error('Failed loading job', err)
      });
  }

  requeueJob(id: string) {
    this.http.post(`${environment.apiUrl}/Jobs/${id}/requeue`, {})
      .subscribe({
        next: () => {
          this.loadJobs();
          if (this.selectedJob()?.id === id) {
            this.viewJob(id);
            this.loadJobs();
          }
        },
        error: (err) => console.error('Failed to requeue job', err)
      });
  }

  nextPage() {
    if (this.page() < this.totalPages()) {
      this.page.update(p => p + 1);
      this.loadJobs();
    }
  }

  prevPage() {
    if (this.page() > 1) {
      this.page.update(p => p - 1);
      this.loadJobs();
    }
  }

  setStatus(status: string | null) {
    this.statusFilter.set(status);
    this.page.set(1);
    this.loadJobs();
  }
}
