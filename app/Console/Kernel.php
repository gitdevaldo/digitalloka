<?php

namespace App\Console;

use App\Console\Commands\SendRenewalRemindersCommand;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    protected $commands = [
        SendRenewalRemindersCommand::class,
    ];

    protected function schedule(Schedule $schedule): void
    {
        $schedule->command('digitalloka:send-renewal-reminders')->dailyAt('09:00');
    }
}
