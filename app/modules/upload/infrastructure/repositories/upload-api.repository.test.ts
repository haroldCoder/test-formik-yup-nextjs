import { UploadApiRepository } from './upload-api.repository';
import { SubmitDataEntity } from '../../domain/entities';

global.fetch = jest.fn();

describe('UploadApiRepository', () => {
    let repository: UploadApiRepository;

    beforeEach(() => {
        repository = new UploadApiRepository();
        jest.clearAllMocks();
    });

    describe('upload', () => {
        it('should successfully upload a file and return the result', async () => {
            const mockResponse = { id: '123', url: '/test.png' };
            (global.fetch as jest.Mock).mockResolvedValue({
                ok: true,
                json: async () => mockResponse,
            });

            const file = new File([''], 'test.png');
            const result = await repository.upload(file);

            expect(global.fetch).toHaveBeenCalledTimes(1);
            expect(result).toEqual(mockResponse);
        });

        it('should throw an error if the response is not ok', async () => {
            (global.fetch as jest.Mock).mockResolvedValue({
                ok: false,
            });

            const file = new File([''], 'test.png');

            await expect(repository.upload(file)).rejects.toThrow('Failed to upload file');
        });

        it('should throw an error if the response data is invalid', async () => {
            (global.fetch as jest.Mock).mockResolvedValue({
                ok: true,
                json: async () => ({ id: '123' }),
            });

            const file = new File([''], 'test.png');

            await expect(repository.upload(file)).rejects.toThrow('Invalid upload response');
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
