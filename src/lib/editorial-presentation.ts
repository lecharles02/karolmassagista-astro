export function refineEditorialPresentation(html: string, route: string) {
  let output = html.replace(/<footer\b[\s\S]*?<\/footer>/g, footer =>
    footer.replace(/<a\b[^>]*href="https:\/\/wa\.me\/5519983732331[^>]*>[\s\S]*?<\/a>/g, anchor => {
      const number = anchor.match(/\+55\s*19\s*98373-2331/);
      return number ? `<a class="karol-footer-phone" href="tel:+5519983732331">${number[0]}</a>` : anchor;
    })
  );

  if (route !== '/blog/') return output;

  return output.replace(/<main\b[\s\S]*?<\/main>/, main => main
    .replace(/<main\b[^>]*>/, '<main class="karol-blog">')
    .replace(/<div class="max-w-7xl mx-auto px-6 lg:px-8">/, '<div class="karol-blog__shell">')
    .replace(/<header class="mb-20 text-center">/, '<header class="karol-blog__heading">')
    .replace(/<div class="grid md:grid-cols-2 lg:grid-cols-3 gap-10">/, '<div class="karol-blog__grid">')
    .replace(/<article\b[^>]*>/g, '<article class="karol-blog-card">')
    .replace(/<div class="p-10 flex flex-col flex-grow">/g, '<div class="karol-blog-card__body">')
    .replace(/<div class="flex items-center justify-between mb-6">/g, '<div class="karol-blog-card__meta">')
    .replace(/<div class="flex items-center gap-2 text-stone-400[^>]*>/g, '<div class="karol-blog-card__byline">')
    .replace(/<div class="bg-brand\/10[^>]*>/g, '<div class="karol-blog-card__category">')
    .replace(/<div class="pt-8 border-t border-stone-50">/g, '<div class="karol-blog-card__footer">')
    .replace(/(<a href="\/blog\/[^"#]+") class="[^"]*"/g, '$1 class="karol-blog-card__link"')
  );
}
