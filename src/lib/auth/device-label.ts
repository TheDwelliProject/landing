type Browser = "Chrome" | "Safari" | "Firefox" | "Edge" | "Opera" | "Other";
type OS = "macOS" | "Windows" | "Linux" | "iOS" | "iPadOS" | "Android" | "Other";

function detectBrowser(ua: string): Browser {
  if (/\bEdg\//.test(ua)) return "Edge";
  if (/\bOPR\/|\bOpera\//.test(ua)) return "Opera";
  if (/\bFirefox\//.test(ua)) return "Firefox";
  if (/\bChrome\//.test(ua) && !/\bEdg\/|\bOPR\//.test(ua)) return "Chrome";
  if (/\bSafari\//.test(ua) && !/\bChrome\//.test(ua)) return "Safari";
  return "Other";
}

function detectOS(ua: string): OS {
  if (/\bWindows\b/.test(ua)) return "Windows";
  if (/\bAndroid\b/.test(ua)) return "Android";
  if (/\biPad\b/.test(ua)) return "iPadOS";
  if (/\biPhone\b|\biPod\b/.test(ua)) return "iOS";
  if (/\bMac OS X\b|\bMacintosh\b/.test(ua)) return "macOS";
  if (/\bLinux\b|\bX11\b/.test(ua)) return "Linux";
  return "Other";
}

export function deriveDeviceLabel(userAgent: string | null | undefined): string {
  if (!userAgent) return "Web";
  const browser = detectBrowser(userAgent);
  const os = detectOS(userAgent);
  if (browser === "Other" && os === "Other") return "Web";
  if (browser === "Other") return `Web on ${os}`;
  if (os === "Other") return browser;
  return `${browser} on ${os}`;
}
