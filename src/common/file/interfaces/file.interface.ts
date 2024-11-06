import { Multer } from 'multer';

export type IFile = Multer.File;

export type IFileExtract<T = Record<string, any>> = IFile & {
    extract: Record<string, any>[];
    dto?: T[];
};
