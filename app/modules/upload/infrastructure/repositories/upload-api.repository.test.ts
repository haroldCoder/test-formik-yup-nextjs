import { UploadApiRepository } from './upload-api.repository';
import { SubmitDataEntity } from '../../domain/entities';

global.fetch = jest.fn();

class MockXMLHttpRequest {
    open = jest.fn();
    send = jest.fn();
    abort = jest.fn();
    upload = {
        onprogress: null as any
    };
    onload = null as any;
    onerror = null as any;
    status = 200;
    responseText = '';

    static instances: MockXMLHttpRequest[] = [];

    constructor() {
        MockXMLHttpRequest.instances.push(this);
    }
}

describe('UploadApiRepository', () => {
    let repository: UploadApiRepository;
    let originalXMLHttpRequest: any;

    beforeAll(() => {
        originalXMLHttpRequest = (global as any).XMLHttpRequest;
    });

    afterAll(() => {
        (global as any).XMLHttpRequest = originalXMLHttpRequest;
    });

    beforeEach(() => {
        repository = new UploadApiRepository();
        jest.clearAllMocks();
        MockXMLHttpRequest.instances = [];
        (global as any).XMLHttpRequest = MockXMLHttpRequest;
    });

    describe('upload', () => {
        it('should successfully upload a file and return the result', async () => {
            const mockResponse = { id: '123', url: '/test.png' };
            const file = new File([''], 'test.png');
            const uploadPromise = repository.upload(file);

            const xhrInstance = MockXMLHttpRequest.instances[0];
            expect(xhrInstance).toBeDefined();
            expect(xhrInstance.open).toHaveBeenCalledWith('POST', '/api/upload');

            // Simulate progress callback
            if (xhrInstance.upload.onprogress) {
                xhrInstance.upload.onprogress({
                    lengthComputable: true,
                    loaded: 50,
                    total: 100
                } as any);
            }

            // Simulate load event
            xhrInstance.status = 200;
            xhrInstance.responseText = JSON.stringify(mockResponse);
            xhrInstance.onload();

            const result = await uploadPromise;
            expect(result).toEqual(mockResponse);
        });

        it('should report progress when onProgress is provided', async () => {
            const file = new File([''], 'test.png');
            const onProgress = jest.fn();
            const uploadPromise = repository.upload(file, undefined, onProgress);

            const xhrInstance = MockXMLHttpRequest.instances[0];
            expect(xhrInstance).toBeDefined();

            if (xhrInstance.upload.onprogress) {
                xhrInstance.upload.onprogress({
                    lengthComputable: true,
                    loaded: 50,
                    total: 100
                } as any);
            }

            expect(onProgress).toHaveBeenCalledWith(50);

            // Complete upload
            xhrInstance.status = 200;
            xhrInstance.responseText = JSON.stringify({ id: '123', url: '/test.png' });
            xhrInstance.onload();

            await uploadPromise;
        });

        it('should throw an error if the response is not ok', async () => {
            const file = new File([''], 'test.png');
            const uploadPromise = repository.upload(file);

            const xhrInstance = MockXMLHttpRequest.instances[0];
            xhrInstance.status = 500;
            xhrInstance.responseText = JSON.stringify({ error: 'Failed to upload file' });
            xhrInstance.onload();

            await expect(uploadPromise).rejects.toThrow('Failed to upload file');
        });

        it('should throw an error if the response data is invalid', async () => {
            const file = new File([''], 'test.png');
            const uploadPromise = repository.upload(file);

            const xhrInstance = MockXMLHttpRequest.instances[0];
            xhrInstance.status = 200;
            xhrInstance.responseText = JSON.stringify({ id: '123' }); // missing url
            xhrInstance.onload();

            await expect(uploadPromise).rejects.toThrow('Invalid upload response');
        });
    });

    describe('submit', () => {
        it('should successfully submit data', async () => {
            (global.fetch as jest.Mock).mockResolvedValue({
                ok: true,
            });

            const data: SubmitDataEntity = {
                title: 'Test',
                description: 'Test desc',
                files: []
            };

            const result = await repository.submit(data);

            expect(global.fetch).toHaveBeenCalledTimes(1);
            expect(result).toBe(true);
        });

        it('should throw an error if submit fails', async () => {
            (global.fetch as jest.Mock).mockResolvedValue({
                ok: false,
            });

            const data: SubmitDataEntity = {
                title: 'Test',
                description: 'Test desc',
                files: []
            };

            await expect(repository.submit(data)).rejects.toThrow('Failed to submit data');
        });
    });
});
