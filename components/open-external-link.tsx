"use client";

import type { AnchorHTMLAttributes, MouseEvent, ReactNode } from "react";

type OpenExternalLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "onClick"> & {
  children: ReactNode;
  href: string;
};

export function openExternalUrl(url: string) {
  window.open(url, "_blank", "noopener,noreferrer");
}

export function OpenExternalLink({ children, href, ...props }: OpenExternalLinkProps) {
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    openExternalUrl(href);
  }

  return (
    <a href={href} onClick={handleClick} rel="noopener noreferrer" target="_blank" {...props}>
      {children}
    </a>
  );
}
