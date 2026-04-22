// Mermaid 다이어그램 초기화 (MkDocs Material에서 자동 처리되지만 fallback)
document$.subscribe(function() {
  if (typeof mermaid !== 'undefined') {
    mermaid.initialize({
      startOnLoad: false,
      theme: document.body.getAttribute('data-md-color-scheme') === 'slate' ? 'dark' : 'default',
      themeVariables: {
        primaryColor: '#1A1A35',
        primaryTextColor: '#fff',
        primaryBorderColor: '#2B4FE8',
        lineColor: '#2B4FE8',
        secondaryColor: '#E8EFF9',
        tertiaryColor: '#f5f5f5'
      }
    });
  }
});
