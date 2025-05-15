import { Icon } from "@iconify/react/dist/iconify.js";
import { Link, useForm } from "@inertiajs/react";
import { useState } from "react";
import AppHead from "../Components/AppHead";
import Alert from "../Components/Alert";

function Login() {
    const [showPassword, setShowPassword] = useState(false);
    const togglePassword = () => {
        setShowPassword(!showPassword);
    };

    const { data, setData, post, processing, errors } = useForm({
        email: "",
        password: "",
        remember: false,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post("/login");
    };

    return (
        <>
            <AppHead title="Login" />
            <section className='auth bg-base d-flex flex-wrap'>
                <div className='auth-right py-32 px-24 d-flex flex-column justify-content-center w-100'>
                    <div className='max-w-464-px mx-auto w-100'>
                        <div className="text-center">
                            <Link to='/' className='mb-40 max-w-290-px'>
                                <img src='assets/images/logo.png' alt='' />
                            </Link>
                            <p className='mb-32 text-secondary-light text-lg'>
                                Please log in to your account
                            </p>
                        </div>
                        {errors.message && (
                            <div className="mb-12">
                                <Alert message={errors.message} type="danger" />
                            </div>
                        )}
                        <form onSubmit={handleSubmit}>
                            <div className="mb-16">
                                <div className='icon-field'>
                                    <span className='icon top-50 translate-middle-y'>
                                        <Icon icon='mage:email' />
                                    </span>
                                    <input
                                        type='email'
                                        className='form-control h-56-px bg-neutral-50 radius-12'
                                        placeholder='Email'
                                        value={data.email}
                                        onChange={e => setData('email', e.target.value)}
                                    />
                                </div>
                                {errors.email && <div className="text-danger mt-1">{errors.email}</div>}
                            </div>
                            <div className="mb-16">
                                <div className='position-relative'>
                                    <div className='icon-field'>
                                        <span className='icon top-50 translate-middle-y'>
                                            <Icon icon='solar:lock-password-outline' />
                                        </span>
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            className='form-control h-56-px bg-neutral-50 radius-12'
                                            id='your-password'
                                            placeholder='Password'
                                            value={data.password}
                                            onChange={e => setData('password', e.target.value)}
                                        />
                                    </div>
                                    <span
                                        className={`toggle-password ${showPassword ? 'ri-eye-off-line' : 'ri-eye-line'} cursor-pointer position-absolute end-0 top-50 translate-middle-y me-16 text-secondary-light`}
                                        onClick={togglePassword}
                                    />
                                </div>
                                {errors.password && <div className="text-danger mt-1">{errors.password}</div>}
                            </div>
                            <div className=''>
                                <div className='d-flex justify-content-between gap-2'>
                                    <div className='form-check style-check d-flex align-items-center'>
                                        <input
                                            className='form-check-input border border-neutral-300'
                                            type='checkbox'
                                            defaultValue=''
                                            id='remember'
                                            checked={data.remember}
                                            onChange={e => setData('remember', e.target.checked)}
                                        />
                                        <label className='form-check-label' htmlFor='remember'>
                                            Remember me{" "}
                                        </label>
                                    </div>
                                </div>
                            </div>
                            <button
                                type='submit'
                                className='btn btn-primary text-sm btn-sm px-12 py-16 w-100 radius-12 mt-32'
                            >
                                {" "}
                                Sign In
                            </button>
                        </form>
                    </div>
                </div>
            </section>
        </>
    )
}

export default Login;