/** A heading split into hand-picked lines, each in its own mask so it can rise into place. */
export function Lines({ lines }: { lines: readonly string[] }) {
  return (
    <>
      <span className="sr-only">{lines.join(' ')}</span>
      {lines.map((line) => (
        <span className="line" key={line} aria-hidden="true">
          <span className="line-in">{line}</span>
        </span>
      ))}
    </>
  );
}
