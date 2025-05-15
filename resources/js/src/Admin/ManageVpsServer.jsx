import Main from '../Layout/Main'
import AppHead from '../Components/AppHead'
import Breadcrumb from '../Components/Breadcrumb'
import ApexCharts from 'apexcharts'
import { useEffect, useRef, useState } from 'react';
import { Icon } from '@iconify/react/dist/iconify.js';
import axios from 'axios';

function ManageVpsServer({ vpsServer }) {
    const cpuChart = useRef(null);
    const ramChart = useRef(null);
    const diskChart = useRef(null);

    const [ikev2, setIkev2] = useState('');
    const [ikev2ConnectedUsers, setIkev2ConnectedUsers] = useState(null);

    const [connectedUsers, setConnectedUsers] = useState([]);

    const [output, setOutput] = useState('');
    const [isRunning, setIsRunning] = useState(false);
    const [intervalId, setIntervalId] = useState(null);
    const outputRef = useRef(null);

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const fetchStats = () => {
        setLoading(true);
        fetch(route('vps-server.stats', vpsServer.id))
            .then(res => res.json())
            .then(data => {
                if (data.cpu !== undefined) cpuChart.current.updateSeries([parseFloat(data.cpu)]);
                if (data.memory !== undefined) ramChart.current.updateSeries([parseFloat(data.memory)]);
                if (data.disk !== undefined) {
                    const match = data.disk.match(/\((\d+(\.\d+)?)%\)/);
                    const diskPercent = match ? parseFloat(match[1]) : 0;
                    diskChart.current.updateSeries([diskPercent]);
                }
                if (data.ikev2 !== undefined) {
                    setIkev2(data.ikev2);
                }
                setLoading(false);
                setError('');
            })
            .catch((error) => {
                console.error('Error fetching stats:', error);
                if (cpuChart.current) cpuChart.current.updateSeries([0]);
                if (ramChart.current) ramChart.current.updateSeries([0]);
                if (diskChart.current) diskChart.current.updateSeries([0]);
                setIkev2('Error');
                setError('Failed to fetch stats: ' + error.message);
                setLoading(false);
            });
    };

    const fetchConnectedUsers = () => {
        fetch(route('vps-server.connected-users', vpsServer.id))
            .then(res => res.json())
            .then(data => {
                if (data.ikev2_connected_users !== undefined) {
                    setIkev2ConnectedUsers(data.ikev2_connected_users);
                }
                if (data.connected_users !== undefined) {
                    setConnectedUsers(data.connected_users);
                }
            })
            .catch(err => {
                console.error("Failed to fetch connected users:", err);
                setConnectedUsers('Error');
            });
    };

    const runScript = async () => {
        // Prevent duplicate runs
        if (isRunning) return;

        setIsRunning(true);
        setOutput('⏳ Starting script...\n');

        try {
            const response = await axios.post(route('vps-server.run-script', vpsServer.id));
            if (response.data.status === 'started') {
                // Start polling
                const id = setInterval(async () => {
                    try {
                        const res = await axios.post(route('vps-server.output', vpsServer.id));
                        const data = res.data;

                        if (data !== undefined) {
                            setOutput(prev => prev + data);
                            // Detect end marker in output
                            if (data.includes('All done. Scripts executed and cleaned up.')) {
                                clearInterval(id);
                                setIsRunning(false);
                            }
                        }
                    } catch (err) {
                        console.error('❌ Error fetching script output:', err);
                        setOutput(prev => prev + `\n❌ Error fetching output: ${err.message}`);
                        clearInterval(id);
                        setIsRunning(false);
                    }
                }, 1000);

                setIntervalId(id);
            } else {
                setOutput('⚠️ Failed to start script.');
                setIsRunning(false);
            }
        } catch (error) {
            console.error('❌ Error running script:', error);
            setOutput('❌ Error running script: ' + error.message);
            setIsRunning(false);
        }
    };

    useEffect(() => {
        // Initialize charts
        cpuChart.current = createGaugeChart('#cpu-chart', 0, 'CPU');
        ramChart.current = createGaugeChart('#ram-chart', 0, 'RAM');
        diskChart.current = createGaugeChart('#disk-chart', 0, 'Disk');

        fetchStats();
        fetchConnectedUsers();

        // Cleanup on unmount
        return () => {
            cpuChart.current && cpuChart.current.destroy();
            ramChart.current && ramChart.current.destroy();
            diskChart.current && diskChart.current.destroy();
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [vpsServer.id, intervalId]);

    useEffect(() => {
        if (outputRef.current) {
            outputRef.current.scrollTo({
                top: outputRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, [output]);

    return (
        <Main>
            <AppHead title="Manage VPS Server" />
            <Breadcrumb title="Manage VPS Server" />

            <div className="row mb-12">
                <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-12 text-end">
                    <button
                        className="btn rounded-pill btn-outline-primary-600 radius-8 px-20 py-11 d-flex gap-2 float-end align-items-center"
                        onClick={fetchStats}
                        disabled={loading}
                    >
                        {loading ? (
                            <Icon icon="svg-spinners:180-ring" width="24" height="24" className="transition-all duration-300" />
                        ) : (
                            <Icon icon="radix-icons:reload" width="24" height="24" className="transition-all duration-300" />
                        )}
                        {loading ? "Loading..." : "Refresh"}
                    </button>
                </div>
            </div>

            <div className="row gy-4">
                <div className="col-12 col-md-4">
                    <div className="card">
                        <div className="card-body bg-gradient-end-4">
                            <div id='cpu-chart'></div>
                        </div>
                    </div>
                </div>
                <div className="col-12 col-md-4">
                    <div className="card">
                        <div className="card-body bg-gradient-end-5">
                            <div id='ram-chart'></div>
                        </div>
                    </div>
                </div>
                <div className="col-12 col-md-4">
                    <div className="card">
                        <div className="card-body bg-gradient-end-6">
                            <div id='disk-chart'></div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="row gy-4 mt-4">
                <div className="col-12">
                    <div className="card p-3 d-flex flex-row align-items-center gap-3">
                        <Icon
                            icon={ikev2 === 'Running' ? 'fluent-mdl2:status-circle-checkmark' : 'fluent-mdl2:status-circle-error-x'}
                            width="24"
                            height="24"
                            className={ikev2 === 'Running' ? 'text-success' : 'text-danger'}
                        />
                        <h6 className="mb-0">IKEv2 Status: <span className={ikev2 === 'Running' ? 'text-success' : 'text-danger'}>{ikev2}</span></h6>
                        <div className="ms-auto">
                            {ikev2ConnectedUsers !== null && (
                                <span className={`badge text-sm fw-semibold text-${ikev2ConnectedUsers > 0 ? 'success' : 'danger'}-600 bg-${ikev2ConnectedUsers > 0 ? 'success' : 'danger'}-100 px-8 py-6 radius-4 text-white`}>
                                    {ikev2ConnectedUsers}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="row mb-3 gy-4 mt-4">
                <div className="col-md-12">
                    <div className="card bg-dark-1 text-white">
                        <div className="card-header bg-dark-1 text-white d-flex justify-content-between align-items-center">
                            <h6 className='text-white text-xl mb-0'>Script Output</h6>
                            <button
                                className="btn rounded-pill btn-outline-primary-600 radius-8 px-20 py-11 d-flex gap-2 float-end align-items-center"
                                onClick={runScript}
                                disabled={isRunning}
                            >
                                {isRunning ? (
                                    <Icon icon="svg-spinners:180-ring" width="24" height="24" className="transition-all duration-300" />
                                ) : (
                                    <Icon icon="vaadin:start-cog" width="24" height="24" className="transition-all duration-300" />
                                )}
                                {isRunning ? 'Running...' : 'Run Script'}
                            </button>
                        </div>
                        <div className="card-body p-0">
                            <pre
                                id="script-output"
                                ref={outputRef}
                                className="mb-0 terminal-output"
                                style={{
                                    height: '400px',
                                    overflowY: 'auto',
                                    padding: '1rem',
                                    fontFamily: "'Courier New', monospace",
                                    fontSize: '14px',
                                    lineHeight: 1.5,
                                    backgroundColor: '#1e1e1e',
                                    color: '#00ff00',
                                    whiteSpace: 'pre-wrap',
                                    wordWrap: 'break-word',
                                    scrollBehavior: 'smooth',
                                }}
                            >{output || 'Output will appear here...'}</pre>
                        </div>
                    </div>
                </div>
            </div>

        </Main >
    )
}

function createGaugeChart(element, value, label) {
    var options = {
        series: [value],
        chart: {
            height: 250,
            type: "radialBar",
            offsetY: -10
        },
        plotOptions: {
            radialBar: {
                startAngle: -135,
                endAngle: 135,
                track: {
                    background: "#e0e0e0"
                },
                dataLabels: {
                    name: {
                        fontSize: "16px",
                        color: "#888",
                        offsetY: 120
                    },
                    value: {
                        offsetY: 76,
                        fontSize: "22px",
                        formatter: val => val + "%"
                    }
                }
            }
        },
        fill: {
            type: "gradient",
            gradient: {
                shade: "light", // Optional: Gives a darker tone
                type: "horizontal", // You can also use 'vertical' or 'diagonal'
                gradientToColors: ["#A8E063"], // The end color for the gradient (lighter green)
                stops: [0, 50, 65, 91], // The gradient stops
                colorStops: [{
                    offset: 0,
                    color: "#004D40", // Dark green
                    opacity: 1
                },
                {
                    offset: 50,
                    color: "#388E3C", // Medium green
                    opacity: 1
                },
                {
                    offset: 75,
                    color: "#66BB6A", // Light green
                    opacity: 1
                },
                {
                    offset: 100,
                    color: "#A8E063", // Very light green
                    opacity: 1
                }
                ]
            }
        },
        stroke: {
            dashArray: 4
        },
        labels: [label]
    };

    var chart = new ApexCharts(document.querySelector(element), options);
    chart.render();
    return chart;
}

export default ManageVpsServer