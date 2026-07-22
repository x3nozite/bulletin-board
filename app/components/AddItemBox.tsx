"use client"

interface Props {
  buttonOnClick: () => void
}

export function AddItemBox({ buttonOnClick }: Props) {
  return (
    <button
      onClick={() => buttonOnClick()}
      className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/30 bg-muted/10  text-muted-foreground transition-all hover:border-foreground hover:bg-muted/20 hover:text-foreground group cursor-pointer"
    >
      <div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      </div>
    </button>
  );
}
