<?php

use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\VpsServerController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::get('/vps-server', [VpsServerController::class, 'index'])->name('vps-server');
    Route::get('/vps-server/create', [VpsServerController::class, 'create'])->name('vps-server.create');
    Route::post('/vps-server/store', [VpsServerController::class, 'store'])->name('vps-server.store');
    Route::get('/vps-server/{vpsServer}/edit', [VpsServerController::class, 'edit'])->name('vps-server.edit');
    Route::put('/vps-server/{vpsServer}/update', [VpsServerController::class, 'update'])->name('vps-server.update');
    Route::delete('/vps-server/{vpsServer}/delete', [VpsServerController::class, 'destroy'])->name('vps-server.delete');
    Route::get('/vps-server/{vpsServer}/manage', [VpsServerController::class, 'manage'])->name('vps-server.manage');

    Route::get('/vps-server/{vpsServer}/stats', [VpsServerController::class, 'stats'])->name('vps-server.stats');
    Route::get('/vps-server/{vpsServer}/connected-users', [VpsServerController::class, 'connectedUsers'])->name('vps-server.connected-users');
    Route::post('/vps-server/{vpsServer}/run-script', [VpsServerController::class, 'runScript'])->name('vps-server.run-script');
    Route::post('/vps-server/{vpsServer}/output', [VpsServerController::class, 'output'])->name('vps-server.output');

});
