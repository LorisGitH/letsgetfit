import { useId, type TextareaHTMLAttributes } from 'react';
import { describedBy } from './describedBy';

interface TextAreaFieldProps extends Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  'id' | 'value' | 'onChange'
> {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string | undefined;
}

export function TextAreaField({
  label,
  value,
  onChange,
  error,
  ...props
}: TextAreaFieldProps) {
  const id = useId();
  const errorId = `${id}-error`;

  return (
    <div className="field">
      <label className="field__label" htmlFor={id}>
        {label}
      </label>
      <textarea
        {...props}
        id={id}
        className="field__input field__input--multiline"
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
        }}
        aria-invalid={error === undefined ? undefined : true}
        aria-describedby={describedBy(error !== undefined && errorId)}
      />
      {error !== undefined && (
        <p id={errorId} className="field__error">
          {error}
        </p>
      )}
    </div>
  );
}
