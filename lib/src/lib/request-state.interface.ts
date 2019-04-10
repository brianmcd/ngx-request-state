export interface RequestState<T> {
  result: T | null;
  isLoading: boolean;
  error: any;
  retry: () => void;
}
