import Main from '../Layout/Main'
import AppHead from '../Components/AppHead'
import Breadcrumb from '../Components/Breadcrumb'
import { route } from 'ziggy-js';
import { useForm } from '@inertiajs/react';

function EditVpsServer({ vpsServer }) {
    console.log(vpsServer);
    
    const { data, setData, put, processing, errors } = useForm({
        name: vpsServer.name || '',
        username: vpsServer.username || '',
        ip_address: vpsServer.ip_address || '',
        private_key: vpsServer.private_key || '',
        password: vpsServer.password || '',
        port: vpsServer.port || 22,
        domain: vpsServer.domain || '',
        status: vpsServer.status ? "1" : "0",
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('vps-server.update', vpsServer.id), {
            ...data,
            status: data.status === "1" ? true : false,
        });
    };

    return (
        <Main>
            <AppHead title="Edit VPS Server" />
            <Breadcrumb title="Edit VPS Server" />
            <div className="row gy-4">
                <div className="col-6">
                    <div className="card">
                        <div className="card-header">
                            <h5 className="card-title mb-0">Edit VPS Server</h5>
                        </div>
                        <div className="card-body">
                            <form onSubmit={handleSubmit}>
                                <div className="row gy-1">
                                    <div className="col-12">
                                        <label className="form-label">Name</label>
                                        <input
                                            type="text"
                                            name="name"
                                            className="form-control"
                                            placeholder="Enter Name"
                                            value={data.name}
                                            onChange={e => setData('name', e.target.value)}
                                        />
                                        {errors.name && <div className="text-danger">{errors.name}</div>}
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label">Username</label>
                                        <input
                                            type="text"
                                            name="username"
                                            className="form-control"
                                            placeholder="Enter Username"
                                            value={data.username}
                                            onChange={e => setData('username', e.target.value)}
                                        />
                                        {errors.username && <div className="text-danger">{errors.username}</div>}
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label">IP Address</label>
                                        <input
                                            type="text"
                                            name="ip_address"
                                            className="form-control"
                                            placeholder="Enter IP Address"
                                            value={data.ip_address}
                                            onChange={e => setData('ip_address', e.target.value)}
                                        />
                                        {errors.ip_address && <div className="text-danger">{errors.ip_address}</div>}
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label">Private Key</label>
                                        <textarea
                                            name="private_key"
                                            className="form-control"
                                            placeholder="Enter Private Key"
                                            value={data.private_key}
                                            onChange={e => setData('private_key', e.target.value)}
                                        />
                                        {errors.private_key && <div className="text-danger">{errors.private_key}</div>}
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label">Password</label>
                                        <input
                                            type="text"
                                            name="password"
                                            className="form-control"
                                            placeholder="Enter Password"
                                            value={data.password}
                                            onChange={e => setData('password', e.target.value)}
                                        />
                                        {errors.password && <div className="text-danger">{errors.password}</div>}
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label">Port</label>
                                        <input
                                            type="number"
                                            name="port"
                                            className="form-control"
                                            placeholder="Enter Port"
                                            value={data.port}
                                            onChange={e => setData('port', e.target.value)}
                                        />
                                        {errors.port && <div className="text-danger">{errors.port}</div>}
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label">Domain</label>
                                        <input
                                            type="text"
                                            name="domain"
                                            className="form-control"
                                            placeholder="Enter Domain"
                                            value={data.domain}
                                            onChange={e => setData('domain', e.target.value)}
                                        />
                                        {errors.domain && <div className="text-danger">{errors.domain}</div>}
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label">Status</label>
                                        <select
                                            name="status"
                                            className="form-select"
                                            value={data.status}
                                            onChange={e => setData('status', e.target.value)}
                                        >
                                            <option value="1">Active</option>
                                            <option value="0">Inactive</option>
                                        </select>
                                        {errors.status && <div className="text-danger">{errors.status}</div>}
                                    </div>
                                    <div className="col-12">
                                        <button type="submit" className="btn btn-primary-600" disabled={processing}>
                                            Update
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </Main>
    )
}

export default EditVpsServer