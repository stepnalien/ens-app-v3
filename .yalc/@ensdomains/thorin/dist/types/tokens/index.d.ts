export declare const tokens: {
    borderStyles: {
        none: string;
        solid: string;
    };
    borderWidths: {
        '0': string;
        px: string;
        '0.375': string;
        '0.5': string;
        '0.75': string;
        '1': string;
        '1.25': string;
        '1.5': string;
        '1.75': string;
        '2': string;
    };
    colors: {
        base: {
            black: string;
            white: string;
            current: string;
            inherit: string;
            transparent: string;
        };
        light: {
            blue: string;
            green: string;
            red: string;
            indigo: string;
            orange: string;
            pink: string;
            purple: string;
            teal: string;
            yellow: string;
            grey: string;
            background: string;
            backgroundSecondary: string;
            backgroundTertiary: string;
            foreground: string;
            groupBackground: string;
            groupBorder: string;
            gradients: {
                blue: string;
                green: string;
                red: string;
            };
        };
        dark: {
            blue: string;
            green: string;
            red: string;
            indigo: string;
            orange: string;
            pink: string;
            purple: string;
            teal: string;
            yellow: string;
            grey: string;
            background: string;
            backgroundSecondary: string;
            backgroundTertiary: string;
            foreground: string;
            groupBackground: string;
            groupBorder: string;
            gradients: {
                blue: string;
                green: string;
                red: string;
            };
        };
    };
    fonts: {
        mono: string;
        sans: string;
    };
    fontSizes: {
        headingOne: string;
        headingTwo: string;
        headingThree: string;
        extraLarge: string;
        large: string;
        small: string;
        label: string;
        base: string;
        root: string;
    };
    fontWeights: {
        light: string;
        normal: string;
        medium: string;
        semiBold: string;
        bold: string;
    };
    letterSpacings: {
        '-0.02': string;
        '-0.015': string;
        '-0.01': string;
        normal: string;
        '0.03': string;
    };
    lineHeights: {
        normal: string;
        none: string;
        '1.25': string;
        '1.375': string;
        '1.5': string;
        '1.625': string;
        '2': string;
    };
    opacity: {
        '0': string;
        '30': string;
        '50': string;
        '70': string;
        '100': string;
    };
    radii: {
        none: string;
        medium: string;
        large: string;
        almostExtraLarge: string;
        extraLarge: string;
        '2xLarge': string;
        '2.5xLarge': string;
        '3xLarge': string;
        '4xLarge': string;
        full: string;
    };
    shades: {
        light: {
            accent: string;
            accentSecondary: string;
            accentSecondaryHover: string;
            backgroundHide: string;
            backgroundHideFallback: string;
            foregroundSecondary: string;
            foregroundSecondaryHover: string;
            foregroundTertiary: string;
            groupBorder: string;
            border: string;
            borderSecondary: string;
            borderTertiary: string;
            text: string;
            textSecondary: string;
            textSecondaryHover: string;
            textTertiary: string;
            textTertiaryHover: string;
            textPlaceholder: string;
        };
        dark: {
            accent: string;
            accentSecondary: string;
            accentSecondaryHover: string;
            backgroundHide: string;
            backgroundHideFallback: string;
            foregroundSecondary: string;
            foregroundSecondaryHover: string;
            foregroundTertiary: string;
            groupBorder: string;
            border: string;
            borderSecondary: string;
            borderTertiary: string;
            text: string;
            textSecondary: string;
            textSecondaryHover: string;
            textTertiary: string;
            textTertiaryHover: string;
            textPlaceholder: string;
        };
    };
    shadows: {
        none: string;
        '-px': string;
        '0': string;
        '0.02': string;
        '0.25': string;
        '0.5': string;
        '1': string;
        '2': string;
    };
    space: {
        '0': string;
        px: string;
        '0.25': string;
        '0.5': string;
        '0.75': string;
        '1': string;
        '1.25': string;
        '1.5': string;
        '1.75': string;
        '2': string;
        '2.5': string;
        '3': string;
        '3.5': string;
        '4': string;
        '4.5': string;
        '5': string;
        '6': string;
        '7': string;
        '8': string;
        '9': string;
        '10': string;
        '11': string;
        '12': string;
        '13': string;
        '14': string;
        '15': string;
        '16': string;
        '18': string;
        '20': string;
        '24': string;
        '28': string;
        '32': string;
        '36': string;
        '40': string;
        '44': string;
        '48': string;
        '52': string;
        '56': string;
        '60': string;
        '64': string;
        '72': string;
        '80': string;
        '96': string;
        auto: string;
        full: string;
        fit: string;
        max: string;
        min: string;
        viewHeight: string;
        viewWidth: string;
        none: string;
    };
};
export type { Accent, Mode } from './color';
export declare type Tokens = typeof tokens;