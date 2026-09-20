import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useCallback, useMemo } from "react";
import { View, Text, Pressable, type PressableStateCallbackType } from "react-native";
import { StyleSheet, withUnistyles } from "react-native-unistyles";
import { ChevronDown, GitBranch, MoreVertical } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Shortcut } from "@/components/ui/shortcut";
import { useShortcutKeys } from "@/hooks/use-shortcut-keys";
import { ICON_SIZE, type Theme } from "@/styles/theme";
import type { ShortcutKey } from "@/utils/format-shortcut";
import type { GitAction, GitActions } from "@/git/policy";
import { useGitActionRunner } from "@/git/use-actions";
import { buttonControlHeight, HEADER_CONTROL_HEIGHT } from "@/components/ui/control-geometry";

interface GitActionsSplitButtonProps {
  gitActions: GitActions;
  hideLabels?: boolean;
  menuOnly?: boolean;
}

const ThemedGitBranch = withUnistyles(GitBranch);
const ThemedChevronDown = withUnistyles(ChevronDown);
const ThemedMoreVertical = withUnistyles(MoreVertical);
const ThemedLoadingSpinner = withUnistyles(LoadingSpinner);

const foregroundColorMapping = (theme: Theme) => ({ color: theme.colors.foreground });
const foregroundMutedColorMapping = (theme: Theme) => ({
  color: theme.colors.foregroundMuted,
});
const foregroundExtraMutedColorMapping = (theme: Theme) => ({
  color: theme.colors.foregroundExtraMuted,
});

interface GitActionMenuItemProps {
  action: GitAction;
  onSelect: (action: GitAction) => void;
  archiveShortcutKeys?: ShortcutKey[][] | null;
  needsSeparator?: boolean;
  showSeparator?: boolean;
  closeOnSelect?: boolean;
}

function GitActionMenuItem({
  action,
  onSelect,
  archiveShortcutKeys,
  needsSeparator,
  showSeparator,
  closeOnSelect,
}: GitActionMenuItemProps) {
  const handleSelect = useCallback(() => onSelect(action), [onSelect, action]);
  const trailing = useMemo(
    () =>
      action.id === "archive-workspace" && archiveShortcutKeys ? (
        <Shortcut chord={archiveShortcutKeys} />
      ) : undefined,
    [action.id, archiveShortcutKeys],
  );
  return (
    <View>
      {needsSeparator && showSeparator ? <DropdownMenuSeparator /> : null}
      <DropdownMenuItem
        testID={
          action.id === "archive-workspace"
            ? "workspace-archive-action"
            : `changes-menu-${action.id}`
        }
        leading={action.icon}
        trailing={trailing}
        disabled={action.disabled}
        muted={Boolean(action.unavailableMessage)}
        status={action.status}
        pendingLabel={action.pendingLabel}
        successLabel={action.successLabel}
        closeOnSelect={closeOnSelect}
        onSelect={handleSelect}
      >
        {action.label}
      </DropdownMenuItem>
    </View>
  );
}

