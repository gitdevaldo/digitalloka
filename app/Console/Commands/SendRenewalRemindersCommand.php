<?php

namespace App\Console\Commands;

use App\Services\Growth\ReminderService;
use Illuminate\Console\Command;

class SendRenewalRemindersCommand extends Command
{
    protected $signature = 'digitalloka:send-renewal-reminders';

    protected $description = 'Queue and log renewal reminders for entitlements nearing expiry';

    public function handle(ReminderService $reminderService): int
    {
        $count = $reminderService->sendRenewalReminders();
        $this->info('Queued renewal reminders: ' . $count);

        return self::SUCCESS;
    }
}
