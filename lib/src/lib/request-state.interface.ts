export interface RequestState<T> {
  result: T | null;
  isLoading: boolean;
  hasError: boolean;
  error: any;
  retry: () => void;
}
