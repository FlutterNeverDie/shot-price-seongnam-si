import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
    appName: 'shot-price',
    outdir: 'dist',
    brand: {
        displayName: '예방접종 ∙ 최저가는?',
        primaryColor: '#3182F6',
        icon: 'https://static.toss.im/appsintoss/16823/f0cb6f62-1f94-44db-955a-fca21e6b17f2.png',
    },
    web: {
        commands: {
            build: 'npm run build',
            dev: 'npm run dev',
        },
        port: 5173,
    },
    webViewProps: {
        type: 'partner',
    },
    permissions: [],

});
