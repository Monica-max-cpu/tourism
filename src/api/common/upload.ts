import { defHttp } from '/@/api/http';

export interface UploadResult {
  urls: string[];
  singleUrl?: string;
}

function toFileArray(files: File | File[] | FileList): File[] {
  if (files instanceof File) return [files];
  return Array.from(files);
}

export function uploadFilesApi(files: File | File[] | FileList, biz = 'b2b/photo'): Promise<UploadResult> {
  const formData = new FormData();
  for (const file of toFileArray(files)) {
    formData.append('file', file);
  }
  if (biz) {
    formData.append('biz', biz);
    formData.append('bizType', biz);
  }
  return defHttp.post<UploadResult>({ url: '/b2b/common/upload', data: formData });
}

export function uploadImageApi(file: File, biz = 'b2b/photo'): Promise<UploadResult> {
  return uploadFilesApi(file, biz);
}
