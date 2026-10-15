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
    const webhookSecret = Deno.env.get('LYNK_WEBHOOK_SECRET') || '7cDRpQgca1z2oGKkfoGdsikbIPKpv2QA';

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase environment variables');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 3. Webhook Request Logging
    const url = new URL(req.url);
    const querySecret = url.searchParams.get('secret');
    const headerMerchantKey = req.headers.get('merchant-key');
    const headerSignature = req.headers.get('x-lynk-signature') || req.headers.get('x-signature');

    console.log('Incoming Lynk.id Webhook Headers:', {
      'merchant-key': headerMerchantKey,
      'x-lynk-signature': headerSignature,
      'querySecret': querySecret,
    });

    // 4. Parse Webhook Payload
    const payload = await req.json();
    console.log('Received Lynk.id webhook payload:', JSON.stringify(payload));

    // Lynk.id membungkus data transaksi di payload.data.message_data
    const dataObj = payload.data || {};
    const msgData = dataObj.message_data || payload.message_data || {};

    const orderId =
      msgData.order_id ||
      msgData.orderId ||
      msgData.id ||
      msgData.trx_id ||
      msgData.trxId ||
      msgData.transaction_id ||
      msgData.transactionId ||
      msgData.invoice_id ||
      msgData.invoiceId ||
      msgData.ref_id ||
      msgData.reference_id ||
      msgData.referenceId ||
      dataObj.order_id ||
      dataObj.orderId ||
      dataObj.id ||
      dataObj.transaction_id ||
      dataObj.invoice_id ||
      dataObj.ref_id ||
      payload.order_id ||
      payload.id;

    const rawEmail =
      msgData.customer_email ||
      msgData.customerEmail ||
      msgData.buyer_email ||
      msgData.buyerEmail ||
      msgData.email ||
      msgData.user_email ||
      msgData.customer?.email ||
      dataObj.customer_email ||
      dataObj.buyer_email ||
      dataObj.email ||
      payload.customer_email ||
      payload.buyer_email ||
      payload.email;

    const rawName =
      msgData.customer_name ||
      msgData.customerName ||
      msgData.buyer_name ||
      msgData.buyerName ||
      msgData.name ||
      msgData.customer?.name ||
      dataObj.customer_name ||
      dataObj.buyer_name ||
      dataObj.name ||
      payload.customer_name ||
      'Pelanggan Lynk.id';

    const rawPhone =
      msgData.customer_phone ||
      msgData.customerPhone ||
      msgData.phone ||
      msgData.whatsapp ||
      msgData.phone_number ||
      dataObj.customer_phone ||
      dataObj.phone ||
      payload.customer_phone ||
      '';

    // Ekstraksi info produk untuk memfilter hanya pembelian produk Amara
    const rawProductName =
      msgData.product_name ||
      msgData.productName ||
      msgData.item_name ||
      msgData.itemName ||
      msgData.title ||
      msgData.product_title ||
      msgData.name ||
      dataObj.product_name ||
      dataObj.title ||
      dataObj.item_name ||
      payload.product_name ||
      payload.title ||
      '';

    const itemsList = Array.isArray(msgData.items)
      ? msgData.items
      : Array.isArray(dataObj.items)
      ? dataObj.items
      : Array.isArray(payload.items)
      ? payload.items
      : [];

    const allProductNames = [
      rawProductName,
      ...itemsList.map((it: any) => it.product_name || it.name || it.title || it.item_name || '')
    ].filter(Boolean).join(' ');

    // Lynk.id akun toko "Ramai" menjual banyak produk.
    // Filter ketat: Hanya proses transaksi jika produk adalah Amara / Wedding
    if (allProductNames) {
      const lowerNames = allProductNames.toLowerCase();
      const isAmaraProduct =
        lowerNames.includes('amara') ||
        lowerNames.includes('wedding') ||
        lowerNames.includes('nikah');

      if (!isAmaraProduct) {
        console.log(`[Lynk.id Webhook] Mengabaikan transaksi bukan Amara: "${allProductNames}" (Order: ${orderId}).`);
        return new Response(
          JSON.stringify({
            success: true,
            message: `Ignored non-Amara product: "${allProductNames}"`,
            product: allProductNames
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    const event = (payload.event || '').toString().toLowerCase();
    const action = (dataObj.message_action || '').toString().toLowerCase();
    const status = (
      msgData.status ||
      msgData.payment_status ||
      dataObj.status ||
      dataObj.payment_status ||
      payload.status ||
      action ||
      'paid'
    ).toString().toLowerCase();

    // Verifikasi: Lynk.id mengirim event 'payment.received' atau message_action 'success'
    const isSuccess =
      event.includes('payment.received') ||
      event.includes('paid') ||
      event.includes('success') ||
      action.includes('success') ||
      ['paid', 'success', 'settlement', 'completed', 'order.paid', 'payment.success', 'payment.received', 'free', 'done', 'approved'].some(
        (s) => status.includes(s)
      );

    if (!isSuccess) {
      console.log(`Payment event '${event}', action '${action}', status '${status}', skipping.`);
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

    // 7. Simpan Order ID ke tabel access_codes
    // PENTING: Biarkan used_by_email: null dan status: 'active' agar kode fleksibel
    // bisa diklaim oleh email pembeli ATAU email lain yang memasukkan kode lisensi tersebut.
    const note = `Lynk.id Order: ${cleanCode} | Pembeli: ${cleanEmail || '-'} | ${rawName} ${rawPhone ? `| WA: ${rawPhone}` : ''} | Produk: ${allProductNames || 'Amara Wedding'}`;
    
    const { error: insertError } = await supabase.from('access_codes').insert({
      code: cleanCode,
      type: 'paid',
      duration_days: 365,
      max_uses: 1,
      used_count: 0,
      status: 'active',
      used_by_email: null,
      note: note,
    });

    if (insertError) {
      console.error('Error inserting access_code:', insertError);
      return new Response(
        JSON.stringify({ error: 'Database insert failed', details: insertError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 8. Kirim notifikasi / email aktivasi
    if (cleanEmail) {
      try {
        const { data: usersData } = await supabase.auth.admin.listUsers();
        const existingUser = usersData?.users?.find(
          (u) => u.email?.toLowerCase() === cleanEmail
        );

        if (existingUser) {
          console.log(`Existing user found for order ${cleanCode}: ${cleanEmail}. Sending magic link without premature lock.`);
          // JANGAN kunci kode sebagai 'used' sebelum pengguna membuka tautan atau mengklaimnya!
          try {
            await supabase.auth.signInWithOtp({
              email: cleanEmail,
              options: {
                emailRedirectTo: `https://amarawedding.id`
              }
            });
            console.log(`Magic login link sent to existing user: ${cleanEmail}`);
          } catch (otpErr) {
            console.warn('Could not send magic link to existing user:', otpErr);
          }
        } else {
          // User baru belum terdaftar -> Otomatis buat akun & kirim Email Undangan Resmi via Supabase!
          console.log(`Inviting new user via Supabase Auth email: ${cleanEmail}`);
          const { error: inviteErr } = await supabase.auth.admin.inviteUserByEmail(cleanEmail, {
            redirectTo: `https://amarawedding.id`,
            data: {
              full_name: rawName || 'Calon Pengantin',
              license_code: cleanCode,
            }
          });

          if (inviteErr) {
            console.error('Failed sending inviteUserByEmail:', inviteErr);
          } else {
            console.log(`Invite email successfully triggered via Supabase for: ${cleanEmail}`);
          }
        }
      } catch (autoErr) {
        console.warn('Auto-link or email invitation error:', autoErr);
      }
    }

    console.log(`Successfully registered Lynk.id access: ${cleanCode} (purchased by ${cleanEmail})`);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Lynk.id order processed successfully',
        code: cleanCode,
        activation_url: `https://amarawedding.id`,
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
