import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface SendSMSRequest {
  phoneNumber: string;
  message: string;
  operator?: string;
}

interface TwilioResponse {
  sid: string;
  status: string;
  error_message?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { phoneNumber, message, operator } = await req.json() as SendSMSRequest;

    if (!phoneNumber || !message) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Numéro de téléphone et message requis"
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Récupérer les credentials Twilio depuis les variables d'environnement
    const twilioAccountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    const twilioAuthToken = Deno.env.get("TWILIO_AUTH_TOKEN");
    const twilioPhoneNumber = Deno.env.get("TWILIO_PHONE_NUMBER");

    if (!twilioAccountSid || !twilioAuthToken || !twilioPhoneNumber) {
      console.error("Configuration Twilio manquante");
      return new Response(
        JSON.stringify({
          success: false,
          error: "Configuration SMS non disponible"
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Formater le numéro de téléphone (ajouter +225 si nécessaire pour Côte d'Ivoire)
    let formattedPhone = phoneNumber.replace(/\s+/g, "");
    if (!formattedPhone.startsWith("+")) {
      if (formattedPhone.startsWith("0")) {
        formattedPhone = "+225" + formattedPhone.substring(1);
      } else if (!formattedPhone.startsWith("225")) {
        formattedPhone = "+225" + formattedPhone;
      } else {
        formattedPhone = "+" + formattedPhone;
      }
    }

    console.log(`Envoi SMS à: ${formattedPhone} via opérateur: ${operator || 'défaut'}`);

    // Envoyer le SMS via l'API Twilio
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`;
    const authHeader = btoa(`${twilioAccountSid}:${twilioAuthToken}`);

    const twilioResponse = await fetch(twilioUrl, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${authHeader}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        To: formattedPhone,
        From: twilioPhoneNumber,
        Body: message,
      }),
    });

    const twilioData: TwilioResponse = await twilioResponse.json();

    if (!twilioResponse.ok) {
      console.error("Erreur Twilio:", twilioData);
      return new Response(
        JSON.stringify({
          success: false,
          error: twilioData.error_message || "Erreur lors de l'envoi du SMS"
        }),
        {
          status: twilioResponse.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`SMS envoyé avec succès. SID: ${twilioData.sid}`);

    return new Response(
      JSON.stringify({
        success: true,
        messageSid: twilioData.sid,
        status: twilioData.status,
        phoneNumber: formattedPhone
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error("Erreur lors de l'envoi du SMS:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Erreur inconnue"
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});