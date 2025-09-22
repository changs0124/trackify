import { configureFonts, MD3DarkTheme, MD3LightTheme } from "react-native-paper";

const fontConfig = {
    displayLarge: {
        fontFamily: "System", // iOS: San Francisco / Android: Roboto
        fontWeight: "400",
        fontSize: 57,
        lineHeight: 64,
        letterSpacing: 0,
    },
    headlineMedium: {
        fontFamily: "System",
        fontWeight: "600",
        fontSize: 28,
        lineHeight: 36,
        letterSpacing: 0,
    },
    bodyLarge: {
        fontFamily: "System",
        fontWeight: "400",
        fontSize: 16,
        lineHeight: 24,
        letterSpacing: 0.5,
    },
    labelMedium: {
        fontFamily: "System",
        fontWeight: "500",
        fontSize: 12,
        lineHeight: 16,
        letterSpacing: 0.5,
    }
};

export const lightTheme = {
    ...MD3LightTheme,
    colors: {
        ...MD3LightTheme.colors,
        primary: "#3b82f6",
        secondary: "#10b981",
        secondaryContainer: "#dbdbdb",
        onSecondaryContainer: "#222222",
        tertiary: "#dbdbdb",
        onTertiary: "#222222",
        tertiaryContainer: "#dbdbdb",
        onTertiaryContainer: "#222222",
        surface: "#f6f6f6",
        background: "#f6f6f6",
        surfaceVariant: "#ededed",
        onSurface: "#222222",
        onSurfaceVariant: "#444444",
        outline: "#d0d0d0",
        outlineVariant: "#e2e2e2",
        elevation: {
            level0: "transparent",
            level1: "#f3f3f3",
            level2: "#eeeeee",
            level3: "#e9e9e9",
            level4: "#e5e5e5",
            level5: "#dbdbdb",
        },
    },
    fonts: configureFonts({ config: fontConfig }),
    roundness: 10,
};

export const darkTheme = {
    ...MD3DarkTheme,
    colors: {
        ...MD3DarkTheme.colors,
        primary: "#3b82f6",
        secondary: "#10b981",
        secondaryContainer: "#222222",
        onSecondaryContainer: "#dbdbdb",
        tertiary: "#222222",
        onTertiary: "#dbdbdb",
        tertiaryContainer: "#222222",
        onTertiaryContainer: "#dbdbdb",
        surface: "#121212",
        background: "#121212",
        surfaceVariant: "#2a2a2a",
        onSurface: "#f6f6f6",
        onSurfaceVariant: "#cccccc",
        outline: "#444444",
        outlineVariant: "#666666",
        elevation: {
            level0: "transparent",
            level1: "#1e1e1e",
            level2: "#222222",
            level3: "#2a2a2a",
            level4: "#333333",
            level5: "#3a3a3a",
        },
    },
    fonts: configureFonts({ config: fontConfig }),
    roundness: 10,
};