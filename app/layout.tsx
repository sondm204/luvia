import type { Metadata } from "next";
import "./globals.scss";

export const metadata: Metadata = {
  title: "Lưu bút — Album của chúng mình",
  description: "Một cuốn album tương tác lưu giữ những kỷ niệm đáng nhớ.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return <html lang="vi"><body>{children}</body></html>;
}
