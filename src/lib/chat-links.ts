export function parseSharedChatLink(value: string): { url: string; hostname: string } | null {
  try {
    const url = new URL(value);
    if (
      !['http:', 'https:'].includes(url.protocol) ||
      !url.hostname ||
      url.username ||
      url.password
    )
      return null;
    return { url: url.href, hostname: url.hostname };
  } catch {
    return null;
  }
}
