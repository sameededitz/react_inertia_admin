function Table({ columns, data, actions = [] }) {
    return (
        <div className="table-responsive">
            <table className="table striped-table mb-0">
                <thead>
                    <tr>
                        {columns.map((col, index) => (
                            <th key={index}>{col.label}</th>
                        ))}
                        {actions.length > 0 && <th>Actions</th>}
                    </tr>
                </thead>
                <tbody>
                    {data.length ? (
                        data.map((item, index) => (
                            <tr key={index}>
                                {columns.map((col, colIndex) => (
                                    <td key={colIndex}>
                                        {col.render ? col.render(item) : item[col.key]}
                                    </td>
                                ))}
                                {actions.length > 0 && (
                                    <td>
                                        <div className="d-flex align-items-center gap-2">
                                            {actions.map((action, actionIndex) => (
                                                action.render ? (
                                                    <span key={actionIndex}>
                                                        {action.render(item)}
                                                    </span>
                                                ) : (
                                                    <button
                                                        key={actionIndex}
                                                        onClick={() => action.onClick(item)}
                                                        className={action.className}
                                                    >
                                                        {action.label}
                                                    </button>
                                                )
                                            ))}
                                        </div>
                                    </td>
                                )}
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={columns.length + (actions.length ? 1 : 0)} className="text-center">
                                No data available
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default Table;