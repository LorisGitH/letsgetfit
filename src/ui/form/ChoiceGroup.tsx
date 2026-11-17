import { useId } from 'react';
import { describedBy } from './describedBy';

export interface Choice<Value> {
  value: Value;
  label: string;
  hint?: string;
}

interface ChoiceGroupProps<Value extends string | number> {
  legend: string;
  /** Radio buttons pick one value; checkboxes pick any number. */
  type: 'radio' | 'checkbox';
  choices: readonly Choice<Value>[];
  selected: readonly Value[];
  onToggle: (value: Value) => void;
  hint?: string;
  error?: string | undefined;
}

export function ChoiceGroup<Value extends string | number>({
  legend,
  type,
  choices,
  selected,
  onToggle,
  hint,
  error,
}: ChoiceGroupProps<Value>) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;

  return (
    <fieldset
      className="choice-group"
      aria-describedby={describedBy(
        hint !== undefined && hintId,
        error !== undefined && errorId,
      )}
      aria-invalid={error === undefined ? undefined : true}
    >
      <legend className="field__label">{legend}</legend>
      {hint !== undefined && (
        <p id={hintId} className="field__hint">
          {hint}
        </p>
      )}
      <div className="choice-group__choices">
        {choices.map((choice) => (
          <label key={choice.value} className="choice">
            <input
              type={type}
              name={id}
              value={choice.value}
              checked={selected.includes(choice.value)}
              onChange={() => {
                onToggle(choice.value);
              }}
            />
            <span className="choice__text">
              <span className="choice__label">{choice.label}</span>
              {choice.hint !== undefined && (
                <span className="choice__hint">{choice.hint}</span>
              )}
            </span>
          </label>
        ))}
      </div>
      {error !== undefined && (
        <p id={errorId} className="field__error">
          {error}
        </p>
      )}
    </fieldset>
  );
}
