<?php

namespace App\Http\Controllers\Admin;

use Inertia\Inertia;
use phpseclib3\Net\SSH2;
use App\Models\VpsServer;
use Illuminate\Http\Request;
use App\Jobs\RunVpnSetupScriptJob;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Http;
use phpseclib3\Crypt\PublicKeyLoader;
use Illuminate\Support\Facades\Storage;
use App\Http\Resources\VpsServerResource;

class VpsServerController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 5);

        $vpsServers = VpsServer::query()
            ->when($request->search, function ($query) use ($request) {
                $query->where('name', 'like', '%' . $request->search . '%')
                    ->orWhere('ip_address', 'like', '%' . $request->search . '%');
            })
            ->when($request->filled('status'), function ($query) use ($request) {
                $query->where('status', (bool) $request->status);
            })
            ->latest()
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('Admin/VpsServers', [
            'vpsServers' => VpsServerResource::collection($vpsServers),
            'filters' => [
                'search' => $request->search,
                'status' => $request->status,
                'per_page' => $perPage,
            ],
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/AddVpsServer');
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required',
            'ip_address' => 'required|ip',
            'username' => 'required',
            'port' => 'required|numeric',
            'domain' => 'required',
            'status' => 'required|boolean',
            'private_key' => 'nullable|required_without:password',
            'password' => 'nullable|required_without:private_key',
        ]);

        VpsServer::create($request->only([
            'name',
            'ip_address',
            'username',
            'port',
            'domain',
            'status',
            'private_key',
            'password',
        ]));

        return redirect()->intended(route('vps-server', absolute: false))->with([
            'message' => 'VPS Server created successfully.',
            'type' => 'success',
            'title' => 'Success',
        ]);
    }

    public function edit(VpsServer $vpsServer)
    {
        return Inertia::render('Admin/EditVpsServer', [
            'vpsServer' => $vpsServer->makeVisible('private_key'),
        ]);
    }
    public function update(Request $request, VpsServer $vpsServer)
    {
        $request->validate([
            'name' => 'required',
            'ip_address' => 'required|ip',
            'username' => 'required',
            'port' => 'required|numeric',
            'domain' => 'required',
            'status' => 'required|boolean',
            'private_key' => 'nullable|required_without:password',
            'password' => 'nullable|required_without:private_key',
        ]);

        $vpsServer->update($request->only([
            'name',
            'ip_address',
            'username',
            'port',
            'domain',
            'status',
            'private_key',
            'password',
        ]));

        return redirect()->intended(route('vps-server', absolute: false))->with([
            'message' => 'VPS Server updated successfully.',
            'type' => 'success',
            'title' => 'Success',
        ]);
    }

    public function destroy(VpsServer $vpsServer)
    {
        $vpsServer->delete();

        return redirect()->intended(route('vps-server', absolute: false))->with([
            'message' => 'VPS Server deleted successfully.',
            'type' => 'success',
            'title' => 'Success',
        ]);
    }

    public function manage(VpsServer $vpsServer)
    {
        return Inertia::render('Admin/ManageVpsServer', [
            'vpsServer' => $vpsServer,
        ]);
    }

    public function stats(VpsServer $vpsServer)
    {
        $ssh = $this->connectToServer($vpsServer);

        if (!$ssh) {
            return response()->json(['error' => 'Unable to connect to server'], 500);
        }

        try {
            $cpu = floatval(trim($ssh->exec("top -bn1 | grep 'Cpu' | awk '{print 100 - $8}'")));
            $ram = floatval(trim($ssh->exec("free -m | awk 'NR==2{printf \"%.2f\", $3*100/$2 }'")));
            $diskUsageRaw = trim($ssh->exec("df -h --output=used,size,pcent / | tail -n 1"));
            list($used, $total, $percent) = preg_split('/\s+/', $diskUsageRaw);
            $disk = "$used / $total ($percent)";

            // Fetch IKEv2 status
            $ikev2Status = $this->fetchIkev2Status($ssh);

            return response()->json([
                'cpu' => trim($cpu),
                'memory' => trim($ram),
                'disk' => trim($disk),
                'ikev2' => $ikev2Status,
            ]);
        } catch (\Exception $e) {
            Log::channel('ssh')->error("Error executing command on {$vpsServer->ip_address} server: " . $e->getMessage());
            return response()->json(['error' => 'Command execution failed'], 500);
        }
    }

    public function connectedUsers(VpsServer $vpsServer)
    {
        try {
            $apiUrl = "http://{$vpsServer->ip_address}:5000/api/ikev2/connected-users";
            $apiToken = env('VPS_API_TOKEN');

            $response = Http::withHeaders([
                'X-API-Token' => $apiToken
            ])->get($apiUrl);

            $data = $response->json();

            Log::channel('ssh')->info("Fetched connected users from {$vpsServer->ip_address}", (array) $data ?? []);

            if (!$data || !is_array($data) || !isset($data['total_connected'])) {
                throw new \Exception("Invalid response from API");
            }

            return response()->json([
                'connected_users' => $data['connected_users'] ?? [],
                'ikev2_connected_users' => $data['total_connected'] ?? 0,
            ]);
        } catch (\Exception $e) {
            Log::channel('ssh')->error("Error fetching VPN users from {$vpsServer->ip_address}: " . $e->getMessage());
            return response()->json(['error' => 'Fetch failed', 'message' => $e->getMessage()], 500);
        }
    }

    public function runScript(VpsServer $vpsServer)
    {
        RunVpnSetupScriptJob::dispatch($vpsServer);
        return response()->json(['status' => 'started']);
    }

    public function output(VpsServer $vpsServer)
    {
        $logPath = "vpn-output/{$vpsServer->id}.log";
        if (!Storage::exists($logPath)) {
            return response()->json(['message' => 'Log file not found'], 404);
        }

        return response(Storage::get($logPath));
    }

    private function connectToServer(VpsServer $vpsServer)
    {
        if (empty($vpsServer->private_key) && empty($vpsServer->password)) {
            throw new \Exception("Either a password or a private key is required for authentication.");
        }

        $ssh = new SSH2($vpsServer->ip_address, $vpsServer->port, 30);

        if (!empty($vpsServer->private_key)) {
            $key = PublicKeyLoader::load($vpsServer->private_key);
            if (!$ssh->login($vpsServer->username, $key)) {
                throw new \Exception("SSH key authentication failed");
            }
        } elseif (!empty($vpsServer->password)) {
            if (!$ssh->login($vpsServer->username, $vpsServer->password)) {
                throw new \Exception("Password authentication failed");
            }
        }

        return $ssh;
    }

    private function fetchIkev2Status($ssh)
    {
        try {
            $status = trim($ssh->exec("systemctl is-active strongswan-starter"));
            return ($status === 'active') ? 'Running' : 'Not Running';
        } catch (\Exception $e) {
            Log::channel('ssh')->error("Error fetching IKEv2 status: " . $e->getMessage());
            return 'Error';
        }
    }
}
