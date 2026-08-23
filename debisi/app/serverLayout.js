export const metadata = {
    title: "Debisi NG",
    description: "Get listed, Get Seen",
    themeColor: "#D22730",
  };
  
  export default function ServerLayout({ children }) {
    return (
      <html>
        <body>
          <RootLayout>{children}</RootLayout>
        </body>
      </html>
    );
  }
  
  import RootLayout from './layout';