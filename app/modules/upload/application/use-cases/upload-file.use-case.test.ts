import { UploadFilesUseCase } from './upload-file.use-case';
import { UploadRepository } from '../../domain/repositories';

describe('UploadFilesUseCase', () => {
    let mockRepo: jest.Mocked<UploadRepository>;
    let useCase: UploadFilesUseCase;

    beforeEach(() => {
        mockRepo = {
            upload: jest.fn(),
            submit: jest.fn(),
        } as unknown as jest.Mocked<UploadRepository>;

        useCase = new UploadFilesUseCase(mockRepo);
    });

    it('should call the repository upload method with the given file', async () => {
        const file = new File(['dummy content'], 'test.png', { type: 'image/png' });
        const abortController = new AbortController();
        
        mockRepo.upload.mockResolvedValue({ id: '123', url: '/uploads/test.png' });

        const result = await useCase.execute(file, abortController.signal);

        expect(mockRepo.upload).toHaveBeenCalledTimes(1);
        expect(mockRepo.upload).toHaveBeenCalledWith(file, abortController.signal, undefined);
        expect(result).toEqual({ id: '123', url: '/uploads/test.png' });
    });

    it('should throw an error if the repository fails', async () => {
        const file = new File([''], 'test.png');
        
        mockRepo.upload.mockRejectedValue(new Error('Network error'));

        await expect(useCase.execute(file)).rejects.toThrow('Network error');
    });
});
