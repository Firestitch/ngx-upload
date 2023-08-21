import { HttpContextToken } from '@angular/common/http';

export const DisplayUploadStatus = new HttpContextToken<boolean>(() => true);
