import { ScrollViewStyleReset, useServerDocumentContext } from 'expo-router/html';

// Só roda na versão web, na hora do build estático (Node, sem DOM).
export default function Root({ children }: { children: React.ReactNode }) {
  const { bodyAttributes, bodyNodes, htmlAttributes, headNodes } = useServerDocumentContext();

  return (
    <html lang="pt-BR" {...htmlAttributes}>
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        {/*
          interactive-widget=resizes-content: com o teclado aberto, o navegador encolhe a página
          em vez de só cobri-la, e o flex do chat reposiciona a lista e a barra de digitar.
          ponytail: o Safari do iPhone ignora isso; se precisar lá, ouvir window.visualViewport.
        */}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no, interactive-widget=resizes-content"
        />
        <ScrollViewStyleReset />
        {headNodes}
      </head>
      <body {...bodyAttributes}>
        {children}
        {bodyNodes}
      </body>
    </html>
  );
}
