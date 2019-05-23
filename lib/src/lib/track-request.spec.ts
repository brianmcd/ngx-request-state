import { Observable, Subscriber } from 'rxjs';
import { trackRequest } from './track-request';

describe('trackRequest', () => {
  let next: jest.Mock;
  let subscriber: Subscriber<any>;

  beforeEach(() => {
    next = jest.fn().mockName('next');
    new Observable((sub) => {
      subscriber = sub;
    })
      .pipe(trackRequest())
      .subscribe(next);
  });

  it('emits the loading state', () => {
    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith({
      result: null,
      isLoading: true,
      hasError: false,
      error: null,
      retry: expect.any(Function)
    });
  });

  it('emits the success state when the request succeeds', () => {
    next.mockClear();

    subscriber.next('success');
    subscriber.complete();

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith({
      result: 'success',
      isLoading: false,
      hasError: false,
      error: null,
      retry: expect.any(Function)
    });
  });

  describe('errors', () => {
    let error: Error;

    beforeEach(() => {
      next.mockClear();
      error = new Error('oh no');
      subscriber.error(error);
    });

    it('emits the error state', () => {
      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith({
        hasError: true,
        error,
        result: null,
        isLoading: false,
        retry: expect.any(Function)
      });
    });

    it('retries when retry is called', () => {
      const firstSub = subscriber;
      const { retry } = next.mock.calls[0][0];
      next.mockClear();
      retry();

      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith({
        result: null,
        isLoading: true,
        hasError: false,
        error: null,
        retry: expect.any(Function)
      });
      // Make sure the observable is re-subscribed to.
      expect(firstSub).not.toBe(subscriber);
    });

    it('emits success if the request succeeds after retries', () => {
      const { retry } = next.mock.calls[0][0];
      next.mockClear();

      retry();
      retry();
      retry();

      next.mockClear();
      subscriber.next('success');
      subscriber.complete();

      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith({
        result: 'success',
        isLoading: false,
        hasError: false,
        error: null,
        retry: expect.any(Function)
      });
    });
  });
});
