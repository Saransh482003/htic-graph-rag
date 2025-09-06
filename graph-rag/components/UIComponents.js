import { COLORS, FONTS, SPACING } from '../constants';

export function LoadingSpinner({ size = 24, color = COLORS.primary.orange }) {
  return (
    <div style={{
      ...styles.spinner,
      width: size,
      height: size,
      borderTopColor: color,
    }} />
  );
}

export function MessageStatus({ type, children }) {
  const statusColors = {
    success: COLORS.semantic.success,
    warning: COLORS.semantic.warning,
    error: COLORS.semantic.error,
    info: COLORS.semantic.info,
  };

  return (
    <div style={{
      ...styles.messageStatus,
      backgroundColor: `${statusColors[type]}20`,
      borderLeftColor: statusColors[type],
    }}>
      {children}
    </div>
  );
}

export function QuickAction({ icon, label, onClick, disabled = false }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        ...styles.quickAction,
        ...(disabled ? styles.quickActionDisabled : {})
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.target.style.backgroundColor = COLORS.primary.lightGray;
          e.target.style.transform = 'translateY(-2px)';
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          e.target.style.backgroundColor = COLORS.primary.mediumGray;
          e.target.style.transform = 'translateY(0)';
        }
      }}
    >
      <span style={styles.quickActionIcon}>{icon}</span>
      <span style={styles.quickActionLabel}>{label}</span>
    </button>
  );
}

export function TypingIndicator() {
  return (
    <div style={styles.typingIndicator}>
      <div style={styles.typingDots}>
        <span></span>
        <span></span>
        <span></span>
      </div>
      <span style={styles.typingText}>Medical Assistant is typing...</span>
    </div>
  );
}

const styles = {
  spinner: {
    border: `3px solid ${COLORS.primary.mediumGray}`,
    borderTop: `3px solid ${COLORS.primary.orange}`,
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },

  messageStatus: {
    padding: SPACING.sm,
    borderRadius: '8px',
    borderLeft: '4px solid',
    fontSize: FONTS.sizes.sm,
    marginTop: SPACING.xs,
  },

  quickAction: {
    display: 'flex',
    alignItems: 'center',
    gap: SPACING.sm,
    padding: SPACING.md,
    backgroundColor: COLORS.primary.mediumGray,
    border: 'none',
    borderRadius: '8px',
    color: COLORS.text.primary,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontFamily: 'inherit',
    fontSize: FONTS.sizes.sm,
  },

  quickActionDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },

  quickActionIcon: {
    fontSize: FONTS.sizes.lg,
  },

  quickActionLabel: {
    fontWeight: FONTS.primary.weights.medium,
  },

  typingIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: SPACING.sm,
    padding: SPACING.md,
    color: COLORS.text.muted,
    fontSize: FONTS.sizes.sm,
    fontStyle: 'italic',
  },

  typingDots: {
    display: 'flex',
    gap: '2px',
  },

  typingText: {
    animation: 'fadeInOut 2s infinite',
  },
};