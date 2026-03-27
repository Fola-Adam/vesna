/**
 * Vesna — Loading Screen Animation
 * Fluid, graceful entry animation with mascot and branding
 */

const LoadingScreen = {
    init() {
        // Check if loading screen should show (first visit or after page refresh)
        const hasSeenLoading = sessionStorage.getItem('vesna_loading_shown');

        if (hasSeenLoading) {
            this.hideImmediately();
        } else {
            this.startAnimation();
        }
    },

    startAnimation() {
        const loadingScreen = document.getElementById('loading-screen');

        if (!loadingScreen) return;

        // Timeline (Sequential - CSS animations handle element transitions):
        // 0-1.8s: mask drops in
        // 1.8-2.2s: mask exits (CSS animation)
        // 2.2-4.0s: card appears with light glide
        // 4.0-4.4s: card exits (CSS animation)
        // 4.4-5.2s: logo slides in and starts floating
        // 5.2-6.2s: text streams in Tangerine font
        // 6.2s: hide loading screen

        setTimeout(() => {
            // Hide loading screen after full animation sequence
            loadingScreen.classList.add('hidden');
            sessionStorage.setItem('vesna_loading_shown', 'true');
        }, 6200);
    },

    hideImmediately() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
        }
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    LoadingScreen.init();
});
