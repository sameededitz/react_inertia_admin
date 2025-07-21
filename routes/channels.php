<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('server.{id}', function ($user, $id) {
    return auth()->check();
});

Broadcast::channel('terminal.{id}', function ($user, $id) {
    return auth()->check();
});