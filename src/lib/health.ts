// Platform detection + health data connection for web / iOS / Android shells.

export type Platform = "ios" | "android" | "web";

export interface HealthProvider {
  platform: Platform;
  /** User-facing name of the health store on this device. */
  name: string;
  /** True when a native bridge is present that can actually grant access. */
  native: boolean;
}

export interface HealthConnectResult {
  connected: boolean;
  provider: HealthProvider;
  /** Set when the connection could not be completed. */
  reason?: string;
  /** Values pulled from the health store, when available. */
  weightKg?: number;
  heightCm?: number;
}

export function detectPlatform(): Platform {
  if (typeof navigator === "undefined") return "web";
  const ua = navigator.userAgent || "";
  const iOSLike =
    /iPad|iPhone|iPod/.test(ua) ||
    (/Macintosh/.test(ua) && typeof document !== "undefined" && "ontouchend" in document);
  if (iOSLike) return "ios";
  if (/Android/i.test(ua)) return "android";
  return "web";
}

export function getHealthProvider(): HealthProvider {
  const platform = detectPlatform();
  const native =
    typeof window !== "undefined" &&
    Boolean((window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor?.isNativePlatform?.());
  const name =
    platform === "ios" ? "Apple Health" : platform === "android" ? "Health Connect" : "Health data";
  return { platform, name, native };
}

interface NativeHealthBridge {
  requestAuthorization?: () => Promise<boolean>;
  readProfile?: () => Promise<{ weightKg?: number; heightCm?: number }>;
}

function nativeBridge(): NativeHealthBridge | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SipSyncHealth?: NativeHealthBridge };
  return w.SipSyncHealth ?? null;
}

/**
 * Attempts to connect to the device health store.
 * On a native shell (Capacitor/WebView with the SipSyncHealth bridge) this requests
 * real permissions. In a plain browser there is no Apple Health / Health Connect API,
 * so we fail gracefully and let the user continue with manual entry.
 */
export async function connectHealth(): Promise<HealthConnectResult> {
  const provider = getHealthProvider();
  const bridge = nativeBridge();

  if (bridge?.requestAuthorization) {
    try {
      const granted = await bridge.requestAuthorization();
      if (!granted) {
        return { connected: false, provider, reason: `${provider.name} access was denied.` };
      }
      const profile = (await bridge.readProfile?.()) ?? {};
      return { connected: true, provider, ...profile };
    } catch {
      return { connected: false, provider, reason: `Couldn't reach ${provider.name}.` };
    }
  }

  return {
    connected: false,
    provider,
    reason:
      provider.platform === "web"
        ? "Health syncing needs the SipSync app on iPhone or Android. Enter your details manually for now."
        : `${provider.name} isn't available in the browser. Install SipSync from the App Store or Play Store to sync automatically.`,
  };
}
