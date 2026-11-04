/**
 * src/server/http/response.ts
 * Helpers para respuestas HTTP consistentes en Route Handlers.
 * Convención API: { data, meta } para éxito, { error } para fallo.
 */
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AuthError } from "@/server/permissions/guard";

export interface ApiSuccess<T> {
  data: T;
  meta?: Record<string, unknown>;
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    requestId?: string;
    details?: unknown;
  };
}

export function ok<T>(
  data: T,
  meta?: Record<string, unknown>,
  status = 200
): NextResponse<ApiSuccess<T>> {
  return NextResponse.json({ data, meta }, { status });
}

export function created<T>(data: T): NextResponse<ApiSuccess<T>> {
  return ok(data, undefined, 201);
}

export function handleError(err: unknown, requestId?: string): NextResponse<ApiError> {
  if (err instanceof ZodError) {
    return NextResponse.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "Datos de entrada inválidos.",
          requestId,
          details: err.flatten(),
        },
      },
      { status: 400 }
    );
  }

  if (err instanceof AuthError) {
    return NextResponse.json(
      {
        error: {
          code: err.status === 401 ? "UNAUTHENTICATED" : "UNAUTHORIZED",
          message: err.message,
          requestId,
        },
      },
      { status: err.status }
    );
  }

  // Error interno — no exponer detalles al cliente
  console.error("[api] Internal error:", err);
  return NextResponse.json(
    {
      error: {
        code: "INTERNAL_ERROR",
        message: "Error interno del servidor. Intente de nuevo.",
        requestId,
      },
    },
    { status: 500 }
  );
}
