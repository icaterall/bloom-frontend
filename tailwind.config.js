/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      /* ─────────────────────────────────────────
         Color Palette — Bloom Spectrum Design System
         ───────────────────────────────────────── */
      colors: {
        // ── Brand Primary (Blue) ──────────────
        'brand-primary': {
          DEFAULT: '#2663EB',
          50:  '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2663EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
          950: '#172554',
        },

        // ── Brand Accent (Golden / Amber) ─────
        'brand-accent': {
          DEFAULT: '#F59E0B',
          50:  '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
          800: '#92400E',
          900: '#78350F',
          950: '#451A03',
        },

        // ── Surface & Background Tokens ───────
        surface: {
          DEFAULT: '#FFFFFF',
          50:  '#F8FAFC',   // slate-50  — page background
          100: '#F1F5F9',   // slate-100 — card alt / zebra stripe
          200: '#E2E8F0',   // slate-200 — dividers / borders
          300: '#CBD5E1',   // slate-300 — muted borders
          400: '#94A3B8',   // slate-400 — placeholder text
          500: '#64748B',   // slate-500 — secondary text
          600: '#475569',   // slate-600 — body text
          700: '#334155',   // slate-700 — headings
          800: '#1E293B',   // slate-800 — high-contrast text
          900: '#0F172A',   // slate-900 — near-black
        },

        // ── Semantic Status Colours ───────────
        success: {
          DEFAULT: '#10B981',
          50: '#ECFDF5',
          100: '#D1FAE5',
          500: '#10B981',
          600: '#059669',
          700: '#047857',
        },
        warning: {
          DEFAULT: '#F59E0B',
          50: '#FFFBEB',
          100: '#FEF3C7',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
        },
        error: {
          DEFAULT: '#EF4444',
          50: '#FEF2F2',
          100: '#FEE2E2',
          500: '#EF4444',
          600: '#DC2626',
          700: '#B91C1C',
        },
        info: {
          DEFAULT: '#3B82F6',
          50: '#EFF6FF',
          100: '#DBEAFE',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
        },

        // ── Legacy aliases (backward compat) ──
        primary: {
          DEFAULT: '#2663EB',
          50: '#EFF6FF', 100: '#DBEAFE', 200: '#BFDBFE',
          300: '#93C5FD', 400: '#60A5FA', 500: '#3B82F6',
          600: '#2663EB', 700: '#1D4ED8', 800: '#1E40AF', 900: '#1E3A8A',
        },
        secondary: {
          DEFAULT: '#F59E0B',
          50: '#FFFBEB', 100: '#FEF3C7', 200: '#FDE68A',
          300: '#FCD34D', 400: '#FBBF24', 500: '#F59E0B',
          600: '#D97706', 700: '#B45309', 800: '#92400E', 900: '#78350F',
        },
        accent: {
          DEFAULT: '#10B981',
          50: '#ECFDF5', 100: '#D1FAE5', 200: '#A7F3D0',
          300: '#6EE7B7', 400: '#34D399', 500: '#10B981',
          600: '#059669', 700: '#047857', 800: '#065F46', 900: '#064E3B',
        },
        text: '#111827',
        background: '#F8FAFC',
      },

      /* ─────────────────────────────────────────
         Typography
         ───────────────────────────────────────── */
      fontFamily: {
        sans: [
          'Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont',
          'Segoe UI', 'Roboto', 'sans-serif',
        ],
        display: [
          'Inter', 'system-ui', 'sans-serif',
        ],
      },

      fontSize: {
        'display-lg': ['2.25rem', { lineHeight: '2.75rem', fontWeight: '700' }],
        'display-md': ['1.875rem', { lineHeight: '2.375rem', fontWeight: '600' }],
        'display-sm': ['1.5rem', { lineHeight: '2rem', fontWeight: '600' }],
      },

      /* ─────────────────────────────────────────
         Border Radius — "bloom" radii
         ───────────────────────────────────────── */
      borderRadius: {
        'bloom-sm':  '5px',      //  5px — buttons, badges, inputs
        'bloom':     '5px',      //  5px — cards, containers
        'bloom-lg':  '5px',      //  5px — modals, panels
        'bloom-xl':  '5px',      //  5px — hero sections (uniform system)
        'bloom-full': '9999px',  // pill shape (kept for avatar badges)
      },

      /* ─────────────────────────────────────────
         Box Shadows — premium floating feel
         ───────────────────────────────────────── */
      boxShadow: {
        'bloom-xs':  '0 1px 2px 0 rgba(15, 23, 42, 0.04)',
        'bloom-sm':  '0 1px 3px 0 rgba(15, 23, 42, 0.06), 0 1px 2px -1px rgba(15, 23, 42, 0.04)',
        'bloom':     '0 4px 6px -1px rgba(15, 23, 42, 0.06), 0 2px 4px -2px rgba(15, 23, 42, 0.04)',
        'bloom-md':  '0 6px 12px -2px rgba(15, 23, 42, 0.08), 0 3px 6px -3px rgba(15, 23, 42, 0.05)',
        'bloom-lg':  '0 12px 24px -4px rgba(15, 23, 42, 0.10), 0 4px 8px -4px rgba(15, 23, 42, 0.04)',
        'bloom-xl':  '0 20px 40px -8px rgba(15, 23, 42, 0.12), 0 8px 16px -8px rgba(15, 23, 42, 0.06)',
        'bloom-inner': 'inset 0 2px 4px 0 rgba(15, 23, 42, 0.04)',
        // Coloured glow for primary/accent CTAs
        'bloom-primary': '0 4px 14px -2px rgba(38, 99, 235, 0.35)',
        'bloom-accent':  '0 4px 14px -2px rgba(245, 158, 11, 0.35)',
      },

      /* ─────────────────────────────────────────
         Animations
         ───────────────────────────────────────── */
      animation: {
        'fade-in':        'fadeIn 300ms ease-out',
        'fade-in-up':     'fadeInUp 400ms cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-in':       'scaleIn 280ms cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-in-right': 'slideInRight 300ms cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-in-left':  'slideInLeft 300ms cubic-bezier(0.16, 1, 0.3, 1)',
        'spin-slow':      'spin 1.2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%':   { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%':   { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideInRight: {
          '0%':   { opacity: '0', transform: 'translateX(100%)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInLeft: {
          '0%':   { opacity: '0', transform: 'translateX(-100%)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },

      /* ─────────────────────────────────────────
         Spacing & Layout
         ───────────────────────────────────────── */
      spacing: {
        '4.5': '1.125rem',
        '13':  '3.25rem',
        '15':  '3.75rem',
        '18':  '4.5rem',
        '68':  '17rem',     // collapsed sidebar
        '72':  '18rem',     // expanded sidebar
      },

      transitionTimingFunction: {
        'bloom': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },

      transitionDuration: {
        '250': '250ms',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
};
