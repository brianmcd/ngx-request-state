import { Subject } from 'rxjs';
import { RequestStateService } from './request-state.service';

describe('RequestStateService', () => {
  let service: RequestStateService;

  beforeEach(() => {
    service = new RequestStateService();
  });

  describe('createRequest', () => {
    let next: jest.Mock;
    let subject: Subject<string>;

    beforeEach(() => {
      next = jest.fn().mockName('next');
      subject = new Subject();
    });

    it('emits the loading state', () => {
      const request = service.createRequest(() => subject);

      request.subscribe(next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith({
        result: null,
        isLoading: true,
        error: null,
        retry: expect.any(Function)
      });
    });

    it('emits the success state when the request succeeds', () => {
      const request = service.createRequest(() => subject);
      request.subscribe(next);
      next.mockClear();

      subject.next('success');

      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith({
        result: 'success',
        isLoading: false,
        error: null,
        retry: expect.any(Function)
      });
    });

    describe('errors', () => {
      let error: Error;

      beforeEach(() => {
        const request = service.createRequest(() => subject);
        request.subscribe(next);
        next.mockClear();
        error = new Error('oh no');
        subject.error(error);
      });

      it('emits the error state', () => {
        expect(next).toHaveBeenCalledTimes(1);
        expect(next).toHaveBeenCalledWith({
          error,
          result: null,
          isLoading: false,
          retry: expect.any(Function)
        });
      });

      it('retries when retry is called', () => {
        const { retry } = next.mock.calls[0][0];
        next.mockClear();

        subject = new Subject();
        retry();

        expect(next).toHaveBeenCalledTimes(1);
        expect(next).toHaveBeenCalledWith({
          result: null,
          isLoading: true,
          error: null,
          retry: expect.any(Function)
        });
      });

      it('emits success if the request succeeds after retries', () => {
        const { retry } = next.mock.calls[0][0];
        next.mockClear();

        subject = new Subject();
        retry();
        subject = new Subject();
        retry();
        subject = new Subject();
        retry();

        next.mockClear();

        subject.next('success');
        subject.complete();

        expect(next).toHaveBeenCalledTimes(1);
        expect(next).toHaveBeenCalledWith({
          result: 'success',
          isLoading: false,
          error: null,
          retry: expect.any(Function)
        });
      });
    });
  });
});
