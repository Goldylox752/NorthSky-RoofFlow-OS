import Sidebar from "@/components/Sidebar";

export default function RootLayout({ children }) {
  const role = "admin"; // later: from auth

  return (
    <html>
      <body style={styles.body}>
        <Sidebar role={role} />

        <main style={styles.main}>{children}</main>
      </body>
    </html>
  );
}

const styles = {
  body: {
    display: "flex",
    margin: 0,
    fontFamily: "system-ui",
    background: "#0b1220",
    color: "white",
  },
  main: {
    flex: 1,
    padding: 20,
  },
};