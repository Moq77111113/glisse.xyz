import { DigitInput } from "./Input";

export function PinInputs(props: any) {
  const {
    values = ["", "", "", ""],
    onInput,
    onKeyDown,
    inputRefs,
    className = "",
  } = props;
  return (
    <div
      className={`flex gap-3 ${className}`}
      data-pin-container
      onPaste={props.onPaste}
    >
      {values.map((v: string, i: number) => (
        <DigitInput
          key={i}
          index={i}
          value={v}
          onInput={(e: Event) => onInput && onInput(i, e)}
          onKeyDown={(e: KeyboardEvent) => onKeyDown && onKeyDown(i, e)}
          ref={(el: HTMLInputElement | null) => {
            if (inputRefs && Array.isArray(inputRefs.current))
              inputRefs.current[i] = el;
          }}
        />
      ))}
    </div>
  );
}
