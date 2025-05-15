import Main from '../Layout/Main'
import Breadcrumb from '../Components/Breadcrumb'
import AppHead from '../Components/AppHead'
import Table from '../Components/Table'
import Pagination from '../Components/Pagination';
import { Link, router, useForm, usePage } from '@inertiajs/react';
import { Icon } from '@iconify/react/dist/iconify.js';
import Swal from 'sweetalert2'
import { useEffect, useState } from 'react';
import { route } from 'ziggy-js';
import { debounce } from 'lodash';

function VpsServers({ vpsServers, filters }) {
  const { props } = usePage();

  useEffect(() => {
    if (props.flash && props.flash.message) {
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: props.flash.type,
        text: props.flash.message,
        showConfirmButton: false,
        timer: 3000,
      });
    }
  }, [props.flash]);

  const [perPage, setPerPage] = useState(filters.per_page || 5);
  const [status, setStatus] = useState(filters.status ?? '');
  const [search, setSearch] = useState(filters.search || '');

  const columns = [
    { label: 'ID', key: 'id' },
    { label: 'Name', key: 'name' },
    { label: 'IP Address', key: 'ip_address' },
    { label: 'Username', key: 'username' },
    { label: 'Port', key: 'port' },
    { label: 'Domain', key: 'domain' },
    {
      label: 'Status',
      render: (item) => (
        <span
          className={`badge text-sm fw-semibold text-${item.status ? 'success' : 'danger'}-600 bg-${item.status ? 'success' : 'danger'}-100 px-8 py-6 radius-4 text-white`}
        >
          {item.status ? 'Active' : 'Inactive'}
        </span>
      ),
    },
  ];

  const actions = [
    {
      render: (item) => (
        <Link
          href={route('vps-server.manage', item.id)}
          className="w-32-px h-32-px bg-info-focus text-info-main rounded-circle d-inline-flex align-items-center justify-content-center"
          title="Manage"
        >
          <Icon icon="famicons:stats-chart-outline"></Icon>
        </Link>
      ),
    },
    {
      render: (item) => (
        <Link
          href={route('vps-server.edit', item.id)}
          className="w-32-px h-32-px bg-success-focus text-success-main rounded-circle d-inline-flex align-items-center justify-content-center"
          title="Edit"
        >
          <Icon icon="material-symbols:edit"></Icon>
        </Link>
      ),
    },
    {
      render: (item) => (
        <button
          onClick={() => {
            Swal.fire({
              title: 'Are you sure?',
              text: 'This VPS server will be deleted!',
              icon: 'warning',
              showCancelButton: true,
              confirmButtonText: 'Yes, delete it!',
            }).then((result) => {
              if (result.isConfirmed) {
                router.delete(route('vps-server.delete', item.id));
              }
            });
          }}
          className="w-32-px h-32-px bg-danger-focus text-danger-main rounded-circle d-inline-flex align-items-center justify-content-center"
          title="Delete"
        >
          <Icon icon="ic:round-delete"></Icon>
        </button>
      ),
    },
  ];

  const handleFilterChange = (type, value) => {
    let params = {
      per_page: type === 'per_page' ? value : perPage,
      status: type === 'status' ? value : status,
      search: type === 'search' ? value : search,
    };
    // Remove empty status for clean URLs
    if (params.status === '') delete params.status;
    if (params.search === '') delete params.search;
    router.get(route(route().current()), params, {
      preserveState: true,
      replace: true,
    });
  };

  // Debounce search function
  const debouncedSearch = debounce((value) => {
    handleFilterChange('search', value);
  }, 500); // adjust delay as needed

  return (
    <>
      <Main>
        <AppHead title="VPS Servers" />
        <Breadcrumb title="All VPS Servers" />
        <div className="row gy-4">
          <div className="col-12">
            <div className="card">
              <div className="card-header d-flex align-items-center justify-content-between">
                <h5 className="card-title mb-0">All VPS Servers</h5>
                <Link href={route('vps-server.create')} className="btn rounded-pill btn-outline-primary-600 radius-8 px-20 py-11">Create</Link>
              </div>
              <div className="card-body">
                <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-24">
                  <div className="d-flex align-items-center gap-2">
                    <select
                      className="form-select form-select-sm w-auto radius-12 h-40-px"
                      value={perPage}
                      onChange={e => {
                        setPerPage(e.target.value);
                        handleFilterChange('per_page', e.target.value);
                      }}
                    >
                      <option value="5">5</option>
                      <option value="10">10</option>
                      <option value="25">25</option>
                      <option value="50">50</option>
                      <option value="100">100</option>
                    </select>
                    <select
                      className="form-select form-select-sm w-auto radius-12 h-40-px"
                      value={status}
                      onChange={e => {
                        setStatus(e.target.value);
                        handleFilterChange('status', e.target.value);
                      }}
                    >
                      <option value="">All</option>
                      <option value="1">Active</option>
                      <option value="0">Inactive</option>
                    </select>
                  </div>
                  <div className="navbar-search">
                    <input
                      type="text"
                      className="bg-base h-40-px w-auto"
                      name="search"
                      placeholder="Search..."
                      value={search}
                      onChange={(e) => {
                        setSearch(e.target.value);
                        debouncedSearch(e.target.value);
                      }}
                    />
                    <Icon icon="ic:round-search" className="text-secondary-light icon" />
                  </div>
                </div>

                <Table columns={columns} data={vpsServers.data} actions={actions} />

                <Pagination meta={vpsServers.meta} links={vpsServers.meta.links} />

              </div>
            </div>
          </div>
        </div>
      </Main>
    </>
  )
}

export default VpsServers