// =========================================================================
// Supabase Edge Function: lynk-webhook
// Endpoint: https://<PROJECT_REF>.supabase.co/functions/v1/lynk-webhook
// =========================================================================

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-lynk-signature, merchant-key',
};

serve(async (req: Request) => {
  // 1. Handle CORS Preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // 2. Only allow POST method
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const webhookSecret = Deno.env.get('LYNK_WEBHOOK_SECRET');

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase environment variables');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 3. Optional Secret Verification
    // Memeriksa header x-lynk-signature, merchant-key, atau query param ?secret=
    const url = new URL(req.url);
    const querySecret = url.searchParams.get('secret');
    const headerSecret = req.headers.get('merchant-key') || req.headers.get('x-lynk-signature');

    if (webhookSecret) {
      const providedSecret = headerSecret || querySecret;
      if (providedSecret !== webhookSecret) {
        console.warn('Unauthorized webhook request: secret mismatch');
        return new Response(
          JSON.stringify({ error: 'Unauthorized: Invalid webhook secret' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // 4. Parse Webhook Payload
    const payload = await req.json();
    console.log('Received Lynk.id webhook payload:', JSON.stringify(payload));

    // Ekstraksi data secara fleksibel (mendukung berbagai format payload Lynk.id)
    const rawData = payload.data || payload;

    const orderId =
      rawData.order_id ||
      rawData.id ||
      rawData.transaction_id ||
      rawData.invoice_id ||
      rawData.invoice_number ||
      rawData.ref_id ||
      payload.order_id ||
      payload.id;

    const rawEmail =
      rawData.customer_email ||
      rawData.buyer_email ||
      rawData.email ||
      rawData.customer?.email ||
      payload.customer_email ||
      payload.buyer_email ||
      payload.email;

    const rawName =
      rawData.customer_name ||
      rawData.buyer_name ||
      rawData.name ||
      rawData.customer?.name ||
      payload.customer_name ||
      payload.buyer_name ||
      'Pelanggan Lynk.id';

    const rawPhone =
      rawData.customer_phone ||
      rawData.buyer_phone ||
      rawData.phone ||
      rawData.whatsapp ||
      payload.customer_phone ||
      '';

    const status = (
      rawData.status ||
      rawData.payment_status ||
      payload.status ||
      payload.event ||
      'paid'
    ).toString().toLowerCase();

    // Verifikasi status pembayaran: pastikan statusnya sukses/paid
    const isSuccess = ['paid', 'success', 'settlement', 'completed', 'order.paid', 'payment.success'].some(
      (s) => status.includes(s)
    );

    if (!isSuccess) {
      console.log(`Payment status is '${status}', not a completed payment. Skipping.`);
      return new Response(
        JSON.stringify({ message: `Ignored status: ${status}` }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!rawEmail && !orderId) {
      return new Response(
        JSON.stringify({ error: 'Missing customer email or order_id in payload' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const cleanEmail = rawEmail ? rawEmail.trim().toLowerCase() : null;
    // Format kode akses dari Order ID: contoh LYNK-XXXX atau kode order asli
    const cleanCode = orderId
      ? String(orderId).trim().toUpperCase()
      : `LYNK-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // 5. Inisialisasi Supabase Admin Client
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    });

    // 6. Cek apakah Order ID sudah pernah dicatat sebelumnya (Idempoten)
    const { data: existingCode } = await supabase
      .from('access_codes')
      .select('id, code, status, used_by_email')
      .eq('code', cleanCode)
      .maybeSingle();

    if (existingCode) {
      console.log(`Order ${cleanCode} already exists in access_codes.`);
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Order already registered',
          code: existingCode.code,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 7. Simpan Order ID & Email ke tabel access_codes
    const note = `Lynk.id Order: ${cleanCode} | ${rawName} (${cleanEmail || '-'}) ${rawPhone ? `| WA: ${rawPhone}` : ''}`;
    
    const { error: insertError } = await supabase.from('access_codes').insert({
      code: cleanCode,
      type: 'paid',
      duration_days: 365,
      max_uses: 1,
      used_count: 0,
      status: 'active',
      used_by_email: cleanEmail,
      note: note,
    });

    if (insertError) {
      console.error('Error inserting access_code:', insertError);
      return new Response(
        JSON.stringify({ error: 'Database insert failed', details: insertError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 8. Jika akun pengguna dengan email tersebut sudah terdaftar di Supabase Auth,
    // langsung update profile pengguna menjadi has_access = true secara instan!
    if (cleanEmail) {
      try {
        // Ambil ID user dari auth.users via admin API
        const { data: usersData } = await supabase.auth.admin.listUsers();
        const existingUser = usersData?.users?.find(
          (u) => u.email?.toLowerCase() === cleanEmail
        );

        if (existingUser) {
          console.log(`Auto-activating existing user: ${existingUser.id} (${cleanEmail})`);
          
          // Update profile
          await supabase
            .from('profiles')
            .upsert({ id: existingUser.id, has_access: true, access_type: 'paid' });

          // Update access_code menjadi used
          await supabase
            .from('access_codes')
            .update({
              used_by_user_id: existingUser.id,
              used_count: 1,
              status: 'used',
              used_at: new Date().toISOString(),
            })
            .eq('code', cleanCode);
        }
      } catch (autoErr) {
        console.warn('Auto-link for existing user warning:', autoErr);
        // Tetap lanjut karena check_user_access() SQL akan meng-handle saat login berikutnya
      }
    }

    console.log(`Successfully registered Lynk.id access: ${cleanCode} for ${cleanEmail}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Lynk.id order processed successfully',
        code: cleanCode,
        activation_url: `https://amarawedding.id/?code=${cleanCode}`,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    console.error('Unexpected webhook error:', err);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
