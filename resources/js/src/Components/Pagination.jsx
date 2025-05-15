import { Link } from '@inertiajs/react';

function Pagination({ meta, links }) {
    if (!meta || !links) return null;

    const renderLabel = (label) => {
        if (label.includes('Previous') || label === '&laquo;') {
            return <span aria-label="Previous">&laquo;</span>;
        }
        if (label.includes('Next') || label === '&raquo;') {
            return <span aria-label="Next">&raquo;</span>;
        }
        return <span dangerouslySetInnerHTML={{ __html: label }} />;
    };

    return (
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mt-24">
            <span>
                Showing {meta.from ?? 0} to {meta.to ?? 0} of {meta.total} entries
            </span>
            <ul className="pagination d-flex flex-wrap align-items-center gap-2 justify-content-center">
                {links.map((link, index) => (
                    <li key={index} className={`page-item ${link.active ? 'active' : ''} ${!link.url ? 'disabled' : ''}`}>
                        {link.url ? (
                            <Link
                                className={`page-link ${
                                    link.active
                                        ? 'bg-primary-600 text-white'
                                        : 'bg-neutral-200 text-secondary-light'
                                } fw-semibold radius-8 border-0 d-flex align-items-center justify-content-center h-32-px w-32-px text-md`}
                                href={link.url}
                            >
                                {renderLabel(link.label)}
                            </Link>
                        ) : (
                            <span
                                className="page-link bg-neutral-200 text-secondary-light fw-semibold radius-8 border-0 d-flex align-items-center justify-content-center h-32-px w-32-px text-md"
                            >
                                {renderLabel(link.label)}
                            </span>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default Pagination;
