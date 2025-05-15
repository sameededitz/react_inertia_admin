import { Icon } from "@iconify/react/dist/iconify.js";

function Alert({ message, type }) {
    return (
        <div
            className={`alert alert-${type} bg-${type}-50 text-${type}-600 border-${type}-50 px-24 py-11 mb-0 fw-semibold text-lg radius-8 d-flex align-items-center justify-content-between`}
            role="alert"
        >
            {message}
            <button className="remove-button text-secondary-light text-xxl line-height-1">
                {" "}
                <Icon icon="iconamoon:sign-times-light" className="icon" />
            </button>
        </div>
    )
}

export default Alert;