export interface UseMutationOptions {
  onSuccess?: (data: any) => void
  onError?: (error: Error) => void
  onSettled?: () => void
}
