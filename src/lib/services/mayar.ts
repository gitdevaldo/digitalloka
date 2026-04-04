const MAYAR_BASE_URL = process.env.MAYAR_BASE_URL || 'https://api.mayar.id/hl/v1';

interface MayarInvoiceItem {
  quantity: number;
  rate: number;
  description: string;
}

interface CreateInvoiceParams {
  name: string;
  email: string;
  mobile: string;
  description: string;
  redirectUrl: string;
  expiredAt: string;
  items: MayarInvoiceItem[];
  extraData?: Record<string, string>;
}

interface MayarInvoiceResponse {
  statusCode: number;
  messages: string;
  data: {
    id: string;
    transactionId: string;
    link: string;
    expiredAt?: number;
    extraData?: Record<string, string>;
  };
}

interface CreatePaymentParams {
  name: string;
  email: string;
  amount: number;
  mobile: string;
  redirectUrl: string;
  description: string;
  expiredAt: string;
}

interface MayarPaymentResponse {
  statusCode: number;
  messages: string;
  data: {
    id: string;
    transaction_id: string;
    transactionId: string;
    link: string;
  };
}

function getApiKey(): string {
  const key = process.env.MAYAR_API_KEY;
  if (!key) throw new Error('MAYAR_API_KEY is not configured');
  return key;
}

async function mayarFetch<T>(endpoint: string, body: Record<string, unknown>): Promise<T> {
  const response = await fetch(`${MAYAR_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${getApiKey()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Mayar API error (${response.status}): ${text}`);
  }

  return response.json() as Promise<T>;
}

export async function createInvoice(params: CreateInvoiceParams): Promise<MayarInvoiceResponse> {
  return mayarFetch<MayarInvoiceResponse>('/invoice/create', {
    name: params.name,
    email: params.email,
    mobile: params.mobile,
    description: params.description,
    redirectUrl: params.redirectUrl,
    expiredAt: params.expiredAt,
    items: params.items,
    extraData: params.extraData,
  });
}

export async function createPayment(params: CreatePaymentParams): Promise<MayarPaymentResponse> {
  return mayarFetch<MayarPaymentResponse>('/payment/create', {
    name: params.name,
    email: params.email,
    amount: params.amount,
    mobile: params.mobile,
    redirectUrl: params.redirectUrl,
    description: params.description,
    expiredAt: params.expiredAt,
  });
}
