// We'll implement a simple toast notification system
type ToastType = {
  variant?: 'default' | 'destructive'
  title?: string
  description?: string
}

let toastCallback: ((toast: ToastType) => void) | null = null

export const useToast = () => {
  const toast = (options: ToastType) => {
    if (toastCallback) {
      toastCallback(options)
    }
  }

  return { toast }
}

export const setToastCallback = (callback: (toast: ToastType) => void) => {
  toastCallback = callback
}
