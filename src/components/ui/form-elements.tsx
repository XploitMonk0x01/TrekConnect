export const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => {
  return (
    <input
      {...props}
      className={`w-full px-3 py-2 border rounded-md ${props.className || ''}`}
    />
  )
}

export const Label = ({
  children,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) => {
  return (
    <label
      {...props}
      className={`block mb-1 font-medium ${props.className || ''}`}
    >
      {children}
    </label>
  )
}

export const Button = ({
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  return (
    <button
      {...props}
      className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 ${
        props.className || ''
      }`}
    >
      {children}
    </button>
  )
}

export const Textarea = (
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement>
) => {
  return (
    <textarea
      {...props}
      className={`w-full px-3 py-2 border rounded-md ${props.className || ''}`}
    />
  )
}

export const Select = ({
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) => {
  return (
    <select
      {...props}
      className={`w-full px-3 py-2 border rounded-md ${props.className || ''}`}
    >
      {children}
    </select>
  )
}
