const DB_PATTERNS = [
  /relation "[\w.]+" does not exist/i,
  /column "[\w.]+" of relation "[\w.]+" does not exist/i,
  /duplicate key value violates unique constraint "[\w.]+"/i,
  /violates foreign key constraint "[\w.]+"/i,
  /violates check constraint "[\w.]+"/i,
  /null value in column "[\w.]+" violates not-null constraint/i,
  /permission denied for (?:table|schema|relation) "[\w.]+"/i,
  /insert or update on table "[\w.]+" violates/i,
  /syntax error at or near/i,
  /ERROR:\s/i,
];

const SANITIZED_MESSAGES: Record<string, string> = {
  duplicate: 'A record with that value already exists',
  'foreign key': 'Referenced record does not exist',
  'not-null': 'A required field is missing',
  'check constraint': 'A field value is invalid',
  'permission denied': 'Operation not permitted',
};

export function sanitizeDbError(rawMessage: string): string {
  const lower = rawMessage.toLowerCase();

  for (const [keyword, friendly] of Object.entries(SANITIZED_MESSAGES)) {
    if (lower.includes(keyword)) {
      return friendly;
    }
  }

  for (const pattern of DB_PATTERNS) {
    if (pattern.test(rawMessage)) {
      return 'An unexpected database error occurred';
    }
  }

  if (lower.includes('relation') || lower.includes('constraint') || lower.includes('violates')) {
    return 'An unexpected database error occurred';
  }

  return rawMessage;
}
