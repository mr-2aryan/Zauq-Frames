import { alpha, createTheme } from '@mui/material/styles';
import { color, font, glass, grain, mesh, motion, radius, shadow, transition } from './design/tokens.js';

const tinted = (theme, key) => {
  const main = theme.palette[key]?.main ?? color.inkMuted;
  const dark = theme.palette[key]?.dark ?? color.ink;
  return { main, dark };
};

/** The admin's theme: Zauq's colours as frosted glass. Tokens live in design/tokens.js. */
export const theme = createTheme({
  palette: {
    primary: { main: color.olive700, dark: color.olive800, light: color.olive500, contrastText: '#ffffff' },
    secondary: { main: color.terracotta, dark: color.terracottaDark, contrastText: '#ffffff' },
    success: { main: color.success, dark: '#3b5e1f' },
    warning: { main: '#d9962b', dark: color.warning },
    error: { main: color.error, dark: '#8f3220' },
    info: { main: color.info, dark: '#2c5068' },
    background: { default: color.canvas, paper: '#fbfaf6' },
    text: { primary: color.ink, secondary: color.inkMuted, disabled: 'rgba(28,31,23,.38)' },
    divider: color.line,
    action: { hover: 'rgba(62,74,31,.06)', selected: 'rgba(62,74,31,.1)', focus: 'rgba(62,74,31,.12)' },
  },
  shape: { borderRadius: radius.sm },
  typography: {
    fontFamily: font.body,
    h1: { fontFamily: font.display, fontWeight: 800, fontSize: '1.85rem', lineHeight: 1.15, letterSpacing: '-0.025em' },
    h2: { fontFamily: font.display, fontWeight: 800, fontSize: '1.35rem', lineHeight: 1.2, letterSpacing: '-0.015em' },
    h3: { fontWeight: 750, fontSize: '1.05rem', letterSpacing: '-0.005em' },
    h4: { fontWeight: 750, fontSize: '0.98rem' },
    body1: { fontSize: '0.95rem', lineHeight: 1.55 },
    body2: { fontSize: '0.875rem', lineHeight: 1.5 },
    caption: { fontSize: '0.78rem', lineHeight: 1.45 },
    overline: { fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.14em', lineHeight: 1.6 },
    button: { textTransform: 'none', fontWeight: 700, letterSpacing: 0 },
  },
  transitions: { easing: { easeInOut: motion.ease, easeOut: motion.ease } },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        html: { backgroundColor: color.canvas, scrollBehavior: 'smooth' },
        body: {
          backgroundColor: 'transparent',
          minHeight: '100dvh',
          fontFeatureSettings: '"ss01"',
          WebkitFontSmoothing: 'antialiased',
          '&::before, &::after': { content: '""', position: 'fixed', inset: 0, zIndex: -1, pointerEvents: 'none' },
          '&::before': { background: `${mesh}, ${color.canvas}` },
          '&::after': { backgroundImage: grain, opacity: 0.22, mixBlendMode: 'multiply' },
        },
        '::selection': { backgroundColor: alpha(color.olive700, 0.2) },
        // Numbers line up in tables and stat cards.
        'td, .tabular': { fontVariantNumeric: 'tabular-nums' },
        '*': { scrollbarWidth: 'thin', scrollbarColor: 'rgba(38,44,20,.25) transparent' },
        '@media (prefers-reduced-motion: reduce)': {
          '*, *::before, *::after': { animationDuration: '1ms !important', animationIterationCount: '1 !important', transitionDuration: '1ms !important', scrollBehavior: 'auto !important' },
        },
      },
    },

    // ---------- Surfaces ----------
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: { root: { backgroundImage: 'none' }, rounded: { borderRadius: radius.lg } },
    },
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: { root: { ...glass.card, borderRadius: radius.lg, overflow: 'visible', transition: transition('box-shadow', 'transform', 'background-color') } },
    },
    MuiPopover: { styleOverrides: { paper: { ...glass.raised, borderRadius: radius.md, marginTop: 6 } } },
    MuiMenu: {
      styleOverrides: {
        paper: { ...glass.raised, borderRadius: radius.md, marginTop: 6 },
        list: { padding: 6 },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: { borderRadius: radius.xs, margin: '1px 0', fontSize: '0.92rem', transition: transition('background-color'), '&.Mui-selected': { backgroundColor: alpha(color.olive700, 0.1) } },
      },
    },
    MuiAutocomplete: { styleOverrides: { paper: { ...glass.raised, borderRadius: radius.md, marginTop: 6 }, listbox: { padding: 6 }, option: { borderRadius: radius.xs } } },
    MuiDialog: {
      styleOverrides: {
        paper: { ...glass.dialog, borderRadius: radius.xl },
      },
    },
    MuiBackdrop: {
      styleOverrides: {
        root: { '&:not(.MuiBackdrop-invisible)': { backgroundColor: 'rgba(28, 33, 14, 0.28)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' } },
      },
    },
    MuiDialogTitle: { styleOverrides: { root: { fontFamily: font.display, fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.01em', paddingTop: 22 } } },
    MuiDialogActions: { styleOverrides: { root: { padding: '12px 24px 20px', gap: 4 } } },
    MuiDrawer: { styleOverrides: { paper: { backgroundColor: 'transparent', border: 0, boxShadow: 'none' } } },
    MuiAccordion: {
      defaultProps: { disableGutters: true, elevation: 0 },
      styleOverrides: {
        root: {
          ...glass.card,
          borderRadius: `${radius.md}px !important`,
          marginBottom: 10,
          '&::before': { display: 'none' },
          '&.Mui-expanded': { boxShadow: `${shadow.highlight}, ${shadow.md}` },
          transition: transition('box-shadow'),
        },
      },
    },
    MuiAccordionSummary: { styleOverrides: { root: { borderRadius: radius.md, minHeight: 56 } } },
    MuiTooltip: {
      defaultProps: { arrow: false, enterDelay: 350 },
      styleOverrides: {
        tooltip: { ...glass.dark, borderRadius: radius.xs, fontSize: '0.78rem', fontWeight: 600, padding: '6px 10px', boxShadow: shadow.md },
      },
    },
    MuiSnackbarContent: { styleOverrides: { root: { ...glass.dark, borderRadius: radius.md, color: color.cream } } },
    MuiAlert: {
      styleOverrides: {
        root: { borderRadius: radius.md, alignItems: 'center', border: '1px solid transparent', backdropFilter: 'blur(14px)' },
        standardSuccess: { backgroundColor: alpha(color.success, 0.12), borderColor: alpha(color.success, 0.22) },
        standardInfo: { backgroundColor: alpha(color.info, 0.1), borderColor: alpha(color.info, 0.2) },
        standardWarning: { backgroundColor: alpha('#d9962b', 0.14), borderColor: alpha('#d9962b', 0.26) },
        standardError: { backgroundColor: alpha(color.error, 0.1), borderColor: alpha(color.error, 0.22) },
        filledSuccess: { boxShadow: shadow.md },
        filledError: { boxShadow: shadow.md },
      },
    },

    // ---------- Actions ----------
    MuiButtonBase: { defaultProps: { disableRipple: true } },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: radius.sm,
          paddingInline: 16,
          minHeight: 38,
          transition: transition('background-color', 'box-shadow', 'transform', 'border-color', 'color'),
          '&:active': { transform: 'scale(0.98)' },
          '&.Mui-focusVisible': { boxShadow: shadow.focus },
          '&.Mui-disabled': { opacity: 0.5 },
        },
        sizeSmall: { minHeight: 32, paddingInline: 12, fontSize: '0.84rem' },
        sizeLarge: { minHeight: 46, paddingInline: 22, fontSize: '0.98rem' },
        contained: ({ theme, ownerState }) => {
          const { main, dark } = tinted(theme, ownerState.color === 'inherit' ? 'primary' : ownerState.color);
          return {
            color: '#fff',
            backgroundImage: `linear-gradient(180deg, ${alpha('#ffffff', 0.14)}, ${alpha('#ffffff', 0)})`,
            backgroundColor: main,
            boxShadow: `inset 0 1px 0 ${alpha('#ffffff', 0.22)}, 0 8px 18px -8px ${alpha(dark, 0.7)}`,
            '&:hover': { backgroundColor: dark, transform: 'translateY(-1px)', boxShadow: `inset 0 1px 0 ${alpha('#ffffff', 0.2)}, 0 12px 24px -10px ${alpha(dark, 0.75)}` },
            '&.Mui-disabled': { color: '#fff', backgroundColor: main },
          };
        },
        outlined: ({ theme, ownerState }) => {
          const named = ownerState.color && ownerState.color !== 'inherit' && ownerState.color !== 'primary';
          const { main } = tinted(theme, named ? ownerState.color : 'primary');
          return {
            backgroundColor: 'rgba(255,255,255,.5)',
            backdropFilter: 'blur(12px)',
            borderColor: named ? alpha(main, 0.4) : color.lineStrong,
            color: named ? main : color.ink,
            boxShadow: shadow.highlight,
            '&:hover': { backgroundColor: 'rgba(255,255,255,.82)', borderColor: named ? main : 'rgba(38,44,20,.28)', transform: 'translateY(-1px)' },
          };
        },
        text: ({ ownerState }) => ({
          ...(ownerState.color === 'primary' || !ownerState.color ? { color: color.olive700 } : {}),
          '&:hover': { backgroundColor: 'rgba(62,74,31,.07)' },
        }),
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: radius.sm,
          transition: transition('background-color', 'color', 'transform'),
          '&:hover': { backgroundColor: 'rgba(255,255,255,.6)' },
          '&:active': { transform: 'scale(0.94)' },
          '&.Mui-focusVisible': { boxShadow: shadow.focus },
        },
      },
    },
    MuiToggleButtonGroup: {
      styleOverrides: {
        root: { backgroundColor: 'rgba(255,255,255,.42)', backdropFilter: 'blur(12px)', border: `1px solid ${color.line}`, borderRadius: radius.sm + 1, padding: 3, gap: 2, boxShadow: shadow.highlight },
        grouped: { border: 0, borderRadius: `${radius.xs}px !important`, margin: 0 },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 700,
          color: color.inkMuted,
          padding: '5px 12px',
          transition: transition('background-color', 'color', 'box-shadow'),
          '&:hover': { backgroundColor: 'rgba(255,255,255,.5)' },
          '&.Mui-selected, &.Mui-selected:hover': { backgroundColor: 'rgba(255,255,255,.95)', color: color.ink, boxShadow: `0 1px 2px rgba(31,38,16,.08), 0 4px 10px -4px rgba(31,38,16,.18)` },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: { minHeight: 42 },
        // A soft pill that slides behind the chosen tab.
        indicator: { height: 'calc(100% - 8px)', bottom: 4, borderRadius: radius.xs, backgroundColor: 'rgba(255,255,255,.9)', boxShadow: '0 1px 2px rgba(31,38,16,.08), 0 6px 14px -6px rgba(31,38,16,.22)', zIndex: 0, transition: `all ${motion.slow} ${motion.emphasized}` },
        flexContainer: { gap: 2 },
        scrollButtons: { borderRadius: radius.xs },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          zIndex: 1,
          minHeight: 42,
          textTransform: 'none',
          fontWeight: 700,
          fontSize: '0.9rem',
          color: color.inkMuted,
          borderRadius: radius.xs,
          paddingInline: 14,
          transition: transition('color'),
          '&:hover': { color: color.ink },
          '&.Mui-selected': { color: color.ink },
        },
      },
    },
    MuiPaginationItem: { styleOverrides: { root: { borderRadius: radius.xs, fontWeight: 700, '&.Mui-selected': { backgroundColor: color.olive700, color: '#fff', '&:hover': { backgroundColor: color.olive800 } } } } },
    MuiLink: { defaultProps: { underline: 'hover' }, styleOverrides: { root: { fontWeight: 700, color: color.olive700 } } },

    // ---------- Inputs ----------
    MuiTextField: { defaultProps: { size: 'small', fullWidth: true } },
    MuiSelect: { defaultProps: { size: 'small' } },
    MuiFormControl: { defaultProps: { size: 'small' } },
    MuiInputLabel: { styleOverrides: { root: { fontWeight: 600, color: color.inkMuted } } },
    MuiFormHelperText: { styleOverrides: { root: { marginLeft: 2, marginTop: 5, fontSize: '0.76rem' } } },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: radius.sm,
          backgroundColor: 'rgba(255,255,255,.55)',
          transition: transition('background-color', 'box-shadow'),
          '& .MuiOutlinedInput-notchedOutline': { borderColor: color.lineStrong, transition: transition('border-color') },
          '&:hover:not(.Mui-disabled) .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(38,44,20,.32)' },
          '&.Mui-focused': { backgroundColor: 'rgba(255,255,255,.86)', boxShadow: '0 0 0 4px rgba(62,74,31,.12)' },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: color.olive700, borderWidth: 1 },
          '&.Mui-error.Mui-focused': { boxShadow: `0 0 0 4px ${alpha(color.error, 0.12)}` },
        },
        input: { '&::placeholder': { color: color.inkFaint, opacity: 1 } },
      },
    },
    MuiInputAdornment: { styleOverrides: { root: { color: color.inkMuted } } },
    MuiSwitch: {
      styleOverrides: {
        root: { width: 46, height: 28, padding: 0, margin: 6 },
        switchBase: {
          padding: 3,
          transition: `transform ${motion.base} ${motion.ease}`,
          '&.Mui-checked': { transform: 'translateX(18px)', color: '#fff', '& + .MuiSwitch-track': { backgroundColor: color.olive700, opacity: 1, border: 0 } },
          '&.Mui-checked.Mui-disabled + .MuiSwitch-track': { opacity: 0.4 },
          '&.Mui-focusVisible .MuiSwitch-thumb': { boxShadow: shadow.focus },
        },
        thumb: { width: 22, height: 22, boxShadow: '0 1px 3px rgba(0,0,0,.25)', color: '#fff' },
        track: { borderRadius: 14, backgroundColor: 'rgba(38,44,20,.2)', opacity: 1, transition: `background-color ${motion.base} ${motion.ease}` },
        sizeSmall: {
          width: 36,
          height: 22,
          '& .MuiSwitch-switchBase': { padding: 3, '&.Mui-checked': { transform: 'translateX(14px)' } },
          '& .MuiSwitch-thumb': { width: 16, height: 16 },
        },
      },
    },
    MuiCheckbox: { styleOverrides: { root: { borderRadius: radius.xs } } },
    MuiSlider: { styleOverrides: { thumb: { boxShadow: '0 1px 4px rgba(0,0,0,.25)' } } },

    // ---------- Data display ----------
    MuiTableContainer: { styleOverrides: { root: { borderRadius: radius.md } } },
    MuiTableCell: {
      styleOverrides: {
        root: { borderBottom: `1px solid ${color.line}`, paddingTop: 12, paddingBottom: 12 },
        head: { fontWeight: 700, color: color.inkMuted, fontSize: '0.78rem', letterSpacing: '0.01em', backgroundColor: 'transparent', whiteSpace: 'nowrap', paddingTop: 10, paddingBottom: 10 },
        stickyHeader: { backgroundColor: 'rgba(246,245,240,.92)', backdropFilter: 'blur(12px)' },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: { transition: transition('background-color'), '&.MuiTableRow-hover:hover': { backgroundColor: 'rgba(255,255,255,.55)' }, '&:last-child td': { borderBottom: 0 } },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: ({ theme, ownerState }) => {
          const named = ownerState.color && ownerState.color !== 'default';
          const { main, dark } = tinted(theme, named ? ownerState.color : 'primary');
          const base = { borderRadius: radius.xs, fontWeight: 700, fontSize: '0.76rem', letterSpacing: '0.01em', transition: transition('background-color', 'border-color') };
          if (!named) {
            return ownerState.variant === 'outlined'
              ? { ...base, borderColor: color.lineStrong, backgroundColor: 'rgba(255,255,255,.4)' }
              : { ...base, backgroundColor: 'rgba(38,44,20,.07)', color: color.ink };
          }
          return ownerState.variant === 'outlined'
            ? { ...base, color: dark, borderColor: alpha(main, 0.35), backgroundColor: alpha(main, 0.06) }
            : { ...base, color: dark, backgroundColor: alpha(main, 0.15) };
        },
        sizeSmall: { height: 24 },
        label: { paddingInline: 9 },
      },
    },
    MuiAvatar: { styleOverrides: { root: { fontWeight: 800 } } },
    MuiBadge: { styleOverrides: { badge: { fontWeight: 800, boxShadow: '0 0 0 2px rgba(255,255,255,.9)' } } },
    MuiLinearProgress: { styleOverrides: { root: { borderRadius: 99, height: 6, backgroundColor: 'rgba(38,44,20,.1)' }, bar: { borderRadius: 99 } } },
    MuiSkeleton: { defaultProps: { animation: 'wave' }, styleOverrides: { root: { backgroundColor: 'rgba(255,255,255,.55)', borderRadius: radius.xs }, rounded: { borderRadius: radius.md } } },
    MuiDivider: { styleOverrides: { root: { borderColor: color.line } } },
    MuiListItemButton: { styleOverrides: { root: { borderRadius: radius.sm, transition: transition('background-color', 'color') } } },
    MuiCircularProgress: { defaultProps: { thickness: 4.5 } },
  },
});
