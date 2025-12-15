export const Colors = {
    background: '#050505', // Almost black
    surface: '#121212', // Slightly lighter for cards
    surfaceHighlight: '#1E1E1E',
    primary: '#BB86FC', // Premium Purple
    secondary: '#03DAC6', // Teal
    error: '#CF6679',
    text: '#FFFFFF',
    textSecondary: '#AAAAAA',
    accent: '#3700B3',
    success: '#00C853',
    warning: '#FFD600',

    // Gradients or specific UI elements
    cardBorder: 'rgba(255, 255, 255, 0.05)',
};

export const Spacing = {
    xs: 4,
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
};

export const Typography = {
    h1: { fontSize: 32, fontWeight: '700' as const, color: Colors.text },
    h2: { fontSize: 24, fontWeight: '600' as const, color: Colors.text },
    body: { fontSize: 16, color: Colors.text },
    caption: { fontSize: 12, color: Colors.textSecondary },
};
