
import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, value, ...props }, ref) => { // Destructure value from props
    // Base props for the input element
    const inputElementProps: React.InputHTMLAttributes<HTMLInputElement> = {
      type,
      className: cn(
        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      ),
      ref,
      ...props, // Spread other props like onChange, onBlur, name, etc.
    };

    // Conditionally add the value prop for non-file inputs
    if (type !== 'file') {
      // Ensure value is never null or undefined for controlled text-like inputs
      inputElementProps.value = value ?? '';
    }
    // For file inputs, the 'value' prop is not set.
    // React Hook Form handles file inputs through their `onChange` event and internal state.

    return <input {...inputElementProps} />;
  }
)
Input.displayName = "Input"

export { Input }
