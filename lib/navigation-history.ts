const RETURN_PATH_PREFIX = "worldcup:return-to:";

export function saveReturnPath(currentPath: string, returnPath: string) {
  if (typeof window === "undefined" || !currentPath || currentPath === returnPath) {
    return;
  }

  sessionStorage.setItem(`${RETURN_PATH_PREFIX}${currentPath}`, returnPath);
}

export function getReturnPath(currentPath: string): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return sessionStorage.getItem(`${RETURN_PATH_PREFIX}${currentPath}`);
}

export function getCurrentPath(): string {
  if (typeof window === "undefined") {
    return "/";
  }

  return `${window.location.pathname}${window.location.search}`;
}
