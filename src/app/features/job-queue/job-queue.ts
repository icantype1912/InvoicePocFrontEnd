import { Component, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DatePipe,JsonPipe } from '@angular/common';

export type JobQueueItem = {
  Id: string;
  JobType: string;
  Payload: string;
  Status: string;
  RetryCount: number;
  CreatedAt: string;
};

export type JobQueueResponse = {
  jobs: JobQueueItem[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

@Component({
  selector: 'app-job-queue',
  standalone: true,
  imports: [DatePipe,JsonPipe],
  templateUrl: './job-queue.html',
  styleUrl: './job-queue.css',
})
export class JobQueue implements OnInit {

  constructor(private http: HttpClient) {}


  jobs = signal<JobQueueItem[]>([]);
  selectedJob = signal<JobQueueItem | null>(null);

  page = signal(1);
  totalPages = signal(1);
  statusFilter = signal<string | null>(null);


  ngOnInit() {
    console.log('JobQueue loaded');
    this.loadJobs();
  }


  loadJobs() {

    let url = `https://localhost:55842/api/Jobs?page=${this.page()}&pageSize=50`;

    if (this.statusFilter()) {
      url += `&status=${this.statusFilter()}`;
    }

    this.http.get<JobQueueResponse>(url).subscribe({
      next: (res) => {
        this.jobs.set(res.jobs);
        this.totalPages.set(res.totalPages);
      },
      error: (err) => {
        console.error('Failed loading jobs', err);
      }
    });
  }


  viewJob(id: string) {
    this.http.get<JobQueueItem>(`https://localhost:5247/api/Jobs/${id}`)
      .subscribe({
        next: (res) => this.selectedJob.set(res),
        error: (err) => console.error('Failed loading job', err)
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
