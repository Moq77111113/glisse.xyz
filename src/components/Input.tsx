export function DigitInput(props: any) {
  const {
    index,
    value = "",
    onInput,
    onKeyDown,
    className = "",
    ...rest
  } = props;
  return (
    <input
      data-pin-index={index}
      type="text"
      inputMode="numeric"
      value={value}
      maxLength={1}
      onInput={onInput}
      onKeyDown={onKeyDown}
      className={
        className ||
        "w-16 h-20 md:w-20 md:h-24 font-mono text-3xl md:text-4xl text-center bg-card border-2 border-border text-foreground tabular-nums focus:outline-none focus:border-primary focus:bg-secondary/30 transition-colors"
      }
      {...rest}
    />
  );
}
