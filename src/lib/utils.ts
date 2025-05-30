import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function prepareHtmlForClipboard(html: string) {
  // Remove extra paragraph breaks and normalize whitespace
  const cleanHtml = html
    .replace(/<p>&nbsp;<\/p>/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  // Create a temporary div to extract plain text
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = cleanHtml;
  const plainText = tempDiv.textContent || tempDiv.innerText || '';

  return {
    html: cleanHtml,
    text: plainText
  };
}
