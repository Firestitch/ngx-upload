import { UploadConfig } from './../interfaces/upload-config';

export function FsUploadConfigInit(config: UploadConfig) {
  return ((): any => {
    config = config || {};
    if (config.upload === undefined) {
      config.upload = true;
    }
    return config;
  })
}
