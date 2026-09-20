import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react-native";
import { type ReactNode, useMemo } from "react";
import { Text, View } from "react-native";
import { StyleSheet, withUnistyles } from "react-native-unistyles";
import { ICON_SIZE, type Theme } from "@/styles/theme";

export type AlertVariant = "default" | "info" | "success" | "warning" | "error";

export interface AlertProps {
  title?: string;
  description?: ReactNode;
  variant?: AlertVariant;
  icon?: ReactNode;
  children?: ReactNode;
  testID?: string;
}

const ThemedAlertInfo = withUnistyles(Info);
const ThemedAlertSuccess = withUnistyles(CheckCircle2);
const ThemedAlertWarning = withUnistyles(AlertTriangle);
const ThemedAlertError = withUnistyles(XCircle);

const VARIANT_ICON = {
  info: ThemedAlertInfo,
  success: ThemedAlertSuccess,
  warning: ThemedAlertWarning,
  error: ThemedAlertError,
};

const infoColorMapping = (theme: Theme) => ({ color: theme.colors.palette.blue[300] });
const successColorMapping = (theme: Theme) => ({ color: theme.colors.statusSuccess });
const warningColorMapping = (theme: Theme) => ({ color: theme.colors.palette.amber[500] });
const errorColorMapping = (theme: Theme) => ({ color: theme.colors.destructive });

const VARIANT_ICON_COLOR_MAPPING = {
  info: infoColorMapping,
  success: successColorMapping,
  warning: warningColorMapping,
  error: errorColorMapping,
};

export function Alert({
  title,
  description,
  variant = "default",
  icon,
  children,
  testID,
}: AlertProps) {
  const containerStyle = useMemo(() => {
    switch (variant) {
      case "info":
        return [styles.container, styles.containerInfo];
      case "warning":
        return [styles.container, styles.containerWarning];
      case "error":
        return [styles.container, styles.containerError];
      default:
        return [styles.container];
    }
  }, [variant]);

  const titleStyle = useMemo(() => {
    switch (variant) {
      case "info":
        return [styles.title, styles.titleInfo];
      case "success":
        return [styles.title, styles.titleSuccess];
      case "warning":
        return [styles.title, styles.titleWarning];
      case "error":
        return [styles.title, styles.titleError];
      default:
        return [styles.title];
    }
  }, [variant]);

  const resolvedIcon = useMemo(() => {
    if (icon !== undefined) return icon;
    if (variant === "default") return null;
    const ThemedIcon = VARIANT_ICON[variant];
    return <ThemedIcon size={ICON_SIZE.sm} uniProps={VARIANT_ICON_COLOR_MAPPING[variant]} />;
  }, [icon, variant]);

  const hasDescription = description != null && description !== "";

  return (
    <View style={containerStyle} testID={testID} accessibilityRole="alert">
      {resolvedIcon ? <View style={styles.iconSlot}>{resolvedIcon}</View> : null}
      <View style={styles.body}>
        {title ? <Text style={titleStyle}>{title}</Text> : null}
        {hasDescription && typeof description === "string" ? (
          <Text style={styles.description}>{description}</Text>
        ) : null}
        {hasDescription && typeof description !== "string" ? (
          <View style={styles.descriptionSlot}>{description}</View>
        ) : null}
        {children ? <View style={styles.actions}>{children}</View> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: theme.spacing[3],
    borderWidth: theme.borderWidth[1],
    borderColor: theme.colors.border,
    backgroundColor: "transparent",
    borderRadius: theme.borderRadius.xl,
    paddingVertical: theme.spacing[3],
    paddingHorizontal: theme.spacing[4],
  },
  containerInfo: {
    borderColor: theme.colors.palette.blue[300],
  },
  containerWarning: {
    borderColor: theme.colors.palette.amber[500],
  },
  containerError: {
    borderColor: theme.colors.destructive,
  },
  iconSlot: {
    paddingTop: 2,
  },
  body: {
    flex: 1,
    minWidth: 0,
    gap: theme.spacing[1],
  },
  title: {
    color: theme.colors.foreground,
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.medium,
  },
  titleInfo: {
    color: theme.colors.palette.blue[300],
  },
  titleSuccess: {
    color: theme.colors.statusSuccess,
  },
  titleWarning: {
    color: theme.colors.palette.amber[500],
  },
  titleError: {
    color: theme.colors.destructive,
  },
  description: {
    color: theme.colors.foregroundMuted,
    fontSize: theme.fontSize.sm,
  },
  descriptionSlot: {
    flexShrink: 1,
    minWidth: 0,
    gap: theme.spacing[2],
  },
  actions: {
    flexDirection: "row",
    gap: theme.spacing[2],
    marginTop: theme.spacing[2],
  },
}));
