export function SiteFooter() {
  return (
    <footer className="border-t border-gray-800 mt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 text-xs text-gray-600 flex flex-wrap gap-x-6 gap-y-2 justify-between">
        <span>
          Demo Mode — all data on this site is simulated client-side. Nothing here touches Ritual
          Chain.
        </span>
        <span className="flex gap-4">
          <a
            href="https://docs.ritualfoundation.org/"
            target="_blank"
            rel="noreferrer"
            className="hover:text-gray-400"
          >
            Ritual Docs ↗
          </a>
          <a
            href="https://explorer.ritualfoundation.org"
            target="_blank"
            rel="noreferrer"
            className="hover:text-gray-400"
          >
            Explorer ↗
          </a>
        </span>
      </div>
    </footer>
  );
}
