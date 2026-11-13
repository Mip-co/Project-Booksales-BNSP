<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * RBAC sederhana. Pemakaian di routes: ->middleware('role:admin')
 * atau beberapa role sekaligus: ->middleware('role:admin,customer')
 */
class RoleMiddleware
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (! $user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        if (! in_array($user->role, $roles, true)) {
            return response()->json([
                'message' => 'Anda tidak memiliki hak akses untuk sumber daya ini.',
            ], 403);
        }

        return $next($request);
    }
}
