import { FileValidations } from './files-validations';
import { UploadItem } from '../types';

describe('FileValidations', () => {
    describe('validateFilesNotRepeat', () => {
        it('should return empty array when there are no duplicate files', () => {
            const files: UploadItem[] = [
                { id: '1', name: 'file1.png', size: 0, type: 'image/png', file: new File([''], 'file1.png'), status: 'idle', retryCount: 0 },
                { id: '2', name: 'file2.png', size: 0, type: 'image/png', file: new File([''], 'file2.png'), status: 'idle', retryCount: 0 },
            ];

            const result = FileValidations.validateFilesNotRepeat(files);
            expect(result).toEqual([]);
        });

        it('should return ids of duplicate files (matching name and size)', () => {
            const files: UploadItem[] = [
                { id: '1', name: 'file1.png', size: 0, type: 'image/png', file: new File([''], 'file1.png'), status: 'idle', retryCount: 0 },
                { id: '2', name: 'file1.png', size: 0, type: 'image/png', file: new File([''], 'file1.png'), status: 'idle', retryCount: 0 }, // Duplicado
                { id: '3', name: 'file2.png', size: 0, type: 'image/png', file: new File([''], 'file2.png'), status: 'idle', retryCount: 0 },
                { id: '4', name: 'file1.png', size: 0, type: 'image/png', file: new File([''], 'file1.png'), status: 'idle', retryCount: 0 }, // Duplicado
            ];

            const result = FileValidations.validateFilesNotRepeat(files);
            expect(result).toEqual(['2', '4']);
        });

        it('should not mark files as duplicates if size differs but name matches', () => {
            const fileA = new File(['123'], 'file1.png');
            Object.defineProperty(fileA, 'size', { value: 100 });

            const fileB = new File(['123'], 'file1.png');
            Object.defineProperty(fileB, 'size', { value: 200 });

            const files: UploadItem[] = [
                { id: '1', name: 'file1.png', size: 100, type: 'image/png', file: fileA, status: 'idle', retryCount: 0 },
                { id: '2', name: 'file1.png', size: 200, type: 'image/png', file: fileB, status: 'idle', retryCount: 0 },
            ];

            const result = FileValidations.validateFilesNotRepeat(files);
            expect(result).toEqual([]);
        });
    });
});
