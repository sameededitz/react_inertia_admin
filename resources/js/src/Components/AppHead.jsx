import { Head, usePage } from '@inertiajs/react'

function AppHead({ title, children }) {
    const appName = usePage().props.appName;

    return (
        <Head>
            <title>{title ? `${title} - ${appName}` : appName}</title>
            {children}
        </Head>
    )
}

export default AppHead