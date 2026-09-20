import { useCallback, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Pressable } from "react-native";
import { router } from "expo-router";
import { StyleSheet, withUnistyles } from "react-native-unistyles";
import { ArrowLeft } from "lucide-react-native";
import { ScreenHeader } from "./screen-header";
import { ScreenTitle } from "./screen-title";
import { ICON_SIZE, type Theme } from "@/styles/theme";

interface BackHeaderProps {
  title?: string;
  titleAccessory?: ReactNode;
  rightContent?: ReactNode;
  onBack?: () => void;
}

function goBack(): void {
  router.back();
}

const ThemedArrowLeft = withUnistyles(ArrowLeft);

const foregroundMutedColorMapping = (theme: Theme) => ({
  color: theme.colors.foregroundMuted,
});

export function BackHeader({ title, titleAccessory, rightContent, onBack }: BackHeaderProps) {
  const { t } = useTranslation();
  const handleBack = useCallback(() => {
    if (onBack) {
      onBack();
      return;
    }
    goBack();
  }, [onBack]);

  return (
    <ScreenHeader
      left={
        <>
          <Pressable
            onPress={handleBack}
            style={styles.backButton}
            accessibilityRole="button"
            accessibilityLabel={t("common.actions.back")}
          >
            <ThemedArrowLeft size={ICON_SIZE.lg} uniProps={foregroundMutedColorMapping} />
          </Pressable>
          {title && <ScreenTitle>{title}</ScreenTitle>}
          {titleAccessory}
        </>
      }
      right={rightContent}
      leftStyle={styles.left}
    />
  );
}

const styles = StyleSheet.create((theme) => ({
  left: {
    gap: theme.spacing[2],
  },
  backButton: {
    padding: {
      xs: theme.spacing[3],
      md: theme.spacing[2],
    },
    borderRadius: theme.borderRadius.lg,
  },
}));
