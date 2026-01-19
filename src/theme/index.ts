import { MD3LightTheme as DefaultTheme } from 'react-native-paper';

export const AppTheme = {
    ...DefaultTheme,
    colors: {
        ...DefaultTheme.colors,
        primary: '#F57F17', // Goku Orange (Deep)
        onPrimary: '#FFFFFF',
        secondary: '#1565C0', // Goku Blue
        onSecondary: '#FFFFFF',
        tertiary: '#FFD700', // Super Saiyan Gold
        background: '#FFF3E0', // Light Orange Background
        surface: '#FFFFFF',
        surfaceVariant: '#FFCC80', // Orange Accent
        error: '#D32F2F',
        elevation: {
            level0: 'transparent',
            level1: '#FFFFFF',
            level2: '#FFF8E1',
            level3: '#FFECB3',
            level4: '#FFE0B2',
            level5: '#FFCC80',
        },
    },
    roundness: 16, // Semi-rounded energetic feel
};

// Dragon Ball properties
export const dragonBallStyles = {
    card: {
        borderRadius: 16,
        borderWidth: 2,
        borderColor: '#F57F17', // Orange Border
        backgroundColor: '#FFFFFF',
        shadowColor: '#F57F17',
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 0, // Sharp shadow (Comic style)
        elevation: 4,
    },
    fab: {
        borderRadius: 50,
        backgroundColor: '#1565C0', // Blue
        borderWidth: 2,
        borderColor: '#FFFFFF',
        elevation: 6,
    },
    chip: {
        backgroundColor: '#FFE0B2',
        borderWidth: 1,
        borderColor: '#F57F17',
    }
};

// Deprecated clayStyles mapping for backward compatibility
export const clayStyles = dragonBallStyles;
