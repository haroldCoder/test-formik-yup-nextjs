import { FileDescriptorEntity } from './file-descriptor.entity';
import { MAX_FILE_SIZE } from '../constants';

describe('FileDescriptorEntity', () => {
    it('should create an entity if size is within limits', () => {
        const entity = new FileDescriptorEntity({
            id: '1',
            name: 'test.jpg',
            size: MAX_FILE_SIZE - 100,
            type: 'image/jpeg',
            status: 'uploading',
            progress: 0,
        });

        expect(entity.id).toBe('1');
        expect(entity.name).toBe('test.jpg');
        expect(entity.isValidFormatSize()).toBe(true);
    });

    it('should throw an error if size exceeds maximum limit', () => {
        expect(() => {
            new FileDescriptorEntity({
                id: '2',
                name: 'huge-file.zip',
                size: MAX_FILE_SIZE + 1000,
                type: 'application/zip',
                status: 'uploading',
                progress: 0,
            });
        }).toThrow('File exceeds max size');
    });

    it('should update progress if currently uploading', () => {
        let entity = new FileDescriptorEntity({
            id: '3',
            name: 'doc.pdf',
            size: 1024,
            type: 'application/pdf',
            status: 'uploading',
            progress: 10,
        });

        entity = entity.updateProgress(50);
        expect(entity.progress).toBe(50);
    });

    it('should not update progress if bounded over 100', () => {
        let entity = new FileDescriptorEntity({
            id: '4',
            name: 'doc.pdf',
            size: 1024,
            type: 'application/pdf',
            status: 'uploading',
            progress: 10,
        });

        entity = entity.updateProgress(150);
        expect(entity.progress).toBe(100);
    });
});
