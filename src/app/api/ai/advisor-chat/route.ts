import { requireAuth } from "@/lib/auth";
import { FinancialAdvisorService } from "@/application/use-cases/ai/financial-advisor-service";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const session = await requireAuth();
    const body = await req.json();

    const { history = [], message = "" } = body;
    const trimmed = String(message).trim();

    if (!trimmed) {
      return new Response(JSON.stringify({ error: "Pesan tidak boleh kosong" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const generator = FinancialAdvisorService.streamAdvisorResponse(session.userId, history, trimmed);

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async pull(controller) {
        try {
          const { value, done } = await generator.next();
          if (done) {
            controller.close();
          } else if (value) {
            controller.enqueue(encoder.encode(value));
          }
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Gagal memproses permintaan AI";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
