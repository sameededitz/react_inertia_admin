import { createInertiaApp } from '@inertiajs/react'
import { configureEcho } from '@laravel/echo-react'
import { createRoot } from 'react-dom/client'

configureEcho({
  broadcaster: 'reverb'
})

createInertiaApp({
  resolve: name => {
    const pages = import.meta.glob('./src/**/*.jsx', { eager: true })
    return pages[`./src/${name}.jsx`]
  },
  setup({ el, App, props }) {
    const root = createRoot(el);

    root.render(<App {...props} />);
  },
})