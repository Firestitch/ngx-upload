import { UploadConfig } from './../interfaces';

export function FsUploadConfigInit(config: UploadConfig) {
  return ((): any => {
    config = config || {};
    if (config.upload===undefined) {
      config.upload = true;
    }
    return config;
  })
}