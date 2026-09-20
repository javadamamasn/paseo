import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import {
  AGENT_LIFECYCLE_STATUSES,
  type AgentLifecycleStatus,
} from "@getpaseo/protocol/agent-lifecycle";
import { deriveSidebarStateBucket, type SidebarStateBucket } from "@/utils/sidebar-agent-state";
import { getStatusDotColor } from "@/utils/status-dot-color";
import { STATUS_INDICATOR_FILLED_DOT_SIZE } from "@/utils/status-indicator-geometry";

export function AgentStatusDot({
  status,
  requiresAttention,
  attentionReason,
  pendingPermissionCount,
  showInactive = false,
}: {
  status: string | null | undefined;
  requiresAttention: boolean | null | undefined;
  attentionReason?: "finished" | "error" | "permission" | null;
  pendingPermissionCount?: number;
  showInactive?: boolean;
}) {
  if (!status) {
    return null;
  }
  if (!isAgentLifecycleStatus(status)) {
    return null;
  }

  const bucket = deriveSidebarStateBucket({
    status,
    requiresAttention: Boolean(requiresAttention),
    attentionReason: attentionReason ?? null,
    pendingPermissionCount: pendingPermissionCount ?? 0,
  });
  const dotStyle = getDotStyle(bucket, showInactive);

  if (!dotStyle) {
    return null;
  }

  return <View style={dotStyle} />;
}

function getDotStyle(bucket: SidebarStateBucket, showInactive: boolean) {
  switch (bucket) {
    case "needs_input":
      return styles.dotNeedsInput;
    case "failed":
      return styles.dotFailed;
    case "running":
      return styles.dotRunning;
    case "attention":
      return styles.dotAttention;
    case "done":
      return showInactive ? styles.dotDoneInactive : null;
    default:
      return null;
  }
}

function isAgentLifecycleStatus(value: string): value is AgentLifecycleStatus {
  return AGENT_LIFECYCLE_STATUSES.some((status) => status === value);
}

const styles = StyleSheet.create((theme) => {
  // One variant per bucket, resolved through the single bucket-to-color map so the
  // dot can't drift from the status rings and badges (see project-leading-visual.tsx).
  const dot = (bucket: SidebarStateBucket, showDoneAsInactive = false) =>
    ({
      width: STATUS_INDICATOR_FILLED_DOT_SIZE,
      height: STATUS_INDICATOR_FILLED_DOT_SIZE,
      borderRadius: theme.borderRadius.full,
      backgroundColor: getStatusDotColor({ theme, bucket, showDoneAsInactive }) ?? undefined,
    }) as const;

  return {
    dotNeedsInput: dot("needs_input"),
    dotFailed: dot("failed"),
    dotRunning: dot("running"),
    dotAttention: dot("attention"),
    dotDoneInactive: dot("done", true),
  };
});
