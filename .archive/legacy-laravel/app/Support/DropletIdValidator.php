<?php

namespace App\Support;

class DropletIdValidator
{
    public static function parse(string $value): ?int
    {
        $dropletId = filter_var($value, FILTER_VALIDATE_INT);
        if ($dropletId === false) {
            return null;
        }

        $numeric = (int) $dropletId;

        return $numeric > 0 ? $numeric : null;
    }
}
