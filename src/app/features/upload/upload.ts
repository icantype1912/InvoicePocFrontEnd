import { Component, signal } from '@angular/core';
import { HttpClient, HttpEventType } from '@angular/common/http';

type UploadStatus = 'pending' | 'uploading' | 'done';

@Component({
  selector: 'app-upload',
  standalone: true,
  templateUrl: './upload.html',
  styleUrl: './upload.css',
})
export class Upload {

  constructor(private http: HttpClient) {}

  isDragOver = false;

  files: {
    file: File;
    progress: ReturnType<typeof signal<number>>;
    status: ReturnType<typeof signal<UploadStatus>>;
  }[] = [];

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;

    if (!event.dataTransfer) return;

    Array.from(event.dataTransfer.files).forEach(file => {
      this.addFile(file);
    });
  }

  onFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;

    Array.from(input.files).forEach(file => {
      this.addFile(file);
    });

    input.value = '';
  }

  private addFile(file: File) {
    const item = {
      file,
      progress: signal(0),
      status: signal<UploadStatus>('pending'),
    };

    this.files.push(item);
    this.startUpload(item);
  }

  startUpload(item: {
    file: File;
    progress: ReturnType<typeof signal<number>>;
    status: ReturnType<typeof signal<UploadStatus>>;
  }) {

    item.status.set('uploading');

    const formData = new FormData();
    formData.append('file', item.file);

    this.http.post(
      'https://localhost:55842/api/VendorInvoices/upload',
      formData,
      {
        reportProgress: true,
        observe: 'events'
      }
    ).subscribe({
      next: (event) => {

        if (event.type === HttpEventType.UploadProgress && event.total) {
          const percent = Math.round((event.loaded / event.total) * 100);
          item.progress.set(percent);
        }

        if (event.type === HttpEventType.Response) {
          item.progress.set(100);
          item.status.set('done');
        }
      },
      error: () => {
        item.status.set('pending');
      }
    });
  }
}
