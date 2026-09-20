import type { ReactNode } from "react";
import type { ViewProps } from "react-native";
import { BlurView, type BlurTint } from "expo-blur";
import { StyleSheet, withUnistyles } from "react-native-unistyles";
import type { Theme } from "@/styles/theme";

const ThemedBlurView = withUnistyles(BlurView);

const glassTintMapping = (theme: Theme): { tint: BlurTint } => ({
  tint: theme.colorScheme === "dark" ? "dark" : "light",
});

interface GlassSurfaceProps extends ViewProps {
  children?: ReactNode;
  intensity?: number;
}

/**
 * Frosted-glass background layer for content that scrolls behind chrome.
 * Real blur where the platform supports it cheaply; on Android expo-blur
 * renders its translucent fallback by default — the experimental native blur
 * method stays off for perf reasons. Hairline top edge everywhere.
 *
 * Background only: pointer events pass through by default so inputs above
 * keep working. Keep the count low — every glass layer re-samples the
 * backdrop behind it.
 */
export function GlassSurface({
  children,
  intensity = 30,
  style,
  pointerEvents = "none",
  ...props
}: GlassSurfaceProps) {
  return (
    <ThemedBlurView
      intensity={intensity}
      uniProps={glassTintMapping}
      style={[styles.glass, style]}
      pointerEvents={pointerEvents}
      {...props}
    >
      {children}
    </ThemedBlurView>
  );
}

const styles = StyleSheet.create((theme) => ({
  glass: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
}));
