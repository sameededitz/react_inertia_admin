<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\VpsServer;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::factory()->admin()->create();
        User::factory()->user()->create();

        // VpsServer::factory(10)->create();
    }
}