export function GitActionsSplitButton({
  gitActions,
  hideLabels,
  menuOnly = false,
}: GitActionsSplitButtonProps) {
  const { t } = useTranslation();
  const runGitAction = useGitActionRunner();
  const archiveShortcutKeys = useShortcutKeys("archive-workspace");

  const getActionDisplayLabel = useCallback((action: GitAction): string => {
    if (action.status === "pending") return action.pendingLabel;
    if (action.status === "success") return action.successLabel;
    return action.label;
  }, []);

  const handlePrimaryPress = useCallback(() => {
    if (!gitActions.primary) {
      return;
    }
    runGitAction(gitActions.primary);
  }, [gitActions.primary, runGitAction]);

  const overflowMenuButtonStyle = useMemo(() => [styles.iconButton, styles.overflowMenuButton], []);

  const primaryDisabled = gitActions.primary?.disabled;
  const primaryPressableStyle = useCallback(
    ({ hovered, pressed }: PressableStateCallbackType & { hovered?: boolean }) => [
      styles.splitButtonPrimary,
      (Boolean(hovered) || pressed) && styles.splitButtonPrimaryHovered,
      primaryDisabled && styles.splitButtonPrimaryDisabled,
    ],
    [primaryDisabled],
  );

  const caretTriggerStyle = useCallback(
    ({ hovered, pressed, open }: { hovered: boolean; pressed: boolean; open: boolean }) => [
      styles.splitButtonCaret,
      (hovered || pressed || open) && styles.splitButtonCaretHovered,
    ],
    [],
  );

  const menuOnlyTriggerStyle = useCallback(
    ({ hovered, pressed, open }: { hovered: boolean; pressed: boolean; open: boolean }) => [
      styles.menuOnlyTrigger,
      (hovered || pressed || open) && styles.menuOnlyTriggerHovered,
    ],
    [],
  );

  const menuOnlyActions = useMemo(
    () => [
      ...(gitActions.primary ? [gitActions.primary] : []),
      ...gitActions.secondary,
      ...gitActions.menu,
    ],
    [gitActions.menu, gitActions.primary, gitActions.secondary],
  );

  if (menuOnly) {
    if (menuOnlyActions.length === 0) {
      return null;
    }

    return (
      <DropdownMenu>
        <DropdownMenuTrigger
          testID="changes-actions-menu-trigger"
          style={menuOnlyTriggerStyle}
          accessibilityRole="button"
          accessibilityLabel={t("workspace.header.actions.workspaceActions")}
        >
          <ThemedGitBranch size={ICON_SIZE.md} uniProps={foregroundMutedColorMapping} />
          <ThemedChevronDown size={ICON_SIZE.xs} uniProps={foregroundExtraMutedColorMapping} />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" testID="changes-primary-cta-menu">
          {menuOnlyActions.map((action, index) => (
            <GitActionMenuItem
              key={action.id}
              action={action}
              onSelect={runGitAction}
              archiveShortcutKeys={archiveShortcutKeys}
              needsSeparator={action.startsGroup}
              showSeparator={index > 0}
              closeOnSelect={
                action.status === "idle" &&
                action.id === "pr" &&
                action.label === action.pendingLabel &&
                action.label === action.successLabel
              }
            />
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  if (!gitActions.primary && gitActions.secondary.length === 0 && gitActions.menu.length === 0) {
    return null;
  }

  return (
    <View style={styles.row}>
      {gitActions.primary ? (
        <View style={styles.splitButton}>
          <Pressable
            testID="changes-primary-cta"
            style={primaryPressableStyle}
            onPress={handlePrimaryPress}
            disabled={gitActions.primary.disabled}
            accessibilityRole="button"
            accessibilityLabel={gitActions.primary.label}
          >
            {gitActions.primary.status === "pending" ? (
              <ThemedLoadingSpinner
                size="small"
                uniProps={foregroundColorMapping}
                style={styles.splitButtonSpinnerOnly}
              />
            ) : (
              <View style={styles.splitButtonContent}>
                {gitActions.primary.icon}
                {!hideLabels && (
                  <Text style={styles.splitButtonText}>
                    {getActionDisplayLabel(gitActions.primary)}
                  </Text>
                )}
              </View>
            )}
          </Pressable>
          {gitActions.secondary.length > 0 ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                testID="changes-primary-cta-caret"
                style={caretTriggerStyle}
                accessibilityRole="button"
                accessibilityLabel={t("workspace.git.actions.moreOptions")}
              >
                <ThemedChevronDown
                  size={ICON_SIZE.md}
                  uniProps={foregroundExtraMutedColorMapping}
                />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" testID="changes-primary-cta-menu">
                {gitActions.secondary.map((action, index) => (
                  <GitActionMenuItem
                    key={action.id}
                    action={action}
                    onSelect={runGitAction}
                    archiveShortcutKeys={archiveShortcutKeys}
                    needsSeparator={action.startsGroup}
                    showSeparator={index > 0}
                    closeOnSelect={
                      action.status === "idle" &&
                      action.id === "pr" &&
                      action.label === action.pendingLabel &&
                      action.label === action.successLabel
                    }
                  />
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
        </View>
      ) : null}
      {gitActions.menu.length > 0 ? (
        <DropdownMenu>
          <DropdownMenuTrigger
            testID="changes-overflow-menu"
            hitSlop={8}
            style={overflowMenuButtonStyle}
            accessibilityRole="button"
            accessibilityLabel={t("workspace.git.actions.moreActions")}
          >
            <ThemedMoreVertical size={ICON_SIZE.md} uniProps={foregroundMutedColorMapping} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" width={220} testID="changes-overflow-content">
            {gitActions.menu.map((action) => (
              <GitActionMenuItem
                key={action.id}
                action={action}
                onSelect={runGitAction}
                closeOnSelect={false}
              />
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing[1],
    flexShrink: 0,
  },
  splitButton: {
    height: {
      xs: buttonControlHeight.xs,
      md: HEADER_CONTROL_HEIGHT,
    },
    flexDirection: "row",
    alignItems: "stretch",
    borderRadius: theme.borderRadius.md,
    borderWidth: theme.borderWidth[1],
    borderColor: theme.colors.borderAccent,
    overflow: "hidden",
  },
  splitButtonPrimary: {
    paddingHorizontal: {
      xs: theme.spacing[3],
      md: theme.spacing[2],
    },
    justifyContent: "center",
    position: "relative",
  },
  splitButtonPrimaryHovered: {
    backgroundColor: theme.colors.surface2,
  },
  menuOnlyTrigger: {
    width: {
      xs: 48,
      md: 42,
    },
    height: {
      xs: buttonControlHeight.xs,
      md: HEADER_CONTROL_HEIGHT,
    },
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing[1],
    borderRadius: theme.borderRadius.md,
    borderWidth: theme.borderWidth[1],
    borderColor: theme.colors.borderAccent,
  },
  menuOnlyTriggerHovered: {
    backgroundColor: theme.colors.surface2,
  },
  splitButtonPrimaryDisabled: {
    opacity: 0.6,
  },
  splitButtonText: {
    fontSize: theme.fontSize.base,
    lineHeight: theme.fontSize.base * 1.5,
    color: theme.colors.foreground,
    fontWeight: theme.fontWeight.normal,
  },
  splitButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: {
      xs: theme.spacing[2],
      md: theme.spacing[1],
    },
  },
  splitButtonSpinnerOnly: {
    transform: [{ scale: 0.8 }],
  },
  splitButtonCaret: {
    width: {
      xs: buttonControlHeight.xs,
      md: HEADER_CONTROL_HEIGHT,
    },
    alignItems: "center",
    justifyContent: "center",
    borderLeftWidth: theme.borderWidth[1],
    borderLeftColor: theme.colors.borderAccent,
  },
  splitButtonCaretHovered: {
    backgroundColor: theme.colors.surface2,
  },
  iconButton: {
    width: {
      xs: buttonControlHeight.xs,
      md: HEADER_CONTROL_HEIGHT,
    },
    height: {
      xs: buttonControlHeight.xs,
      md: HEADER_CONTROL_HEIGHT,
    },
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.borderRadius.md,
  },
  overflowMenuButton: {
    marginRight: -theme.spacing[2],
  },
}));
