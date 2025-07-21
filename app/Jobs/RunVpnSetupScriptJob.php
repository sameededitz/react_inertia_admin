<?php

namespace App\Jobs;

use App\Events\ScriptOutputBroadcasted;
use phpseclib3\Net\SFTP;
use phpseclib3\Net\SSH2;
use App\Models\VpsServer;
use Illuminate\Support\Facades\Log;
use phpseclib3\Crypt\PublicKeyLoader;
use Illuminate\Support\Facades\Storage;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class RunVpnSetupScriptJob implements ShouldQueue
{
    use Queueable, InteractsWithQueue, SerializesModels;

    public $server;

    public $tries = 3;
    public $timeout = 120;
    public $deleteWhenMissingModels = true;

    public function __construct(VpsServer $vpsServer)
    {
        $this->server = $vpsServer;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            $this->log("Started at: " . now() . "\n\n");

            $this->log("Connecting to server {$this->server->ip_address}..."."\n\n");

            $script = $this->getScript('setup-vpn.sh', [
                '{{VPN_DOMAIN}}' => $this->server->domain,
                '{{EMAIL}}' => 'vps@' . $this->server->domain,
                '{{SERVER_IP}}' => $this->server->ip_address,
            ]);
            $script2 = $this->getScript('setup-vpn-api.sh');

            $randomStr1 = substr(str_shuffle(md5(microtime())), 0, 10);
            $randomStr2 = substr(str_shuffle(md5(microtime())), 0, 10);
            $path1 = "/tmp/vpn_{$randomStr1}.sh";
            $path2 = "/tmp/api_{$randomStr2}.sh";

            $sftp = $this->connectToSftp();
            $this->log("Connected successfully via SFTP!\n\n");

            $this->log("Uploading setup script...\n\n");

            if (!$sftp->put($path1, $script)) {
                throw new \Exception("Failed to upload vpn script to the server.");
            }
            $this->log("Script uploaded successfully!\n\n");
    
            if (!$sftp->put($path2, $script2)) {
                throw new \Exception("Failed to upload vpn api script to the server.");
            }
            $this->log("Second script uploaded successfully!\n\n");

            $sftp->disconnect();
            $this->log("SFTP disconnected\n\n");

            $ssh = $this->connectToServer();
            $this->log("Connected successfully via SSH!\n\n");

            $ssh->setTimeout(1200); // 20 minutes timeout
    
            $this->log("Setting up VPN...\n\n");
            $this->log("Making scripts executable...\n\n");
            $this->log("Changing permissions for both scripts...\n\n");

            $ssh->exec("chmod +x {$path1} {$path2}");

            $this->log("Executing setup script...\n\n");

            $this->log("Running VPN setup script...");
            $ssh->exec("nohup bash {$path1} 2>&1", function ($str) {
                $this->log($str);
                usleep(50000);
            });
            $this->log("VPN setup script executed successfully!\n\n");

            $this->log("Running VPN API setup script...");
            $ssh->exec("nohup bash {$path2} 2>&1", function ($str) {
                $this->log($str);
                usleep(50000);
            });
            $this->log("VPN API setup script executed successfully!\n\n");

            $this->log("VPN setup completed successfully!\n\n");

            $this->log("Cleaning up temporary files...\n\n");
            $ssh->exec("rm -f {$path1} {$path2}");
            $this->log("Temporary files cleaned up successfully!\n\n");

            $this->log("Disconnecting from server...\n\n");
            $ssh->disconnect();
            $this->log("Disconnected successfully!\n\n");

            $this->log("Finished at: " . now() . "\n\n");

            $this->log("All done. Scripts executed and cleaned up.");

        } catch (\Exception $e) {
            $this->log("❌ ERROR: " . $e->getMessage());
            Log::channel('ssh')->error("Script failed: " . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
        }
    }

    private function getScript($filename, $replacements = [])
    {
        $file = storage_path("app/private/scripts/{$filename}");
        if (!file_exists($file)) {
            throw new \Exception("Script file not found: {$filename}");
        }

        $script = file_get_contents($file);

        foreach ($replacements as $key => $value) {
            $script = str_replace($key, $value, $script);
        }

        return $script;
    }

    private function log($text)
    {
        $path = "vpn-output/{$this->server->id}.log";
        Storage::append($path, trim($text));

        ScriptOutputBroadcasted::dispatch($text, $this->server->id);
    }

    private function connectToServer()
    {
        if (empty($this->server->private_key) && empty($this->server->password)) {
            throw new \Exception("Either a password or a private key is required for authentication.");
        }

        $ssh = new SSH2($this->server->ip_address, $this->server->port, 30);

        if (!empty($this->server->private_key)) {
            $key = PublicKeyLoader::load($this->server->private_key);
            if (!$ssh->login($this->server->username, $key)) {
                throw new \Exception("SSH key authentication failed");
            }
        } elseif (!empty($this->server->password)) {
            if (!$ssh->login($this->server->username, $this->server->password)) {
                throw new \Exception("Password authentication failed");
            }
        }

        return $ssh;
    }

    private function connectToSftp()
    {
        if (empty($this->server->private_key) && empty($this->server->password)) {
            throw new \Exception("Either a password or a private key is required for SFTP authentication.");
        }

        $sftp = new SFTP($this->server->ip_address, $this->server->port ?? 22, 30);

        if (!empty($this->server->private_key)) {
            $key = PublicKeyLoader::load($this->server->private_key);
            if (!$sftp->login($this->server->username, $key)) {
                throw new \Exception("SFTP key authentication failed");
            }
        } elseif (!empty($this->server->password)) {
            if (!$sftp->login($this->server->username, $this->server->password)) {
                throw new \Exception("SFTP password authentication failed");
            }
        }

        return $sftp;
    }
}
