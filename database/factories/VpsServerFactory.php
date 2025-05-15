<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\VpsServer>
 */
class VpsServerFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => $this->faker->word,
            'username' => $this->faker->userName,
            'ip_address' => $this->faker->unique()->ipv4,
            'private_key' => $this->faker->text,
            'password' => $this->faker->password,
            'port' => $this->faker->numberBetween(1, 65535),
            'domain' => $this->faker->domainName,
            'status' => $this->faker->boolean,
        ];
    }
}
