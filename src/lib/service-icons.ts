const paths: Record<string, string> = {
  "Massagem Tântrica": '<path d="M12 20c-5-3-7-8-5-13 3 1 5 4 5 7 0-3 2-6 5-7 2 5 0 10-5 13Z"/><path d="M7 12c-2-2-4-2-5-2 0 7 4 10 10 10s10-3 10-10c-1 0-3 0-5 2"/>',
  "Massagem Nuru": '<path d="M12 3s-7 8-7 12a7 7 0 0 0 14 0c0-4-7-12-7-12Z"/><path d="M8 15a4 4 0 0 0 4 4"/>',
  "Massagem Sensual": '<path d="m12 20-8-8C-2 6 6 1 12 7c6-6 14-1 8 5l-8 8Z"/>',
  "Massagem Quatro Mãos": '<path d="M3 12V7a2 2 0 0 1 4 0v4l1-1a2 2 0 0 1 3 3l-4 5H3v-6ZM21 12V7a2 2 0 0 0-4 0v4l-1-1a2 2 0 0 0-3 3l4 5h4v-6ZM3 18v3h4v-3M17 18v3h4v-3"/>',
  "Vivência Mútua": '<path d="M12 12c-3-5-9-5-9 0s6 5 9 0 9-5 9 0-6 5-9 0Z"/>',
  "Nuru Mix": '<path d="M3 7c3-4 6 4 9 0s6 4 9 0M3 12c3-4 6 4 9 0s6 4 9 0M3 17c3-4 6 4 9 0s6 4 9 0"/>',
};

export function serviceIcon(name: string) {
  return `<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]}</svg>`;
}
